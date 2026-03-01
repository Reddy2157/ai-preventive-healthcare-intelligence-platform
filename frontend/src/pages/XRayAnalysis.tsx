import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XRayResultChart } from "@/components/XRayResultChart";

interface ClassificationResult {
  normal: number;
  pneumonia: number;
  confidence: number;
  label: "Normal" | "Pneumonia";
}

function simulateClassification(file: File): Promise<ClassificationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const seed = file.size % 100;
      const pneumonia = Math.min(99, Math.max(1, seed + Math.random() * 30));
      const normal = 100 - pneumonia;
      resolve({
        normal: parseFloat(normal.toFixed(1)),
        pneumonia: parseFloat(pneumonia.toFixed(1)),
        confidence: parseFloat(Math.max(normal, pneumonia).toFixed(1)),
        label: pneumonia > 50 ? "Pneumonia" : "Normal",
      });
    }, 1800);
  });
}

export default function XRayAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, etc.).");
      return;
    }
    setError(null);
    setResult(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await simulateClassification(file);
      setResult(res);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">X-Ray Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Upload a chest X-ray image for AI-assisted pneumonia screening.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Medical Disclaimer:</strong> This tool provides simulated results for
          demonstration purposes only. It is not a substitute for professional medical diagnosis.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              Upload X-Ray
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="X-ray preview"
                  className="max-h-48 mx-auto rounded object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-10 h-10 opacity-40" />
                  <p className="text-sm font-medium">Drop image here or click to browse</p>
                  <p className="text-xs">JPEG, PNG, DICOM supported</p>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  "Analyze X-Ray"
                )}
              </Button>
              {file && (
                <Button variant="outline" size="icon" onClick={handleClear}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Processing image…</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="text-center">
                  <span
                    className={`text-2xl font-bold ${
                      result.label === "Pneumonia" ? "text-health-red" : "text-health-green"
                    }`}
                  >
                    {result.label}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Confidence: {result.confidence}%
                  </p>
                </div>
                <XRayResultChart
                  normalProb={result.normal / 100}
                  pneumoniaProb={result.pneumonia / 100}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Upload and analyze an X-ray to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
