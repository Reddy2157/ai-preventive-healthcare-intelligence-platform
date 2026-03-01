import { useState } from "react";
import { Activity, User, FlaskConical, Cigarette, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskGauge from "@/components/RiskGauge";
import { useAddRecord } from "@/hooks/useQueries";
import { calculateRiskScore } from "@/lib/riskCalculator";
import { Gender, RiskLevel } from "../backend";

interface FormState {
  age: string;
  gender: Gender;
  isSmoker: boolean;
  bmi: string;
  bloodPressure: string;
  glucose: string;
  hemoglobin: string;
  cholesterol: string;
}

const defaultForm: FormState = {
  age: "",
  gender: Gender.male,
  isSmoker: false,
  bmi: "",
  bloodPressure: "",
  glucose: "",
  hemoglobin: "",
  cholesterol: "",
};

export default function RiskPredictor() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saved, setSaved] = useState(false);
  const addRecord = useAddRecord();

  const numericForm = {
    age: parseFloat(form.age) || 0,
    bmi: parseFloat(form.bmi) || 0,
    bloodPressure: parseFloat(form.bloodPressure) || 0,
    glucose: parseFloat(form.glucose) || 0,
    hemoglobin: parseFloat(form.hemoglobin) || 0,
    cholesterol: parseFloat(form.cholesterol) || 0,
    isSmoker: form.isSmoker,
  };

  const hasInput = Object.values(numericForm).some((v) =>
    typeof v === "number" ? v > 0 : v
  );

  const result = hasInput ? calculateRiskScore(numericForm) : null;

  const handleSave = async () => {
    if (!result) return;
    try {
      await addRecord.mutateAsync({
        age: BigInt(Math.round(numericForm.age)),
        bmi: numericForm.bmi,
        bloodPressure: BigInt(Math.round(numericForm.bloodPressure)),
        glucose: BigInt(Math.round(numericForm.glucose)),
        hemoglobin: numericForm.hemoglobin,
        cholesterol: BigInt(Math.round(numericForm.cholesterol)),
        gender: form.gender,
        isSmoker: form.isSmoker,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save record:", err);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setSaved(false);
  };

  const riskColor =
    result?.level === RiskLevel.high
      ? "text-health-red"
      : result?.level === RiskLevel.moderate
      ? "text-health-amber"
      : "text-health-green";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Health Risk Predictor</h1>
        <p className="text-muted-foreground mt-1">
          Enter patient vitals and lab results to calculate cardiovascular risk score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g. 45"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setForm({ ...form, gender: v as Gender })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.male}>Male</SelectItem>
                      <SelectItem value={Gender.female}>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="smoker"
                  checked={form.isSmoker}
                  onCheckedChange={(v) => setForm({ ...form, isSmoker: v })}
                />
                <Label htmlFor="smoker" className="flex items-center gap-1.5 cursor-pointer">
                  <Cigarette className="w-4 h-4" />
                  Current Smoker
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bmi">BMI (kg/m²)</Label>
                  <Input
                    id="bmi"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 24.5"
                    value={form.bmi}
                    onChange={(e) => setForm({ ...form, bmi: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bp"
                    type="number"
                    placeholder="e.g. 120"
                    value={form.bloodPressure}
                    onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lab Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Lab Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="glucose">Glucose (mg/dL)</Label>
                  <Input
                    id="glucose"
                    type="number"
                    placeholder="e.g. 95"
                    value={form.glucose}
                    onChange={(e) => setForm({ ...form, glucose: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                  <Input
                    id="hemoglobin"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 13.5"
                    value={form.hemoglobin}
                    onChange={(e) => setForm({ ...form, hemoglobin: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cholesterol">Cholesterol (mg/dL)</Label>
                  <Input
                    id="cholesterol"
                    type="number"
                    placeholder="e.g. 190"
                    value={form.cholesterol}
                    onChange={(e) => setForm({ ...form, cholesterol: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!result || addRecord.isPending}
              className="flex-1"
            >
              {addRecord.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saved ? "Saved!" : "Save Record"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <RiskGauge score={result.score} level={result.level} />
                  <div className="text-center">
                    <span className={`text-lg font-bold ${riskColor}`}>
                      {result.level === RiskLevel.high
                        ? "High Risk"
                        : result.level === RiskLevel.moderate
                        ? "Moderate Risk"
                        : "Low Risk"}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Score: {result.score.toFixed(1)} / 100
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Enter patient data to see risk assessment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Metric Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Age", value: `${numericForm.age} years` },
                    { label: "BMI", value: numericForm.bmi.toFixed(1) },
                    { label: "Blood Pressure", value: `${numericForm.bloodPressure} mmHg` },
                    { label: "Glucose", value: `${numericForm.glucose} mg/dL` },
                    { label: "Hemoglobin", value: `${numericForm.hemoglobin} g/dL` },
                    { label: "Cholesterol", value: `${numericForm.cholesterol} mg/dL` },
                    { label: "Smoker", value: form.isSmoker ? "Yes" : "No" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
