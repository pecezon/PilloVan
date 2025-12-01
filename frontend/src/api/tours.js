// Create tour
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createTour(payload) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/tour/create-tour`, {
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createTour(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["tours"]);
    },
  });
}
