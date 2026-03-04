import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HealthRecord {
    age: bigint;
    bmi: number;
    isSmoker: boolean;
    bloodPressure: bigint;
    hemoglobin: number;
    glucose: bigint;
    gender: Gender;
    timestamp: Time;
    patientName: string;
    riskLevel: RiskLevel;
    riskScore: number;
    cholesterol: bigint;
}
export type Time = bigint;
export enum Gender {
    female = "female",
    male = "male"
}
export enum RiskLevel {
    low = "low",
    high = "high",
    moderate = "moderate"
}
export interface backendInterface {
    addRecord(patientName: string, age: bigint, bmi: number, bloodPressure: bigint, glucose: bigint, hemoglobin: number, cholesterol: bigint, gender: Gender, isSmoker: boolean): Promise<string>;
    deleteRecord(recordId: string): Promise<boolean>;
    getAllRecords(): Promise<Array<HealthRecord>>;
    getRecordById(recordId: string): Promise<HealthRecord>;
    getRecordsByPatientName(searchName: string): Promise<Array<HealthRecord>>;
}
