import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, FileSearch } from "lucide-react";
import { PredictionResult } from "@/types/ids";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PacketDetailModal from "./PacketDetailModal";

interface ResultsTableProps {
  results: PredictionResult[];
}

type SortKey = "id" | "prediction" | "attack_type" | "confidence";

const PAGE_SIZE = 15;

const ResultsTable = ({ results }: ResultsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedPacket, setSelectedPacket] = useState<PredictionResult | null>(null);

  const filtered = useMemo(() => {
    if (!search) return results;
    const s = search.toLowerCase();
    return results.filter(r => 
      r.attack_type?.toLowerCase().includes(s) || 
      (r.features.src_ip as string || "").toLowerCase().includes(s) ||
      (r.features.dst_ip as string || "").toLowerCase().includes(s)
    );
  }, [results, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") cmp = a.id - b.id;
      else if (sortKey === "confidence") cmp = a.confidence - b.confidence;
      else if (sortKey === "prediction") cmp = a.prediction.localeCompare(b.prediction);
      else cmp = (a.attack_type || "").localeCompare(b.attack_type || "");
      return sortAsc ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortAsc]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-border bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileSearch className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xs font-mono font-bold text-muted-foreground tracking-widest uppercase">
            Investigation Log <span className="text-foreground/40 ml-2 font-normal">— {filtered.length} matching event(s)</span>
          </h3>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search IP or Attack Type..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-9 font-mono text-[10px] bg-secondary/50 border-border"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {(["id", "prediction", "attack_type", "confidence"] as SortKey[]).map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="px-6 py-3 text-left text-[10px] font-mono font-bold text-muted-foreground tracking-widest cursor-pointer hover:text-foreground select-none transition-colors"
                >
                  <span className="flex items-center gap-1.5 uppercase">
                    {col === "attack_type" ? "Classification" : col === "prediction" ? "Risk" : col}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-muted-foreground tracking-widest uppercase">Endpoint A</th>
              <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-muted-foreground tracking-widest uppercase">Endpoint B</th>
              <th className="px-6 py-3 text-left text-[10px] font-mono font-bold text-muted-foreground tracking-widest uppercase text-center">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paged.length > 0 ? (
              paged.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedPacket(row)}
                  className="group hover:bg-secondary/40 transition-all cursor-pointer"
                >
                  <td className="px-6 py-3.5 text-[10px] font-mono text-muted-foreground/60">#{row.id}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold uppercase tracking-tight ${
                      row.prediction === "attack"
                        ? "bg-threat/10 text-threat border border-threat/20"
                        : "bg-safe/10 text-safe border border-safe/20"
                    }`}>
                      {row.prediction === "attack" ? "⚠ HIGH" : "✓ LOW"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[10px] font-mono font-semibold text-threat italic">
                    {row.attack_type || "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden min-w-[40px]">
                          <div className="h-full bg-primary" style={{ width: `${row.confidence * 100}%` }} />
                       </div>
                       <span className="text-[10px] font-mono text-foreground font-medium">
                        {(row.confidence * 100).toFixed(0)}%
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                    {row.features.src_ip as string || "0.0.0.0"}
                  </td>
                  <td className="px-6 py-3.5 text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                    {row.features.dst_ip as string || "0.0.0.0"}
                  </td>
                  <td className="px-6 py-3.5 text-[10px] font-mono text-primary font-bold text-center">
                    {row.features.protocol as string || "IP"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-xs font-mono text-muted-foreground uppercase opacity-50">
                   No forensic data matches your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border bg-card/20">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Segment {page + 1} <span className="opacity-40">/ {pageCount}</span>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="h-8 px-3 text-[10px] font-mono uppercase"
          >
            PREV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            className="h-8 px-3 text-[10px] font-mono uppercase"
          >
            NEXT
          </Button>
        </div>
      </div>

      <PacketDetailModal 
        packet={selectedPacket} 
        isOpen={selectedPacket !== null}
        onClose={() => setSelectedPacket(null)}
      />
    </div>
  );
};

export default ResultsTable;
