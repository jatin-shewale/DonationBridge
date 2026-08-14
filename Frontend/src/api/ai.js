import client from "./client.js";

export const analyzeImage = (file) => {
  const form = new FormData();
  form.append("image", file);
  return client.post("/ai/detect/", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};
