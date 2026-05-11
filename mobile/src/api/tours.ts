import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCompanyTours(companyId: string | undefined) {
  return useQuery({
    queryKey: ['tours', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await api.get(`/tour/get-tours-by-company/${companyId}`);
      return res.data;
    },
    enabled: !!companyId,
  });
}

export function useCreateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tourData: any) => {
      const res = await api.post('/tour/create-tour', tourData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
  });
}
