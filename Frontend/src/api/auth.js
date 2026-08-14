import client from "./client.js";

export const registerDonor = (payload) => client.post("/auth/register/donor/", payload).then((r) => r.data);
export const registerNGO = (payload) => client.post("/auth/register/ngo/", payload).then((r) => r.data);
export const login = (payload) => client.post("/auth/login/", payload).then((r) => r.data);
export const getMe = () => client.get("/auth/me/").then((r) => r.data);
export const updateMe = (payload) => client.patch("/auth/me/", payload).then((r) => r.data);
