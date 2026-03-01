import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RiskGauge } from '@/components/RiskGauge';
import { calculateRiskScore, type RiskLevel } from '@/lib/riskCalculator';
import { useAddRecord } from '@/hooks/useQueries';
import { Gender } from '../backend';
import { Activity, User, FlaskConical, Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface FormState {
  firstName: string;
  lastName: string;
  age: string;
  bmi: string;
  bloodPressure: string;
  glucose: string;
  hemoglobin: string;
  cholesterol: string;
  gender: string;
  isSmoker: boolean;
}

interface RiskResult {
  score: number;
  level: RiskLevel;
  inputs: FormState;
}

const defaultForm: FormState = {
  firstName: '',
  lastName: '',
  age: '35',
  bmi: '22.0',
  bloodPressure: '120',
  glucose: '90',
  hemoglobin: '13.5',
  cholesterol: '180',
  gender: 'male',
  isSmoker: false,
};

export function RiskPredictor() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const addRecord = useAddRecord();

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setSaveError(null);

    const inputs = {
      age: parseFloat(form.age) || 35,
      bmi: parseFloat(form.bmi) || 22,
      bloodPressure: parseFloat(form.bloodPressure) || 120,
      glucose: parseFloat(form.glucose) || 90,
      hemoglobin: parseFloat(form.hemoglobin) || 13.5,
      cholesterol: parseFloat(form.cholesterol) || 180,
      isSmoker: form.isSmoker,
    };

    const riskResult = calculateRiskScore(inputs);
    setResult({ ...riskResult, inputs: form });

    // Save to backend
    try {
      await addRecord.mutateAsync({
        firstName: form.firstName || 'Anonymous',
        lastName: form.lastName || 'Patient',
        age: Math.round(inputs.age),
        bmi: inputs.bmi,
        bloodPressure: Math.round(inputs.bloodPressure),
        glucose: Math.round(inputs.glucose),
        hemoglobin: inputs.hemoglobin,
        cholesterol: Math.round(inputs.cholesterol),
        gender: form.gender === 'female' ? Gender.female : Gender.male,
        isSmoker: form.isSmoker,
      });
      setSaved(true);
    } catch (err) {
      setSaveError('Failed to save record to history. Your risk result is still shown below.');
    }
  };

  const riskAlertConfig: Record<RiskLevel, { icon: React.ReactNode; text: string; className: string }> = {
    LOW: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      text: 'LOW RISK — Continue healthy habits and maintain regular check-ups.',
      className: 'border-risk-low bg-risk-low risk-low',
    },
    MODERATE: {
      icon: <AlertTriangle className="w-4 h-4" />,
      text: 'MODERATE RISK — Lifestyle changes advised. Consult your physician.',
      className: 'border-risk-moderate bg-risk-moderate risk-moderate',
    },
    HIGH: {
      icon: <XCircle className="w-4 h-4" />,
      text: 'HIGH RISK — Immediate medical consultation strongly recommended.',
      className: 'border-risk-high bg-risk-high risk-high',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent" />
          Health Risk Predictor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter patient vitals and lab results to compute a personalized health risk score.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Form */}
        <div className="xl:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Info */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs font-medium">Age (20–100)</Label>
                  <Input
                    id="age"
                    type="number"
                    min={20}
                    max={100}
                    value={form.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-medium">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
                    <SelectTrigger id="gender" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex items-center gap-3 pt-1">
                  <Checkbox
                    id="smoker"
                    checked={form.isSmoker}
                    onCheckedChange={(checked) => updateField('isSmoker', !!checked)}
                  />
                  <Label htmlFor="smoker" className="text-sm cursor-pointer">
                    Current smoker
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Lab Results */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-accent" />
                  Clinical Measurements
                </CardTitle>
                <CardDescription className="text-xs">Enter current lab values and vitals</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bmi" className="text-xs font-medium">BMI (10.0–50.0)</Label>
                  <Input
                    id="bmi"
                    type="number"
                    min={10}
                    max={50}
                    step={0.1}
                    value={form.bmi}
                    onChange={(e) => updateField('bmi', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp" className="text-xs font-medium">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bp"
                    type="number"
                    min={80}
                    max={200}
                    value={form.bloodPressure}
                    onChange={(e) => updateField('bloodPressure', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="glucose" className="text-xs font-medium">Glucose (mg/dL)</Label>
                  <Input
                    id="glucose"
                    type="number"
                    min={50}
                    max={300}
                    value={form.glucose}
                    onChange={(e) => updateField('glucose', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hemoglobin" className="text-xs font-medium">Hemoglobin (g/dL)</Label>
                  <Input
                    id="hemoglobin"
                    type="number"
                    min={5}
                    max={20}
                    step={0.1}
                    value={form.hemoglobin}
                    onChange={(e) => updateField('hemoglobin', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="cholesterol" className="text-xs font-medium">Cholesterol (mg/dL)</Label>
                  <Input
                    id="cholesterol"
                    type="number"
                    min={100}
                    max={400}
                    value={form.cholesterol}
                    onChange={(e) => updateField('cholesterol', e.target.value)}
                    className="h-9"
                  />
                </div>
              </CardContent>
            </Card>

            {saveError && (
              <Alert variant="destructive" className="py-2.5">
                <XCircle className="w-4 h-4" />
                <AlertDescription className="text-xs">{saveError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-display font-semibold text-sm"
              disabled={addRecord.isPending}
            >
              {addRecord.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing & Saving...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Predict Risk Score
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Result Panel */}
        <div className="xl:col-span-2">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display">Risk Assessment</CardTitle>
                  {result.inputs.firstName && (
                    <CardDescription className="text-xs">
                      {result.inputs.firstName} {result.inputs.lastName}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-2 pb-4">
                  <RiskGauge score={result.score} level={result.level} size={200} />
                </CardContent>
              </Card>

              <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm font-medium ${riskAlertConfig[result.level].className}`}>
                {riskAlertConfig[result.level].icon}
                <span>{riskAlertConfig[result.level].text}</span>
              </div>

              {saved && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-health-green" />
                  Record saved to health history
                </div>
              )}

              {/* Metric Summary */}
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display">Input Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Age', value: `${result.inputs.age} yrs` },
                      { label: 'BMI', value: result.inputs.bmi },
                      { label: 'Blood Pressure', value: `${result.inputs.bloodPressure} mmHg` },
                      { label: 'Glucose', value: `${result.inputs.glucose} mg/dL` },
                      { label: 'Hemoglobin', value: `${result.inputs.hemoglobin} g/dL` },
                      { label: 'Cholesterol', value: `${result.inputs.cholesterol} mg/dL` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/40 rounded-lg px-2.5 py-2">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-semibold font-display">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="shadow-card h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  Fill in the form and click<br />
                  <span className="text-foreground font-semibold">Predict Risk Score</span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Results will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
