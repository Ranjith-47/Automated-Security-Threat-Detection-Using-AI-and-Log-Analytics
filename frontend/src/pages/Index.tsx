import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Terminal } from "lucide-react";
import DashboardHeader from "@/components/ids/DashboardHeader";
import FileUpload from "@/components/ids/FileUpload";
import AnalysisProgress from "@/components/ids/AnalysisProgress";
import SummaryCards from "@/components/ids/SummaryCards";
import AttackCharts from "@/components/ids/AttackCharts";
import ResultsTable from "@/components/ids/ResultsTable";
import ManualInput from "@/components/ids/ManualInput";
import { BatchResponse } from "@/types/ids";
import { generateMockBatchResponse } from "@/lib/mock-api";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BatchResponse | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setResults(null);

    // Simulate API call to POST /predict-batch
    // Replace with: const res = await axios.post('/predict-batch', formData);
    const lines = (await file.text()).split("\n").filter(Boolean);
    const rowCount = Math.max(lines.length - 1, 50); // subtract header

    await new Promise((r) => setTimeout(r, 2500));
    const mockData = generateMockBatchResponse(rowCount);

    setResults(mockData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(152 70% 45% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(152 70% 45% / 0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <DashboardHeader />

      <main className="container px-6 py-6 space-y-6 relative z-10">
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="upload" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              FILE UPLOAD
            </TabsTrigger>
            <TabsTrigger value="manual" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Terminal className="h-3.5 w-3.5 mr-1.5" />
              MANUAL INPUT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />

            {isLoading && <AnalysisProgress />}

            {results && !isLoading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SummaryCards data={results} />
                <AttackCharts breakdown={results.attack_breakdown} />
                <ResultsTable results={results.results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <ManualInput />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
