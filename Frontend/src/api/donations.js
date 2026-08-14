import client from "./client.js";

export const listDonations = () => client.get("/donations/").then((r) => r.data);
export const getDonation = (id) => client.get(`/donations/${id}/`).then((r) => r.data);
export const createDonation = (payload) => {
  const form = new FormData();
  form.append("title", payload.title);
  if (payload.description) form.append("description", payload.description);
  if (payload.image) form.append("image", payload.image);
  return client.post("/donations/", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};
export const updateDonation = (id, payload) => client.patch(`/donations/${id}/`, payload).then((r) => r.data);
export const deleteDonation = (id) => client.delete(`/donations/${id}/`);
export const confirmDonation = (id) => client.post(`/donations/${id}/confirm/`).then((r) => r.data);

export const addDonationItem = (donationId, payload) =>
  client.post(`/donations/${donationId}/items/`, payload).then((r) => r.data);
export const updateDonationItem = (donationId, itemId, payload) =>
  client.patch(`/donations/${donationId}/items/${itemId}/`, payload).then((r) => r.data);
export const deleteDonationItem = (donationId, itemId) =>
  client.delete(`/donations/${donationId}/items/${itemId}/`);

export const getDonorDashboardStats = () => client.get("/donations/stats/dashboard/").then((r) => r.data);
export const getAdminSystemStats = () => client.get("/admin-stats/stats/").then((r) => r.data);
