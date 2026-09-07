import client from "./client";

export async function fetchEvents(params = {}) {
  const { data } = await client.get("/events", { params });
  return data;
}

export async function fetchFeaturedEvents(limit = 4) {
  const { data } = await client.get("/events/featured", { params: { limit } });
  return data;
}

export async function fetchEventById(id) {
  const { data } = await client.get(`/events/${id}`);
  return data;
}

export async function createEvent(payload) {
  const { data } = await client.post("/events", payload);
  return data;
}

export async function updateEvent(id, payload) {
  const { data } = await client.put(`/events/${id}`, payload);
  return data;
}

export async function deleteEvent(id) {
  const { data } = await client.delete(`/events/${id}`);
  return data;
}

export const EVENT_CATEGORIES = [
  "Service",
  "Conference",
  "Outreach",
  "Training",
  "Youth",
  "Other",
];
