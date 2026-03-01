import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Gender, type HealthRecord } from '../backend';

export function useGetAllRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<HealthRecord[]>({
    queryKey: ['healthRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      firstName: string;
      lastName: string;
      age: number;
      bmi: number;
      bloodPressure: number;
      glucose: number;
      hemoglobin: number;
      cholesterol: number;
      gender: Gender;
      isSmoker: boolean;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addRecord(
        params.firstName,
        params.lastName,
        BigInt(params.age),
        params.bmi,
        BigInt(params.bloodPressure),
        BigInt(params.glucose),
        params.hemoglobin,
        BigInt(params.cholesterol),
        params.gender,
        params.isSmoker
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthRecords'] });
    },
  });
}
