// Create trip
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createTrip(payload) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/trip/create-trip`, {
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["active-trips"]);
      queryClient.invalidateQueries(["inactive-trips"]);
    },
  });
}

// Update trip status
async function updateTripStatus(tripId, status) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/trip/update-trip-status/${tripId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update trip status");
  }

  return res.json();
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, status }) => updateTripStatus(tripId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["active-trips"]);
      queryClient.invalidateQueries(["inactive-trips"]);
    },
  });
}
