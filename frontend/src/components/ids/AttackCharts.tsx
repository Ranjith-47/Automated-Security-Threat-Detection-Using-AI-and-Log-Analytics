import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MousePointer2, AlertCircle, Info, Shield } from "lucide-react";

interface AttackChartsProps {
  breakdown: Record<string, number>;
  onSelectType?: (type: string) => void;
}

const COLORS = [
  "hsl(0, 72%, 51%)",
  "hsl(25, 95%, 53%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(200, 80%, 50%)",
  "hsl(340, 75%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(60, 70%, 50%)",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded shadow-xl backdrop-blur-md animate-in zoom-in-95 duration-200">
        <p className="text-xs font-mono font-bold text-foreground mb-1 uppercase tracking-tight">
          {label || payload[0].name}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].color }} />
          <p className="text-[10px] font-mono text-muted-foreground capitalize">
            Total Detections: <span className="text-foreground font-bold">{payload[0].value}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-primary animate-pulse">
          <MousePointer2 className="h-2 w-2" />
          CLICK TO DRILL DOWN
        </div>
      </div>
    );
  }
  return null;
};

const AttackCharts = ({ breakdown, onSelectType }: AttackChartsProps) => {
  const barData = Object.entries(breakdown)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const pieData = barData.map((item, i) => ({
    ...item,
    fill: COLORS[i % COLORS.length],
  }));

  const handleClick = (data: any) => {
    if (onSelectType) {
      onSelectType(data.activeLabel || data.name || data.payload.name);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart Section */}
      <div className="bg-card/40 border border-border rounded-xl p-6 hover:border-primary/20 transition-colors group">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary opacity-70" />
            <h3 className="text-[10px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase">
              Threat Frequency Analytics
            </h3>
          </div>
          <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={barData} 
              onClick={handleClick}
              className="cursor-pointer"
              margin={{ bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }}
                angle={-25}
                textAnchor="end"
                interval={0}
                stroke="transparent"
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }}
                stroke="transparent"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1500}>
                {barData.map((entry, i) => (
                  <Cell 
                    key={i} 
                    fill={COLORS[i % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="bg-card/40 border border-border rounded-xl p-6 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary opacity-70" />
            <h3 className="text-[10px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase">
              Vector Composition
            </h3>
          </div>
        </div>
        
        <div className="h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={4}
                dataKey="count"
                stroke="transparent"
                onClick={handleClick}
                className="cursor-pointer"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-x-0 bottom-0 overflow-y-auto max-h-[80px] pr-2 custom-scrollbar">
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {pieData.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => onSelectType?.(item.name)}
                  className="flex items-center gap-2 hover:bg-secondary/50 p-1 px-2 rounded transition-all group"
                >
                  <span className="h-2 w-2 rounded-full ring-2 ring-primary/5 shadow-sm" style={{ backgroundColor: item.fill }} />
                  <span className="text-[9px] font-mono text-muted-foreground group-hover:text-foreground">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackCharts;
