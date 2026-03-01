# Specification

## Summary
**Goal:** Add persistent history storage to the Motoko backend and wire the frontend to use it, so that risk prediction records survive page refreshes and canister upgrades.

**Planned changes:**
- Update the Motoko backend actor to use stable storage for health records, exposing an `addRecord` update function and a `getAllRecords` query function returning records in reverse-chronological order.
- Update `useAddRecord` and `useGetAllRecords` React Query hooks to correctly map the backend's Candid interfaces, and update the `HealthRecord` TypeScript type to include all required fields.
- Update `RiskPredictor.tsx` to call `useAddRecord` on successful form submission, persisting all input fields plus the computed risk score and risk level, with loading and error states.
- Update `Dashboard.tsx` and `History.tsx` to load records via `useGetAllRecords` from the backend instead of local in-memory state, with loading and empty-state handling.

**User-visible outcome:** Risk prediction records are saved to the backend on submission and remain visible on the Dashboard and History pages after a full page refresh or canister upgrade.
