import client from "./client";

export async function fetchAnnouncements(params = {}) {
  const { data } = await client.get("/announcements", { params });
  return data;
}

export async function fetchRecentAnnouncements(limit = 4) {
  const { data } = await client.get("/announcements/recent", { params: { limit } });
  return data;
}

export async function fetchAnnouncementById(id) {
  const { data } = await client.get(`/announcements/${id}`);
  return data;
}

export async function createAnnouncement(payload) {
  const { data } = await client.post("/announcements", payload);
  return data;
}

export async function updateAnnouncement(id, payload) {
  const { data } = await client.put(`/announcements/${id}`, payload);
  return data;
}

export async function deleteAnnouncement(id) {
  const { data } = await client.delete(`/announcements/${id}`);
  return data;
}

export const ANNOUNCEMENT_CATEGORIES = [
  "General",
  "Ministry",
  "Youth",
  "Finance",
  "ICT",
  "Other",
];

export const ANNOUNCEMENT_PRIORITIES = ["Normal", "High"];

