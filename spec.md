# AI Preventive Healthcare Intelligence Platform

## Current State

The app has a working Motoko backend that stores `HealthRecord` entries with fields: patientName, age, gender, isSmoker, bmi, bloodPressure, glucose, hemoglobin, cholesterol, riskScore, riskLevel, and timestamp.

The backend exposes:
- `addRecord(...)` — saves a new health record
- `getAllRecords()` — returns all records
- `getRecordById(recordId)` — returns a single record by ID

The frontend has four pages:
- **Risk Predictor** — form to enter patient vitals and save a record
- **X-Ray Analysis** — simulated X-ray result (no backend save)
- **Dashboard** — table overview of all records with stats, CSV export
- **History** — card list of all records sorted by most recent

Missing functionality:
- No way to **delete** individual patient records
- No way to **search/filter** records by patient name or risk level
- No **dedicated patient profile view** showing all records for a single patient
- No **edit/update** of existing records
- Records are not identified by a meaningful patient ID (just timestamp)

## Requested Changes (Diff)

### Add
- Backend: `deleteRecord(recordId: Text)` function to remove a record
- Backend: `getRecordsByPatientName(name: Text)` to filter records by patient name
- Frontend History page: search input to filter displayed records by patient name
- Frontend History page: filter tabs/dropdown for risk level (All, Low, Moderate, High)
- Frontend History page: delete button on each record card
- Frontend Dashboard page: delete button in the table row for each record
- Frontend Dashboard page: search/filter input above the table

### Modify
- Backend: records storage to use stable variable so data survives canister upgrades
- `useQueries.ts`: add `useDeleteRecord` mutation hook and `useGetRecordsByPatientName` query hook
- History page: add data-ocid markers for all interactive elements
- Dashboard page: add data-ocid markers for all interactive elements

### Remove
- Nothing removed

## Implementation Plan

1. Update `main.mo` to add `deleteRecord` and `getRecordsByPatientName` functions, and switch records storage to a stable variable.
2. Update `backend.d.ts` to declare the two new backend methods.
3. Update `useQueries.ts` to add `useDeleteRecord` and search query hooks.
4. Update `History.tsx` to add search input, risk level filter tabs, and delete button per record with confirmation.
5. Update `Dashboard.tsx` to add search input above the table and delete button per row with confirmation.
6. Apply deterministic `data-ocid` markers to all interactive surfaces across History and Dashboard pages.
