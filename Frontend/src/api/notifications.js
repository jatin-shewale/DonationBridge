import client from "./client.js";

export const listNotifications = () => client.get("/notifications/").then((r) => r.data);
export const markNotificationRead = (id) => client.patch(`/notifications/${id}/read/`).then((r) => r.data);
