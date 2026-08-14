"""
Rule-based, fully explainable NGO matching. This is intentionally NOT
presented as "AI" - it's a transparent scoring function so donors and NGOs
can see exactly why a match was suggested.

Scoring (0-100), per NGO:
  - item overlap:      how many of the NGO's active requirement item_names
                        are present in the donation      -> up to 50 pts
  - quantity coverage:  for overlapping items, how much of the required
                        quantity this donation could cover -> up to 35 pts
  - priority weight:    overlapping HIGH priority requirements count extra -> up to 15 pts
NGOs with no active requirements score 0 and are excluded.
"""
from dataclasses import dataclass, field
from typing import List

from apps.ngos.models import NGO, NGORequirement

PRIORITY_WEIGHT = {"high": 1.0, "medium": 0.6, "low": 0.3}


@dataclass
class MatchResult:
    ngo_id: int
    ngo_name: str
    match_score: int
    matched_items: List[str] = field(default_factory=list)
    reason: str = ""

    def to_dict(self):
        return {
            "ngo": self.ngo_id,
            "ngo_name": self.ngo_name,
            "match_score": self.match_score,
            "matched_items": self.matched_items,
            "reason": self.reason,
        }


def match_donation_to_ngos(donation_items: dict) -> List[MatchResult]:
    """
    donation_items: {item_name: quantity} for the donation being matched.
    Returns MatchResult list sorted by score descending, approved NGOs only.
    """
    results: List[MatchResult] = []

    ngos = NGO.objects.filter(approval_status=NGO.ApprovalStatus.APPROVED).prefetch_related("requirements")

    for ngo in ngos:
        active_reqs = [r for r in ngo.requirements.all() if r.active]
        if not active_reqs:
            continue

        matched_items = []
        overlap_points = 0.0
        coverage_points = 0.0
        priority_points = 0.0

        for req in active_reqs:
            donated_qty = donation_items.get(req.item_name, 0)
            if donated_qty <= 0:
                continue
            matched_items.append(req.item_name)
            overlap_points += 1
            coverage_ratio = min(donated_qty / req.required_quantity, 1.0)
            coverage_points += coverage_ratio
            priority_points += PRIORITY_WEIGHT.get(req.priority, 0.5)

        if not matched_items:
            continue

        overlap_score = min(overlap_points / len(active_reqs), 1.0) * 50
        coverage_score = (coverage_points / len(matched_items)) * 35
        priority_score = min(priority_points / len(matched_items), 1.0) * 15
        total = round(overlap_score + coverage_score + priority_score)

        high_priority_matches = [
            r.item_name for r in active_reqs
            if r.item_name in matched_items and r.priority == "high"
        ]
        reason_parts = [f"Matches {len(matched_items)}/{len(active_reqs)} active requirement(s)"]
        if high_priority_matches:
            reason_parts.append(f"including high-priority need(s): {', '.join(high_priority_matches)}")
        reason = "; ".join(reason_parts) + "."

        results.append(MatchResult(
            ngo_id=ngo.id,
            ngo_name=ngo.organization_name,
            match_score=total,
            matched_items=matched_items,
            reason=reason,
        ))

    results.sort(key=lambda r: r.match_score, reverse=True)
    return results
