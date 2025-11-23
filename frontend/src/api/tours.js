// Create tour
import { useMutation } from "@tanstack/react-query";

async function createTour(payload) {
  const res = await fetch("http://localhost:3001/tour/create-tour", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create tour");
  }

  return res.json();
}

export function useCreateTour() {
  return useMutation({
    mutationFn: (payload) => createTour(payload),
  });
}
