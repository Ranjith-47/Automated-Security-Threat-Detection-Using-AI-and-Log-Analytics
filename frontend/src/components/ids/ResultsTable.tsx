import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PredictionResult } from "@/types/ids";
import { Button } from "@/components/ui/button";

interface ResultsTableProps {
  results: PredictionResult[];
}

type SortKey = "id" | "prediction" | "attack_type" | "confidence";

const PAGE_SIZE = 15;

const ResultsTable = ({ results }: ResultsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    return [...results].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") cmp = a.id - b.id;
      else if (sortKey === "confidence") cmp = a.confidence - b.confidence;
      else if (sortKey === "prediction") cmp = a.prediction.localeCompare(b.prediction);
      else cmp = (a.attack_type || "").localeCompare(b.attack_type || "");
      return sortAsc ? cmp : -cmp;
    });
  }, [results, sortKey, sortAsc]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-mono text-muted-foreground tracking-wider">
          PACKET ANALYSIS LOG — {results.length} records
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {(["id", "prediction", "attack_type", "confidence"] as SortKey[]).map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="px-4 py-3 text-left text-xs font-mono text-muted-foreground tracking-wider cursor-pointer hover:text-foreground select-none"
                >
                  <span className="flex items-center gap-1">
                    {col === "attack_type" ? "ATTACK TYPE" : col.toUpperCase()}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground tracking-wider">SRC IP</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground tracking-wider">DST IP</th>
              <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground tracking-wider">PROTOCOL</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">#{row.id}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                    row.prediction === "attack"
                      ? "bg-threat/15 text-threat"
                      : "bg-safe/15 text-safe"
                  }`}>
                    {row.prediction === "attack" ? "⚠ ATTACK" : "✓ NORMAL"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-threat">
                  {row.attack_type || "—"}
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-foreground">
                  {(row.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">
                  {row.features.src_ip as string}
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">
                  {row.features.dst_ip as string}
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">
                  {row.features.protocol as string}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-3 border-t border-border">
        <span className="text-xs font-mono text-muted-foreground">
          Page {page + 1} of {pageCount}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
