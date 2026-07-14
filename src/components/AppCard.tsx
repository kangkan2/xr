import React from "react";
import { AppItem } from "../types";
import { Star, ArrowDown, Bookmark, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface AppCardProps {
  key?: string | number;
  app: AppItem;
  onClick: () => void;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
}

export function AppCard({ app, onClick, onBookmarkToggle, isBookmarked }: AppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      id={`app-card-${app.id}`}
      className="group relative bg-[#1E293B]/95 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-shadow flex flex-col h-full border border-white/10"
      onClick={onClick}
    >
      {/* Background card accent glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Card Banner Image (Subtle top strip) */}
      <div className="h-28 w-full overflow-hidden relative bg-brand-bg">
        <img
          src={app.banner}
          alt={app.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/40 to-transparent" />
        
        {/* Bookmark Tag */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle();
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all duration-200 z-10 ${
            isBookmarked 
              ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" 
              : "bg-black/30 text-gray-300 hover:text-white hover:bg-black/50"
          }`}
          aria-label="Bookmark application"
        >
          <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        {/* Category Tag */}
        <span className="absolute bottom-3 left-4 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-white/10 text-white rounded-full backdrop-blur-md">
          {app.category}
        </span>
      </div>

      {/* App details content */}
      <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
        <div>
          {/* Header containing App Icon, App Name & Package */}
          <div className="flex gap-4 -mt-10 items-start mb-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-brand-bg relative shrink-0">
              <img
                src={app.icon}
                alt={`${app.name} Icon`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 pt-8">
              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-accent transition-colors duration-200 truncate font-display">
                {app.name}
              </h3>
              <p className="text-[10px] text-gray-400 font-mono truncate">
                {app.packageName}
              </p>
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
            {app.shortDescription}
          </p>
        </div>

        {/* Stats footer in Card */}
        <div className="border-t border-white/5 pt-3 mt-auto">
          <div className="grid grid-cols-3 gap-1 text-center text-gray-400 text-[11px] font-medium">
            <div className="flex flex-col items-center border-r border-white/5">
              <span className="flex items-center gap-0.5 text-amber-400 font-semibold font-mono text-xs">
                <Star size={11} fill="currentColor" /> {app.rating.toFixed(1)}
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Rating</span>
            </div>
            <div className="flex flex-col items-center border-r border-white/5">
              <span className="flex items-center gap-0.5 text-white font-semibold font-mono text-xs">
                <ArrowDown size={11} className="text-accent" /> {(app.downloads >= 1000 ? `${(app.downloads/1000).toFixed(1)}k` : app.downloads)}
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Installs</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-300 font-semibold font-mono text-xs">
                {app.size}
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Size</span>
            </div>
          </div>

          {/* Inline Action Button */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
              <ShieldCheck size={12} />
              <span>Verified</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="text-[11px] font-semibold text-white px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary transition-all duration-200 shadow-md shadow-primary/10"
            >
              Get APK
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
