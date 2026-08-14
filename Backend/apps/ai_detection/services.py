"""
AI detection service.

This module supports three backends:

- "stub": deterministic placeholder used when no real AI key/model is
  configured.
- "gemini": Google Gemini vision with JSON output over the public REST API.
- "yolo": local Ultralytics YOLO inference, kept as an offline fallback.

The public entry point stays `detect_objects(image_file)` so the rest of the
app does not need to know which backend is active.
"""
from __future__ import annotations

import base64
import json
import urllib.error
import urllib.request
from collections import Counter
from dataclasses import dataclass, field
from typing import Any, List

from django.conf import settings

# Donation-friendly labels we want to surface to users. Gemini can return
# broader labels, so we normalize common variants into this taxonomy.
LABEL_ALIASES = {
    "backpack": "bags",
    "bag": "bags",
    "handbag": "bags",
    "school bag": "bags",
    "school_bag": "bags",
    "book": "books",
    "books": "books",
    "blanket": "blankets",
    "blankets": "blankets",
    "bottle": "bottles",
    "bottles": "bottles",
    "clothing": "clothes",
    "clothes": "clothes",
    "dress": "clothes",
    "electronics": "electronics",
    "electronic": "electronics",
    "furniture": "furniture",
    "shoe": "shoes",
    "shoes": "shoes",
    "teddy bear": "toys",
    "teddy_bear": "toys",
    "toy": "toys",
    "toys": "toys",
    "utensil": "utensils",
    "utensils": "utensils",
}

GEMINI_DETECTION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "objects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "confidence": {"type": "number"},
                    "bbox": {
                        "type": "array",
                        "items": {"type": "integer"},
                        "minItems": 4,
                        "maxItems": 4,
                    },
                },
                "required": ["label", "confidence", "bbox"],
            },
        }
    },
    "required": ["objects"],
}


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: List[float] = field(default_factory=lambda: [0, 0, 0, 0])


class DetectionResult:
    def __init__(self, detections: List[Detection], model: str, threshold: float, note: str = ""):
        self.detections = detections
        self.model = model
        self.threshold = threshold
        self.note = note

    @property
    def counts(self):
        return dict(Counter(d.class_name for d in self.detections))

    def to_dict(self):
        return {
            "detections": [
                {"class_name": d.class_name, "confidence": round(d.confidence, 4), "bbox": d.bbox}
                for d in self.detections
            ],
            "counts": self.counts,
            "model": self.model,
            "threshold": self.threshold,
            "note": self.note,
        }


class DetectionError(Exception):
    """Raised for invalid images or inference failures."""


def _normalize_label(label: str) -> str:
    normalized = label.strip().lower().replace("-", "_").replace(" ", "_")
    return LABEL_ALIASES.get(label.strip().lower(), LABEL_ALIASES.get(normalized, normalized))


def _read_image_bytes(image_file) -> bytes:
    image_bytes = image_file.read()
    if hasattr(image_file, "seek"):
        image_file.seek(0)
    return image_bytes


def _strip_code_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```json").removeprefix("```").strip()
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()
    return cleaned


def _build_detection_result(items: list[dict[str, Any]], model: str, threshold: float, note: str = "") -> DetectionResult:
    detections: List[Detection] = []
    for item in items:
        raw_label = str(item.get("label", "")).strip()
        if not raw_label:
            continue

        bbox = item.get("bbox", [0, 0, 0, 0])
        if not isinstance(bbox, list) or len(bbox) != 4:
            continue

        try:
            confidence = float(item.get("confidence", 0))
            bbox_values = [float(v) for v in bbox]
        except (TypeError, ValueError):
            continue

        detections.append(
            Detection(
                class_name=_normalize_label(raw_label),
                confidence=confidence,
                bbox=bbox_values,
            )
        )

    return DetectionResult(detections=detections, model=model, threshold=threshold, note=note)


def _fallback_detection(model: str, threshold: float, note: str) -> DetectionResult:
    return DetectionResult(
        detections=[
            Detection(
                class_name="unknown_item",
                confidence=0.1,
                bbox=[0, 0, 1000, 1000],
            )
        ],
        model=model,
        threshold=threshold,
        note=note,
    )


def _run_stub(image_file, threshold: float) -> DetectionResult:
    return DetectionResult(
        detections=[],
        model="stub-v1 (no ML backend installed)",
        threshold=threshold,
        note=(
            "AI_BACKEND is set to 'stub'. No real detection was run. "
            "Set GEMINI_API_KEY and use the Gemini backend to enable real detection."
        ),
    )


def _run_yolo(image_file, threshold: float) -> DetectionResult:
    try:
        from ultralytics import YOLO
    except ImportError as exc:
        raise DetectionError(
            "YOLO backend selected but 'ultralytics' is not installed. "
            "Run `pip install ultralytics` or switch AI_BACKEND to 'stub'."
        ) from exc

    model_path = settings.YOLO_MODEL_PATH
    cache = getattr(_run_yolo, "_cache", {})
    if model_path not in cache:
        try:
            cache[model_path] = YOLO(model_path)
        except Exception as exc:
            raise DetectionError(f"Could not load YOLO model '{model_path}': {exc}") from exc
        _run_yolo._cache = cache

    model = cache[model_path]

    try:
        results = model.predict(source=image_file, conf=threshold, verbose=False)
    except Exception as exc:
        raise DetectionError(f"YOLO inference failed: {exc}") from exc

    detections: List[Detection] = []
    for result in results:
        names = result.names
        for box in result.boxes:
            raw_class = names[int(box.cls[0])]
            mapped_class = _normalize_label(raw_class)
            confidence = float(box.conf[0])
            xyxy = [float(v) for v in box.xyxy[0].tolist()]
            detections.append(Detection(class_name=mapped_class, confidence=confidence, bbox=xyxy))

    return DetectionResult(
        detections=detections,
        model=f"yolo:{model_path}",
        threshold=threshold,
    )


def _extract_text_from_gemini_response(payload: dict[str, Any]) -> str:
    if isinstance(payload.get("text"), str) and payload["text"].strip():
        return payload["text"]

    for candidate in payload.get("candidates", []):
        content = candidate.get("content", {})
        for part in content.get("parts", []):
            text = part.get("text")
            if isinstance(text, str) and text.strip():
                return text

    for step in payload.get("steps", []):
        if step.get("type") != "model_output":
            continue
        for item in step.get("content", []):
            text = item.get("text")
            if isinstance(text, str) and text.strip():
                return text

    raise DetectionError("Gemini response did not include any text output.")


def _call_gemini(image_file, prompt: str) -> dict[str, Any]:
    api_key = (settings.GEMINI_API_KEY or "").strip()
    if not api_key:
        raise DetectionError(
            "Gemini backend selected but GEMINI_API_KEY is not set in the environment."
        )

    image_bytes = _read_image_bytes(image_file)
    mime_type = getattr(image_file, "content_type", None) or "image/jpeg"
    encoded_image = base64.b64encode(image_bytes).decode("ascii")

    body = {
        "model": settings.GEMINI_MODEL,
        "input": [
            {"type": "text", "text": prompt},
            {
                "type": "image",
                "data": encoded_image,
                "mime_type": mime_type,
            },
        ],
        "response_format": {
            "type": "text",
            "mime_type": "application/json",
            "schema": GEMINI_DETECTION_SCHEMA,
        },
    }

    url = "https://generativelanguage.googleapis.com/v1beta/interactions?key=" + api_key
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace") if hasattr(exc, "read") else str(exc)
        raise DetectionError(f"Gemini API request failed: {detail}") from exc
    except urllib.error.URLError as exc:
        raise DetectionError(f"Gemini API request could not be reached: {exc.reason}") from exc
    except json.JSONDecodeError as exc:
        raise DetectionError(f"Gemini API returned invalid JSON: {exc}") from exc


def _run_gemini(image_file, threshold: float) -> DetectionResult:
    conservative_prompt = (
        "You are detecting donation-relevant objects in an image for a physical-donation app. "
        "Return only clearly visible items. Be conservative and omit uncertain objects. "
        "Use user-friendly labels such as books, clothes, shoes, toys, bags, blankets, "
        "electronics, furniture, utensils, bottles, or school_supplies. "
        "If nothing obvious is present, return an empty objects array. "
        "Bounding boxes must be normalized to integers in the 0-1000 range as [ymin, xmin, ymax, xmax]."
    )

    assertive_prompt = (
        "Detect the most prominent donation-relevant object(s) in this image and return at least one result "
        "if there is any visible object at all. Prefer practical labels such as books, clothes, shoes, toys, "
        "bags, blankets, electronics, furniture, utensils, bottles, or school_supplies. "
        "If the scene is ambiguous, make your best estimate and assign low confidence. "
        "Use one full-image bbox [0, 0, 1000, 1000] only when the object is too unclear for a tighter box. "
        "Return JSON only."
    )

    payload = _call_gemini(image_file, conservative_prompt)

    text = _extract_text_from_gemini_response(payload)
    try:
        parsed = json.loads(_strip_code_fences(text))
    except json.JSONDecodeError as exc:
        raise DetectionError(f"Gemini returned invalid structured output: {exc}") from exc

    objects = parsed.get("objects", [])
    if not isinstance(objects, list):
        raise DetectionError("Gemini returned an invalid objects list.")

    if not objects:
        payload = _call_gemini(image_file, assertive_prompt)
        text = _extract_text_from_gemini_response(payload)
        try:
            parsed = json.loads(_strip_code_fences(text))
        except json.JSONDecodeError as exc:
            raise DetectionError(f"Gemini returned invalid structured output: {exc}") from exc
        objects = parsed.get("objects", [])
        if not isinstance(objects, list):
            raise DetectionError("Gemini returned an invalid objects list.")
        if not objects:
            return _fallback_detection(
                model=f"gemini:{settings.GEMINI_MODEL}",
                threshold=threshold,
                note=(
                    f"Gemini flash model completed the analysis using {settings.GEMINI_MODEL}, "
                    "but it could not confidently identify an object. A low-confidence placeholder "
                    "result is shown so you can continue manually."
                ),
            )

    note = f"Gemini flash model completed the analysis using {settings.GEMINI_MODEL}. Review the results and add any missed items manually if needed."
    return _build_detection_result(
        items=objects,
        model=f"gemini:{settings.GEMINI_MODEL}",
        threshold=threshold,
        note=note,
    )


def detect_objects(image_file) -> DetectionResult:
    """
    Single entry point used by the API view.

    Preference order:
    1. Gemini if GEMINI_API_KEY is configured.
    2. YOLO if AI_BACKEND=yolo.
    3. Stub fallback.
    """
    threshold = settings.AI_CONFIDENCE_THRESHOLD

    if getattr(settings, "GEMINI_API_KEY", "").strip():
        return _run_gemini(image_file, threshold)

    backend = settings.AI_BACKEND
    if backend == "yolo":
        return _run_yolo(image_file, threshold)
    return _run_stub(image_file, threshold)
