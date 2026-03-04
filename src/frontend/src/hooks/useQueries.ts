import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gender, type HealthRecord, RiskLevel } from "../backend";
import { useActor } from "./useActor";

export type { HealthRecord };
export { Gender, RiskLevel };

export function useGetAllRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<HealthRecord[]>({
    queryKey: ["healthRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId }: { recordId: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthRecords"] });
    },
  });
}

export function useAddRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      patientName: string;
      age: bigint;
      bmi: number;
      bloodPressure: bigint;
      glucose: bigint;
      hemoglobin: number;
      cholesterol: bigint;
      gender: Gender;
      isSmoker: boolean;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addRecord(
        params.patientName,
        params.age,
        params.bmi,
        params.bloodPressure,
        params.glucose,
        params.hemoglobin,
        params.cholesterol,
        params.gender,
        params.isSmoker,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthRecords"] });
    },
  });
}
