// Create trip
import { useMutation } from "@tanstack/react-query";

async function createTrip(payload) {
  const res = await fetch("http://localhost:3001/trip/create-trip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create trip");
  }

  return res.json();
}

export function useCreateTrip() {
  return useMutation({
    mutationFn: (payload) => createTrip(payload),
  });
}
