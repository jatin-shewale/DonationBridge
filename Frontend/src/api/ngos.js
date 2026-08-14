import client from "./client.js";

export const listNGOs = () => client.get("/ngo/list/").then((r) => r.data);
export const getNGO = (id) => client.get(`/ngo/list/${id}/`).then((r) => r.data);
export const getMyNGOProfile = () => client.get("/ngo/profile/").then((r) => r.data);
export const updateMyNGOProfile = (payload) => client.patch("/ngo/profile/", payload).then((r) => r.data);

export const listMyRequirements = () => client.get("/ngo/requirements/").then((r) => r.data);
export const createRequirement = (payload) => client.post("/ngo/requirements/", payload).then((r) => r.data);
export const updateRequirement = (id, payload) => client.patch(`/ngo/requirements/${id}/`, payload).then((r) => r.data);
export const deleteRequirement = (id) => client.delete(`/ngo/requirements/${id}/`);

export const getDonationMatches = (donationId) =>
  client.get(`/matching/donations/${donationId}/`).then((r) => r.data);

// Admin
export const listNGOApplications = (status) =>
  client.get("/admin/ngo-applications/", { params: status ? { status } : {} }).then((r) => r.data);
export const approveNGO = (id) => client.patch(`/admin/ngo-applications/${id}/approve/`).then((r) => r.data);
export const rejectNGO = (id) => client.patch(`/admin/ngo-applications/${id}/reject/`).then((r) => r.data);
