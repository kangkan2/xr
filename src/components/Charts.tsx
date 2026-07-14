import React, { useState } from "react";
import { DownloadEvent, AppItem } from "../types";

interface ChartsProps {
  downloads: DownloadEvent[];
  apps: AppItem[];
}

export function Charts({ downloads, apps }: ChartsProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredPie, setHoveredPie] = useState<number | null>(null);

  // Calculate top apps downloads
  const topAppsData = apps
    .map(app => ({ name: app.name.split(" ")[0], downloads: app.downloads }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);

  const maxAppDownloads = Math.max(...topAppsData.map(d => d.downloads), 1);

  // Group downloads by last 7 days
  const downloadsByDay: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    // Count downloads matching this date
    const count = downloads.filter(dl => {
      const dlDate = new Date(dl.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return dlDate === dateStr;
    }).length;
    
    downloadsByDay.push({ date: dateStr, count });
  }

  const maxDayDownloads = Math.max(...downloadsByDay.map(d => d.count), 1);

  // Calculate country distribution
  const countriesMap: Record<string, number> = {};
  downloads.forEach(dl => {
    countriesMap[dl.country] = (countriesMap[dl.country] || 0) + 1;
  });
  const countryData = Object.entries(countriesMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const totalCountryCount = countryData.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Downloads Per Day */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/5 shadow-xl">
        <h4 className="text-sm font-semibold text-gray-400 mb-4 font-display">DOWNLOADS (LAST 7 DAYS)</h4>
        <div className="h-56 flex items-end justify-between gap-2 px-2 relative">
          {downloadsByDay.map((data, index) => {
            const barHeight = (data.count / maxDayDownloads) * 140; // max height 140px
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {hoveredBar === index && (
                  <div className="absolute -top-10 bg-secondary text-white text-xs font-semibold py-1 px-2.5 rounded-lg shadow-lg z-10 transition-all duration-200">
                    {data.count} dl
                  </div>
                )}
                
                {/* Bar */}
                <div className="w-full relative rounded-t-lg overflow-hidden bg-white/5 h-36 flex items-end">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent transition-all duration-500 ease-out"
                    style={{ height: `${Math.max(barHeight, 6)}px` }}
                  />
                </div>
                
                <span className="text-[10px] text-gray-400 mt-2 font-mono">{data.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Top Apps (Downloads Leaderboard) */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/5 shadow-xl">
        <h4 className="text-sm font-semibold text-gray-400 mb-4 font-display">TOP INSTALLED APPLICATIONS</h4>
        <div className="h-56 flex flex-col justify-center gap-3">
          {topAppsData.map((app, index) => {
            const barWidth = (app.downloads / maxAppDownloads) * 100;
            const colors = [
              "from-primary to-secondary",
              "from-accent to-primary",
              "from-teal-400 to-accent",
              "from-amber-400 to-orange-500",
              "from-pink-500 to-purple-600"
            ];
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white truncate max-w-[150px]">{app.name}</span>
                  <span className="text-accent font-mono">{app.downloads.toLocaleString()} dl</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-700`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 3: Downloads by Country */}
      <div className="glassmorphism p-5 rounded-2xl border border-white/5 shadow-xl">
        <h4 className="text-sm font-semibold text-gray-400 mb-4 font-display">DEMOGRAPHIC DISTRIBUTION</h4>
        <div className="h-56 flex flex-col justify-center gap-4">
          {countryData.length === 0 ? (
            <div className="text-center text-gray-500 text-xs font-mono py-12">No statistics logged yet</div>
          ) : (
            countryData.map((c, index) => {
              const percentage = Math.round((c.count / totalCountryCount) * 100);
              const progressColors = ["bg-primary", "bg-accent", "bg-secondary", "bg-emerald-400"];
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${progressColors[index % progressColors.length]}`} />
                      <span className="text-white">{c.country}</span>
                    </div>
                    <span className="text-gray-400 font-mono font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${progressColors[index % progressColors.length]} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
