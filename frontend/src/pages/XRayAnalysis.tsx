import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { XRayResultChart } from '@/components/XRayResultChart';
import { ImageIcon, Upload, Loader2, AlertTriangle, CheckCircle2, XCircle, ScanLine } from 'lucide-react';

interface XRayResult {
  label: 'Normal' | 'Pneumonia';
  confidence: number;
  normalProb: number;
  pneumoniaProb: number;
}

function simulateXRayAnalysis(): XRayResult {
  // Deterministic simulation: randomly assign with confidence 60–99%
  const isPneumonia = Math.random() > 0.5;
  const confidence = 0.60 + Math.random() * 0.39;
  const label: 'Normal' | 'Pneumonia' = isPneumonia ? 'Pneumonia' : 'Normal';
  const normalProb = isPneumonia ? 1 - confidence : confidence;
  const pneumoniaProb = isPneumonia ? confidence : 1 - confidence;
  return { label, confidence, normalProb, pneumoniaProb };
}

export function XRayAnalysis() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [result, setResult] = useState<XRayResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setIsAnalyzing(true);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const res = simulateXRayAnalysis();
    setResult(res);
    setIsAnalyzing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) return;
    setFileName(file.name);
    setResult(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-accent" />
          Chest X-Ray Analysis
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload a chest X-ray image for AI-assisted classification.
        </p>
      </div>

      {/* Disclaimer */}
      <Alert className="border-health-amber/40 bg-health-amber/5">
        <AlertTriangle className="w-4 h-4 text-health-amber" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong className="text-foreground">Medical Disclaimer:</strong> This tool is for educational purposes only and does not constitute a medical diagnosis. Always consult a qualified radiologist or physician for clinical interpretation.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Upload className="w-4 h-4 text-accent" />
                Upload X-Ray Image
              </CardTitle>
              <CardDescription className="text-xs">
                Accepts JPG or PNG format. Recommended: 224×224 pixels or larger.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Drop your X-ray here or <span className="text-accent">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, JPEG, PNG supported</p>
                {fileName && (
                  <p className="text-xs text-accent mt-2 font-medium truncate max-w-[200px] mx-auto">
                    📎 {fileName}
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />

              {imageUrl && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full h-10 font-display font-semibold"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing X-Ray...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Image Preview */}
          {imageUrl && (
            <Card className="shadow-card overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display">Image Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black rounded-b-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Uploaded X-Ray"
                    className="w-full object-contain max-h-64"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-medium">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    {result.label === 'Normal' ? (
                      <CheckCircle2 className="w-5 h-5 text-health-green" />
                    ) : (
                      <XCircle className="w-5 h-5 text-health-red" />
                    )}
                    Classification Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Main Result */}
                  <div className={`rounded-xl p-4 border text-center ${
                    result.label === 'Normal'
                      ? 'bg-risk-low border-risk-low'
                      : 'bg-risk-high border-risk-high'
                  }`}>
                    <p className={`text-2xl font-display font-bold ${
                      result.label === 'Normal' ? 'risk-low' : 'risk-high'
                    }`}>
                      {result.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Confidence: <span className="font-semibold text-foreground">{(result.confidence * 100).toFixed(1)}%</span>
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Prediction</p>
                      <Badge
                        variant={result.label === 'Normal' ? 'default' : 'destructive'}
                        className="mt-1 text-xs"
                      >
                        {result.label}
                      </Badge>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="text-sm font-bold font-display mt-1">{(result.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-lg mt-0.5">
                        {result.label === 'Normal' ? '🟢' : '🔴'}
                      </p>
                    </div>
                  </div>

                  {/* Probability Chart */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Probability Distribution
                    </p>
                    <XRayResultChart
                      normalProb={result.normalProb}
                      pneumoniaProb={result.pneumoniaProb}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-health-amber/20 bg-health-amber/5">
                <CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">⚠️ Note:</strong> This is a simulated AI classification for demonstration purposes. Results should not be used for clinical decision-making without radiologist review.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="shadow-card h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center py-12">
                <ScanLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  Upload an X-ray image and click<br />
                  <span className="text-foreground font-semibold">Analyze Image</span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Classification results will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
