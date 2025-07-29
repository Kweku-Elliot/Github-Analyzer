"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF",
  "#FF1919", "#FF4519", "#FF7119", "#FF9D19", "#FFC919" 
];

// A simple hashing function to get a color for a language
const ICONS: Record<string, string> = {};
const getColor = (lang: string) => {
    if (ICONS[lang]) {
        return ICONS[lang];
    }
    let hash = 0;
    for (let i = 0; i < lang.length; i++) {
        hash = lang.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = COLORS[Math.abs(hash) % COLORS.length];
    ICONS[lang] = color;
    return color;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/80 backdrop-blur-sm border border-border p-2 rounded-lg shadow-lg">
          <p className="font-bold">{`${data.name}`}</p>
          <p className="text-sm">{`${(data.value * 100).toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

export function LanguageChart({ data }: { data: Record<string, number> }) {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const chartData = Object.entries(data)
        .map(([name, value]) => ({ name, value: value / total }))
        .sort((a,b) => b.value - a.value)
        .slice(0, 5); // Take top 5 languages

    return (
        <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconSize={8}
                        wrapperStyle={{
                            fontSize: '12px',
                            lineHeight: '20px'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
