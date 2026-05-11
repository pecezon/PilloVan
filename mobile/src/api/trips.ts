import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useActiveTrips(userId: string | undefined) {
  return useQuery({
    queryKey: ['active-trips', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/trip/get-active-trips-by-user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useInactiveTrips(userId: string | undefined) {
  return useQuery({
    queryKey: ['inactive-trips', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/trip/get-inactive-trips-by-user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      const res = await api.put(`/trip/update-trip-status/${tripId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      queryClient.invalidateQueries({ queryKey: ['inactive-trips'] });
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripData: any) => {
      const res = await api.post('/trip/create-trip', tripData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      queryClient.invalidateQueries({ queryKey: ['inactive-trips'] });
    },
  });
}
