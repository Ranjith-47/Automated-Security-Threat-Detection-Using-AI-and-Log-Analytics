import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Terminal, Info, XCircle } from "lucide-react";
import DashboardHeader from "@/components/ids/DashboardHeader";
import FileUpload from "@/components/ids/FileUpload";
import AnalysisProgress from "@/components/ids/AnalysisProgress";
import SummaryCards from "@/components/ids/SummaryCards";
import AttackCharts from "@/components/ids/AttackCharts";
import ResultsTable from "@/components/ids/ResultsTable";
import ManualInput from "@/components/ids/ManualInput";
import Chatbot from "@/components/ids/Chatbot";
import { BatchResponse, PredictionResult } from "@/types/ids";
import axios from "axios";
import { toast } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BatchResponse | null>(null);
  const [selectedAttackType, setSelectedAttackType] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setResults(null);
    setSelectedAttackType(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("http://localhost:8000/predict/batch", formData);
      const data = response.data;

      // Transform API response to match Frontend BatchResponse type
      const attackBreakdown: Record<string, number> = {};
      data.predictions.forEach((p: any) => {
        const type = p.Attack_Type || "Normal";
        attackBreakdown[type] = (attackBreakdown[type] || 0) + 1;
      });

      const formattedResults: BatchResponse = {
        total_packets: data.predictions.length,
        threats_detected: data.predictions.filter((p: any) => p.Prediction.toLowerCase() !== "normal").length,
        avg_confidence: data.predictions.reduce((acc: number, p: any) => acc + p.Confidence, 0) / data.predictions.length,
        attack_breakdown: attackBreakdown,
        results: data.predictions.map((p: any, i: number) => ({
          id: i + 1,
          prediction: p.Prediction.toLowerCase() === "normal" ? "safe" : "attack",
          attack_type: p.Attack_Type === "Normal" ? null : p.Attack_Type,
          confidence: p.Confidence,
          features: p
        }))
      };

      setResults(formattedResults);
      toast.success(`Analysis Complete: ${formattedResults.threats_detected} threats identified.`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process security logs. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const threatDetails = results?.results.filter(r => r.attack_type === selectedAttackType) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Structural Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{ backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <DashboardHeader />

      <main className="container px-6 py-8 max-w-7xl mx-auto space-y-8 relative z-10">
        <Tabs defaultValue="upload" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <h2 className="text-2xl font-bold font-mono tracking-tight">Security Command</h2>
              <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest opacity-60">Operations & Forensic Analysis</p>
            </div>
            <TabsList className="bg-secondary/50 border border-border h-10 p-1">
              <TabsTrigger value="upload" className="font-mono text-[10px] h-8 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="h-3 w-3 mr-2" />
                BATCH UPLOAD
              </TabsTrigger>
              <TabsTrigger value="manual" className="font-mono text-[10px] h-8 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Terminal className="h-3 w-3 mr-2" />
                MANUAL PROBE
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="space-y-8 animate-in fade-in duration-500">
            <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />

            {isLoading && <AnalysisProgress />}

            {results && !isLoading && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                <SummaryCards data={results} />
                <AttackCharts 
                  breakdown={results.attack_breakdown} 
                  onSelectType={(type) => setSelectedAttackType(type)}
                />

                {/* Drill-down Detail View */}
                {selectedAttackType && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded text-primary">
                          <Info className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-mono font-bold text-sm uppercase tracking-wider">
                            Drill-down: {selectedAttackType}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Filtering high-fidelity logs for specific vector matching.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedAttackType(null)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Occurrences</div>
                        <div className="text-xl font-mono font-bold text-primary">{threatDetails.length}</div>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Avg Confidence</div>
                        <div className="text-xl font-mono font-bold text-primary">
                          {(threatDetails.reduce((a, b) => a + b.confidence, 0) / threatDetails.length * 100 || 0).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Severity Index</div>
                        <div className="text-xl font-mono font-bold text-threat">CRITICAL</div>
                      </div>
                    </div>

                    <ResultsTable results={threatDetails} />
                  </div>
                )}

                {!selectedAttackType && <ResultsTable results={results.results} />}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="animate-in fade-in duration-500">
            <ManualInput />
          </TabsContent>
        </Tabs>
      </main>

      <Chatbot />
    </div>
  );
};

export default Index;
