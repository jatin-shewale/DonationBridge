import client from "./client.js";

export const listRequests = () => client.get("/requests/").then((r) => r.data);
export const createRequest = (payload) => client.post("/requests/", payload).then((r) => r.data);
export const acceptRequest = (id) => client.post(`/requests/${id}/accept/`).then((r) => r.data);
export const rejectRequest = (id) => client.post(`/requests/${id}/reject/`).then((r) => r.data);
export const completeRequest = (id) => client.post(`/requests/${id}/complete/`).then((r) => r.data);
