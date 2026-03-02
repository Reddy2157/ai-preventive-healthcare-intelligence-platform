import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { Gender, RiskLevel, type HealthRecord } from "../backend";

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
        params.isSmoker
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healthRecords"] });
    },
  });
}
