import React, { useState } from "react";
import { Search, Moon, Sun, Languages, Star, Lock, LayoutDashboard, Globe, LogOut } from "lucide-react";
import { motion } from "motion/react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  bookmarksCount: number;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  currentUser: any;
  onSignOut: () => void;
  onSignInClick: () => void;
  logoUrl?: string;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onNavigate,
  currentPage,
  bookmarksCount,
  theme,
  onThemeToggle,
  language,
  onLanguageChange,
  currentUser,
  onSignOut,
  onSignInClick,
  logoUrl
}: NavbarProps) {
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: "EN", name: "English" }
  ];

  const activeLang = languages.find(l => l.code === language) || languages[0];

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b border-white/5 py-4 px-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      {/* Brand logo & title */}
      <div 
        onClick={() => onNavigate("home")} 
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        {logoUrl ? (
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden p-1 shrink-0">
            <img src={logoUrl} alt="Store Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <span className="font-display font-extrabold text-xl text-white tracking-wider">xr</span>
          </div>
        )}
        <div>
          <span className="font-display font-black text-2xl tracking-tight text-white group-hover:text-accent transition-colors">
            xrok
          </span>
          <span className="text-[9px] uppercase tracking-widest text-accent font-semibold block -mt-1 font-mono">
            APP MARKET
          </span>
        </div>
      </div>

      {/* Middle search block */}
      <div className="flex-1 max-w-lg mx-auto relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (currentPage !== "home" && currentPage !== "search") {
              onNavigate("search");
            }
          }}
          placeholder="Search Android Apps, APK files, packages..."
          className="w-full bg-black/35 focus:bg-black/50 border border-white/5 focus:border-accent/40 rounded-2xl pl-12 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-inner group-hover:border-white/10"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Bookmarks link */}
        <button
          onClick={() => onNavigate("bookmarks")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 text-xs font-semibold relative ${
            currentPage === "bookmarks" 
              ? "bg-primary text-white" 
              : "hover:bg-white/5 text-gray-300 hover:text-white"
          }`}
          title="My Bookmarked Apps"
        >
          <Star size={16} fill={currentPage === "bookmarks" ? "currentColor" : "none"} />
          <span className="hidden sm:inline">Bookmarks</span>
          {bookmarksCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-lg animate-scaleIn font-mono">
              {bookmarksCount}
            </span>
          )}
        </button>

        {/* Theme Toggler */}
        <button
          onClick={onThemeToggle}
          className="p-2.5 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-200 relative"
          title={theme === "dark" ? "Toggle Light Mode" : "Toggle Dark Mode"}
        >
          {theme === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-accent" />}
        </button>

        {/* Language dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all text-xs font-semibold"
            title="Choose Language"
          >
            <Globe size={16} className="text-gray-400" />
            <span>{activeLang.code}</span>
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 mt-2 w-36 glassmorphism border border-white/5 rounded-2xl shadow-2xl p-1.5 z-20 animate-fadeIn">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      language === lang.code 
                        ? "bg-primary/20 text-accent font-semibold" 
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Account Section */}
        {currentUser ? (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold text-[10px] flex items-center justify-center font-mono">
              {currentUser.email[0].toUpperCase()}
            </div>
            <span className="text-[11px] text-gray-300 font-medium hidden sm:inline max-w-[120px] truncate">
              {currentUser.email.split("@")[0]}
            </span>
            <button
              onClick={onSignOut}
              className="text-gray-400 hover:text-red-400 p-1 transition-colors"
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignInClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold border border-white/10 shadow-sm cursor-pointer"
          >
            <Lock size={13} />
            <span>Sign In</span>
          </button>
        )}

        {/* Admin Dashboard */}
        {currentUser?.isAdmin && (
          <button
            onClick={() => onNavigate("admin")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 text-xs font-bold ${
              currentPage === "admin" 
                ? "bg-gradient-to-r from-secondary to-primary text-white" 
                : "border border-secondary/30 hover:border-secondary/70 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20"
            }`}
          >
            <LayoutDashboard size={15} />
            <span className="hidden md:inline">Console</span>
          </button>
        )}
      </div>
    </nav>
  );
}
