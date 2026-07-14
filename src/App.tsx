import React, { useState, useEffect } from "react";
import { AppItem, Review } from "./types";
import { db } from "./dbHelper";
import { Navbar } from "./components/Navbar";
import { AppCard } from "./components/AppCard";
import { AppDetails } from "./components/AppDetails";
import { DownloadProgress } from "./components/DownloadProgress";
import { AdminPanel } from "./components/AdminPanel";
import { AuthModal } from "./components/AuthModal";
import { 
  Star, ArrowDown, ArrowUpRight, Check, Send, Sparkles, AlertCircle, 
  ChevronRight, ChevronLeft, Smartphone, ShieldCheck, Cpu, Database, Users, HelpCircle, LayoutDashboard 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { auth, db as firestoreDb } from "./firebase";

type Page = "home" | "search" | "details" | "download" | "bookmarks" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("popular"); // popular, newest, downloads, az
  
  // Storage states
  const [apps, setApps] = useState<AppItem[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showcaseLayout, setShowcaseLayout] = useState<"horizontal" | "vertical">("horizontal");
  const [language, setLanguage] = useState("EN");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Auth states
  const [currentUser, setCurrentUser] = useState<{ email: string; isAdmin: boolean } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Newsletter subscription state
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Load database values on mount
  useEffect(() => {
    setApps(db.getApps());
    setBookmarks(db.getFavorites());

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        let isAdmin = user.email.toLowerCase() === "indiafff568@gmail.com";
        const userRef = doc(firestoreDb, "users", user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            isAdmin = userDoc.data().isAdmin || isAdmin;
          }
        } catch (dbErr) {
          console.warn("Could not retrieve user info from Firestore on state change:", dbErr);
        }
        const parsedUser = { email: user.email, isAdmin };
        setCurrentUser(parsedUser);
        localStorage.setItem("xrok_current_user", JSON.stringify(parsedUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem("xrok_current_user");
      }
    });

    // Load theme setting
    const savedTheme = localStorage.getItem("xrok_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }

    return () => unsubscribe();
  }, []);

  // Dynamically update page favicon in DOM
  useEffect(() => {
    if (faviconUrl) {
      try {
        const link = (document.querySelector("link[rel~='icon']") || document.createElement('link')) as HTMLLinkElement;
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = faviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      } catch (err) {
        console.warn("Failed to set favicon in DOM:", err);
      }
    }
  }, [faviconUrl]);

  // Load settings and apps from Firestore on mount
  useEffect(() => {
    const loadFirestoreData = async () => {
      // 1. Fetch website logo and favicon settings
      try {
        const settingsRef = doc(firestoreDb, "settings", "website");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setLogoUrl(data.logoUrl || "");
          setFaviconUrl(data.faviconUrl || "");
        }
      } catch (err) {
        console.warn("Firestore settings load failed:", err);
      }

      // 2. Fetch or seed apps
      try {
        const appsRef = collection(firestoreDb, "apps");
        const querySnapshot = await getDocs(appsRef);
        let fbApps: AppItem[] = [];
        querySnapshot.forEach((doc) => {
          fbApps.push(doc.data() as AppItem);
        });

        if (fbApps.length > 0) {
          setApps(fbApps);
        } else {
          console.log("No apps found in Firestore on startup. Seeding Firestore apps collection...");
          const defaultApps = db.getApps();
          for (const app of defaultApps) {
            await setDoc(doc(firestoreDb, "apps", app.id), app);
          }
          setApps(defaultApps);
        }
      } catch (err) {
        console.warn("Firestore apps load failed, using local storage:", err);
      }
    };

    loadFirestoreData();
  }, []);

  const handleAuthSuccess = (user: { email: string; isAdmin: boolean }) => {
    setCurrentUser(user);
    localStorage.setItem("xrok_current_user", JSON.stringify(user));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem("xrok_current_user");
    sessionStorage.removeItem("xrok_admin_session");
    setCurrentPage("home");
  };

  const handleRefreshApps = async () => {
    try {
      const appsRef = collection(firestoreDb, "apps");
      const querySnapshot = await getDocs(appsRef);
      let fbApps: AppItem[] = [];
      querySnapshot.forEach((doc) => {
        fbApps.push(doc.data() as AppItem);
      });
      if (fbApps.length > 0) {
        setApps(fbApps);
      } else {
        setApps(db.getApps());
      }
    } catch (err) {
      console.warn("Could not load from Firestore, falling back to local DB:", err);
      setApps(db.getApps());
    }
  };

  const handleBookmarkToggle = (appId: string) => {
    const updated = db.toggleFavorite(appId);
    setBookmarks(updated);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("xrok_theme", newTheme);
  };

  const handleNavigate = (pageStr: string) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (pageStr === "home") {
      setActiveCategory("All");
      setSearchQuery("");
    }
    setCurrentPage(pageStr as Page);
  };

  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    handleNavigate("details");
  };

  const handleDownloadLogged = () => {
    // Reload local data to reflect download increments in counters
    setApps(db.getApps());
  };

  // Filter and sort applications for Home and Search
  const filteredApps = apps.filter((app) => {
    if (!app.visibility) return false;
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === "All" || app.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === "popular") {
      return b.rating - a.rating;
    }
    if (sortBy === "newest") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === "downloads") {
      return b.downloads - a.downloads;
    }
    if (sortBy === "az") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const featuredApps = apps.filter(app => app.featured && app.visibility);
  const latestApps = [...apps].filter(app => app.visibility).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4);
  const popularApps = [...apps].filter(app => app.visibility).sort((a, b) => b.downloads - a.downloads).slice(0, 4);

  const selectedApp = apps.find((app) => app.id === selectedAppId);

  // Categories list
  const categories = ["All", "Productivity", "Utility", "Entertainment", "Tools", "Gaming", "Finance"];

  // Total statistics mock values
  const totalAppsPublishedCount = apps.length + 8; // Including hidden or virtual items
  const totalDownloadsSum = apps.reduce((sum, app) => sum + app.downloads, 0) + 120000;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === "dark" ? "bg-brand-bg text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Background radial glow */}
      {theme === "dark" && (
        <div className="fixed inset-0 bg-radial-gradient pointer-events-none z-0" />
      )}

      {/* Header / Navbar */}
      <div className="relative z-50">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          bookmarksCount={bookmarks.length}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          language={language}
          onLanguageChange={setLanguage}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onSignInClick={() => setIsAuthModalOpen(true)}
          logoUrl={logoUrl}
        />
      </div>

      {/* Main Page Templates */}
      <main className="relative z-10 pb-16">
        <AnimatePresence mode="wait">
          
          {/* PAGE 1: HOME PAGE */}
          {currentPage === "home" && !searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Microsoft Store App Showcase Banner Section */}
              <div className="max-w-7xl mx-auto px-6 pt-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                  <div>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-6 bg-gradient-to-b from-primary to-secondary rounded-full" />
                      Showcase Apps
                    </h2>
                    <p className="text-gray-400 text-xs font-sans">Browse certified packages. Click to view download menu.</p>
                  </div>
                  {/* Scroll controls and Layout Switcher */}
                  <div className="flex gap-2 items-center">
                    {/* Vertical / Horizontal Layout Switcher */}
                    <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1 mr-2 text-[10px] sm:text-[11px] font-bold text-gray-400">
                      <button
                        onClick={() => setShowcaseLayout("horizontal")}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          showcaseLayout === "horizontal"
                            ? "bg-primary text-white shadow"
                            : "hover:text-white"
                        }`}
                        title="Horizontal Showcase Scroll"
                      >
                        Horizontal
                      </button>
                      <button
                        onClick={() => setShowcaseLayout("vertical")}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          showcaseLayout === "vertical"
                            ? "bg-primary text-white shadow"
                            : "hover:text-white"
                        }`}
                        title="Vertical Showcase List"
                      >
                        Vertical
                      </button>
                    </div>

                    {showcaseLayout === "horizontal" && (
                      <>
                        <button 
                          onClick={() => {
                            const el = document.getElementById("ms-store-banner-slider");
                            if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white rounded-xl transition-all cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            const el = document.getElementById("ms-store-banner-slider");
                            if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white rounded-xl transition-all cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {showcaseLayout === "horizontal" ? (
                  /* Horizontal Scrolling Banner Slider */
                  <div 
                    id="ms-store-banner-slider" 
                    className="flex overflow-x-auto gap-6 pb-4 scrollbar-none snap-x snap-mandatory animate-fadeIn"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {apps.filter(app => app.visibility).map((app) => (
                      <div 
                        key={app.id}
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setCurrentPage("download");
                        }}
                        className="flex-none w-[280px] sm:w-[350px] bg-[#1E293B]/80 hover:bg-[#1E293B] border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 snap-start shrink-0"
                      >
                        {/* Wide Backdrop/Cover Banner */}
                        <div className="h-[120px] sm:h-[140px] relative overflow-hidden bg-slate-900">
                          <img 
                            src={app.banner || app.icon} 
                            alt="" 
                            className="w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-500" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-black/30" />
                          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-accent font-mono">
                            {app.category}
                          </div>
                        </div>

                        {/* Content Details */}
                        <div className="p-5 flex gap-4 items-start">
                          {/* Large App Icon */}
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-brand-bg shrink-0 border border-white/10 relative -mt-10 shadow-xl z-10">
                            <img src={app.icon} alt={app.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-display font-bold text-xs sm:text-sm text-white truncate group-hover:text-accent transition-colors leading-snug">
                              {app.name}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">{app.packageName}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold font-mono">
                                <Star size={10} fill="currentColor" /> {app.rating.toFixed(1)}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">•</span>
                              <span className="text-[10px] text-gray-400 font-semibold font-mono">
                                {(app.downloads >= 1000 ? `${(app.downloads/1000).toFixed(1)}k` : app.downloads)} Installs
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Get Button / Click Actions */}
                        <div className="px-5 py-3 flex justify-between items-center border-t border-white/5 bg-black/10">
                          <span className="text-[9px] text-emerald-400 font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Secure APK
                          </span>
                          <button className="px-3.5 py-1 bg-primary group-hover:bg-accent text-white font-black text-[9px] rounded-lg tracking-wider uppercase transition-all duration-200">
                            Get App
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Vertical Showcase Layout - side-by-side bento lists matching Microsoft Store */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
                    {apps.filter(app => app.visibility).map((app) => (
                      <div 
                        key={app.id}
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setCurrentPage("download");
                        }}
                        className="flex bg-[#1E293B]/60 hover:bg-[#1E293B] border border-white/5 hover:border-primary/30 p-4 rounded-3xl items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group"
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-bg border border-white/10 shrink-0 shadow-lg relative">
                          <img src={app.icon} alt={app.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-accent font-mono bg-accent/10 px-2 py-0.5 rounded-md">
                            {app.category}
                          </span>
                          <h3 className="font-display font-bold text-xs sm:text-sm text-white truncate group-hover:text-accent transition-colors mt-1.5 leading-tight">
                            {app.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold font-mono">
                              <Star size={10} fill="currentColor" /> {app.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <span className="text-gray-400 text-[10px] font-mono truncate max-w-[140px]">{app.packageName}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="px-3 py-1.5 bg-white/5 hover:bg-primary text-white text-[10px] font-bold rounded-xl transition-all border border-white/5 group-hover:bg-primary group-hover:border-primary shadow-sm">
                            Get
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Bento Grid */}
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Bento Card 1: Featured App (Large Hero) */}
                <section className="col-span-12 md:col-span-8 rounded-3xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-end min-h-[380px] lg:min-h-[440px] group shadow-xl">
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-25 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-l from-primary/40 to-transparent"></div>
                  </div>
                  {/* Subtle app banner underlay */}
                  {featuredApps[0] && (
                    <div className="absolute inset-0 opacity-15 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                      <img src={featuredApps[0].banner} alt="" className="w-full h-full object-cover filter blur-[2px]" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/75 to-transparent"></div>
                    </div>
                  )}
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2563EB]/20 border border-[#2563EB]/30 rounded-full text-accent text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>Featured Application</span>
                    </div>
                    {featuredApps[0] ? (
                      <>
                        <h1 className="text-3xl sm:text-5xl font-black mb-1.5 leading-tight tracking-tight text-white font-display">
                          {featuredApps[0].name} <br/>
                          <span className="text-slate-400 text-xl sm:text-2xl font-medium">v{featuredApps[0].version}</span>
                        </h1>
                        <p className="text-slate-300 max-w-lg text-xs sm:text-sm mb-4 leading-relaxed line-clamp-2">
                          {featuredApps[0].shortDescription}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <button 
                            onClick={() => handleSelectApp(featuredApps[0].id)}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
                          >
                            Download APK
                          </button>
                          <button 
                            onClick={() => handleSelectApp(featuredApps[0].id)}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-xs backdrop-blur-sm hover:scale-105 transition-all text-white cursor-pointer"
                          >
                            Explore Features
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h1 className="text-3xl sm:text-5xl font-black mb-1.5 leading-tight tracking-tight text-white font-display">
                          xrok App Market
                        </h1>
                        <p className="text-slate-300 max-w-lg text-xs sm:text-sm mb-4 leading-relaxed">
                          Verified, compiled secure Android APK releases. Offline package integrity scanner & high-performance sandbox.
                        </p>
                      </>
                    )}
                  </div>
                </section>

                {/* Bento Card 2: Quick Stats Bento */}
                <section className="col-span-12 sm:col-span-6 md:col-span-4 rounded-3xl bg-[#1E293B] border border-white/10 p-6 flex flex-col justify-between min-h-[220px] shadow-xl">
                  <div className="flex justify-between items-start">
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-mono">Platform Growth</h3>
                    <span className="text-[#22C55E] text-[10px] font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded-full">+12% Today</span>
                  </div>
                  <div className="flex gap-4 items-end pt-4 justify-between">
                    <div>
                      <div className="text-3xl font-black text-white font-display">{(totalDownloadsSum / 1000).toFixed(0)}k+</div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Total Downloads</div>
                    </div>
                    <div className="flex h-12 items-end gap-1 pb-1 w-24">
                      <div className="w-full h-1/2 bg-slate-700/60 rounded-sm"></div>
                      <div className="w-full h-3/4 bg-slate-700/60 rounded-sm"></div>
                      <div className="w-full h-1/2 bg-slate-700/60 rounded-sm"></div>
                      <div className="w-full h-full bg-[#2563EB] rounded-sm animate-pulse"></div>
                      <div className="w-full h-2/3 bg-slate-700/60 rounded-sm"></div>
                    </div>
                  </div>
                </section>

                {/* Bento Card 4: Trending / Spotlight Apps */}
                <section className="col-span-12 sm:col-span-6 md:col-span-4 rounded-3xl bg-[#1E293B] border border-white/10 p-6 flex flex-col justify-between min-h-[240px] shadow-xl">
                  <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-mono mb-3">Trending Now</h3>
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    {popularApps.slice(0, 2).map((app) => (
                      <div 
                        key={app.id} 
                        onClick={() => handleSelectApp(app.id)}
                        className="flex items-center gap-3 group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shrink-0 border border-white/10 bg-brand-bg relative">
                          <img src={app.icon} alt={app.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-accent transition-colors truncate">{app.name}</div>
                          <div className="text-[9px] text-slate-400 font-semibold truncate">{app.category} • {app.rating.toFixed(1)}★</div>
                        </div>
                        <button className="p-1 text-slate-400 hover:text-white shrink-0">
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Bento Card 5: PWA Install Promo */}
                <section className="col-span-12 sm:col-span-6 md:col-span-4 rounded-3xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] p-6 relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-xl">
                  <div className="relative z-10">
                    <h2 className="text-xl font-black mb-1 text-white font-display">xrok On Your Home Screen</h2>
                    <p className="text-white/80 text-[10px] leading-relaxed max-w-xs">Experience the premium native app feel with zero installation. Install our PWA for offline access.</p>
                  </div>
                  <div className="flex items-center justify-between relative z-10 mt-4">
                    <button 
                      onClick={() => {
                        alert("PWA setup initiated successfully inside private sandbox!");
                      }}
                      className="bg-white text-[#0F172A] hover:bg-slate-100 px-4 py-2 rounded-xl font-bold text-[11px] shadow-xl hover:scale-105 transition-all cursor-pointer"
                    >
                      Install Now
                    </button>
                    <div className="flex -space-x-1.5 shrink-0">
                      <div className="w-7 h-7 rounded-full border-2 border-white/20 bg-slate-200 overflow-hidden shrink-0">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&fit=crop" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-7 h-7 rounded-full border-2 border-white/20 bg-slate-300 overflow-hidden shrink-0">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&fit=crop" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-7 h-7 rounded-full border-2 border-white/20 bg-slate-400 overflow-hidden shrink-0 text-[8px] flex items-center justify-center text-black font-extrabold font-mono bg-white">
                        +15k
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                </section>

                {/* Bento Card 6: Conditional Admin Dashboard / Sandbox Security Info */}
                {currentUser?.isAdmin ? (
                  <section 
                    onClick={() => handleNavigate("admin")}
                    className="col-span-12 sm:col-span-12 md:col-span-4 rounded-3xl bg-[#1E293B] border border-dashed border-white/20 p-6 flex items-center justify-center group cursor-pointer hover:bg-slate-800/80 hover:border-white/30 transition-all min-h-[240px] shadow-xl"
                  >
                    <div className="text-center">
                      <div className="w-11 h-11 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5 group-hover:scale-110 group-hover:border-primary/30 group-hover:bg-primary/15 transition-all duration-300">
                        <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm font-display group-hover:text-accent transition-colors">Admin Dashboard</h4>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto font-sans">Manage deployments, review analytics &amp; audit sandbox files</p>
                    </div>
                  </section>
                ) : (
                  <section 
                    className="col-span-12 sm:col-span-12 md:col-span-4 rounded-3xl bg-[#1E293B] border border-white/10 p-6 flex flex-col justify-between min-h-[240px] shadow-xl relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-bold text-white text-xs sm:text-sm font-display">xrok Sandbox Security</h4>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Every application uploaded to xrok is dynamically executed inside a secure, private sandbox. We ensure zero tracking, zero malware, and complete cryptographic compliance.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">● 100% SECURE HANDSHAKE</span>
                      <span className="text-[9px] text-slate-500">v2.4.1</span>
                    </div>
                  </section>
                )}
                
              </div>

              {/* Featured Apps Showcase Section */}
              <section id="featured-section" className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight uppercase tracking-widest font-display flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      <span>Featured Editor's Picks</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Hand-picked packages showing extreme stability and creative designs.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onClick={() => handleSelectApp(app.id)}
                      onBookmarkToggle={() => handleBookmarkToggle(app.id)}
                      isBookmarked={bookmarks.includes(app.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Latest Uploads & Popular Split Section */}
              <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Column Left: Latest Apps list */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <Smartphone size={18} className="text-accent" />
                      <span>Recently Uploaded Builds</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Lately published build updates and initial developer APK rollouts.</p>
                  </div>

                  <div className="space-y-4">
                    {latestApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleSelectApp(app.id)}
                        className="flex gap-4 p-4 rounded-2xl glassmorphism border border-white/5 hover:border-accent/20 cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-bg border border-white/10 shrink-0">
                          <img src={app.icon} alt={app.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-accent transition-colors truncate font-display">
                              {app.name}
                            </h4>
                            <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-wider px-2 py-0.5 bg-accent/15 border border-accent/10 rounded">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate mb-2 mt-0.5">{app.shortDescription}</p>
                          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-semibold">
                            <span>Ver {app.version}</span>
                            <span>{app.size}</span>
                            <span className="flex items-center gap-0.5 text-amber-400"><Star size={10} fill="currentColor" /> {app.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column Right: Popular Apps list */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <ArrowDown size={18} className="text-secondary" />
                      <span>Top Downloaded Software</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Most installed applications with verified high aggregate scores.</p>
                  </div>

                  <div className="space-y-4">
                    {popularApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleSelectApp(app.id)}
                        className="flex gap-4 p-4 rounded-2xl glassmorphism border border-white/5 hover:border-accent/20 cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-bg border border-white/10 shrink-0">
                          <img src={app.icon} alt={app.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-accent transition-colors truncate font-display">
                              {app.name}
                            </h4>
                            <span className="text-[9px] font-mono font-bold text-secondary uppercase tracking-wider px-2 py-0.5 bg-secondary/15 border border-secondary/10 rounded">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 truncate mb-2 mt-0.5">{app.shortDescription}</p>
                          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-semibold">
                            <span className="text-gray-300">{(app.downloads >= 1000 ? `${(app.downloads/1000).toFixed(1)}k` : app.downloads)} Downloads</span>
                            <span>Ver {app.version}</span>
                            <span className="flex items-center gap-0.5 text-amber-400"><Star size={10} fill="currentColor" /> {app.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

              {/* Website Statistics section */}
              <section className="bg-black/20 py-16 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div className="space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                      {totalAppsPublishedCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Apps Published</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-accent font-display">
                      15,400+
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Active Users</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-secondary font-display">
                      {totalDownloadsSum.toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Safe Downloads</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-display">
                      4.8 / 5
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Average Rating</p>
                  </div>
                </div>
              </section>

              {/* Testimonials sliding reviews */}
              <section className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-accent uppercase tracking-widest font-mono">TESTIMONIALS</h3>
                  <h2 className="text-2xl font-extrabold text-white font-display mt-2">What Android Users Say</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { name: "Julian Vance", role: "Mobile Power-user", comment: "The absolute cleanest Android platform index. No malicious banner ads, no malware alerts. You tap, scan the QR code, and get a pristine, verified APK. xrok is phenomenal." },
                    { name: "Samantha Lee", role: "UI Designer", comment: "Excellent glassmorphic visual presentation. The countdown downloader performs a real SHA-256 integrity check and security validation. Unbelievable degree of layout craft!" },
                    { name: "Hiroto Sato", role: "Android Developer", comment: "As a dev, having a deployment center where I can lock onto a terminal console and upload packages directly without changing source code is insanely useful. Simple, reliable, perfect." }
                  ].map((test, index) => (
                    <div key={index} className="p-6 glassmorphism border border-white/5 rounded-3xl space-y-4">
                      <p className="text-xs text-gray-300 leading-relaxed italic">"{test.comment}"</p>
                      <div className="border-t border-white/5 pt-3">
                        <p className="text-xs font-bold text-white font-display">{test.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{test.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Newsletter section */}
              <section className="max-w-5xl mx-auto px-6">
                <div className="p-8 sm:p-12 bg-gradient-to-tr from-primary/10 via-brand-card to-secondary/15 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                  <div className="space-y-2 text-center md:text-left max-w-md">
                    <h3 className="text-xl font-bold text-white font-display">Never Miss a Build Update</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Join 8,000+ developers subscribing to our weekly newsletter digests. Receive instant alerts on package upgrades, security handshakes, and trending modules.
                    </p>
                  </div>

                  {subscribed ? (
                    <div className="p-4 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-semibold rounded-2xl text-xs text-center">
                      Welcome aboard! Your email is verified under SHA secure handshake.
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => { e.preventDefault(); if (emailInput) setSubscribed(true); }}
                      className="flex gap-2 w-full max-w-md"
                    >
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-black/25 focus:bg-black/50 border border-white/5 focus:border-accent/40 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
                      >
                        Subscribe
                      </button>
                    </form>
                  )}
                </div>
              </section>

            </motion.div>
          )}

          {/* PAGE 2: SEARCH & FILTER RESULTS VIEW */}
          {(currentPage === "search" || searchQuery) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn"
            >
              {/* Back indicator if query was present */}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    handleNavigate("home");
                  }}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  Clear search and return home
                </button>
              )}

              {/* Title & Sorting Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    {searchQuery ? `Search Results for "${searchQuery}"` : `${activeCategory} Applications`}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Found {sortedApps.length} compiled APK package{sortedApps.length === 1 ? "" : "s"} under active release.
                  </p>
                </div>

                {/* Filters control */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Category select filter */}
                  <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-xl border border-white/5">
                    <span className="text-gray-400">Category:</span>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="bg-transparent focus:outline-none text-white font-bold cursor-pointer font-sans"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-brand-card">{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort parameter selector */}
                  <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-1.5 rounded-xl border border-white/5">
                    <span className="text-gray-400">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent focus:outline-none text-white font-bold cursor-pointer font-sans"
                    >
                      <option value="popular" className="bg-brand-card">Most Popular</option>
                      <option value="newest" className="bg-brand-card">Latest Updated</option>
                      <option value="downloads" className="bg-brand-card">Install Volume</option>
                      <option value="az" className="bg-brand-card">Alphabetical A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Apps grid */}
              {sortedApps.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                  <AlertCircle size={40} className="mx-auto text-gray-500 animate-bounce" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">No applications match your criteria</h3>
                    <p className="text-xs text-gray-400">Try adjusting your category selection, spelling, or filter queries.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                    }}
                    className="px-4 py-2 bg-primary/20 text-accent font-semibold border border-primary/20 rounded-xl text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onClick={() => handleSelectApp(app.id)}
                      onBookmarkToggle={() => handleBookmarkToggle(app.id)}
                      isBookmarked={bookmarks.includes(app.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PAGE 3: APP DETAILS PAGE */}
          {currentPage === "details" && selectedApp && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
            >
              <AppDetails
                app={selectedApp}
                allApps={apps}
                onBack={() => handleNavigate("home")}
                onDownloadClick={() => handleNavigate("download")}
                onNavigateToApp={(id) => handleSelectApp(id)}
                isBookmarked={bookmarks.includes(selectedApp.id)}
                onBookmarkToggle={() => handleBookmarkToggle(selectedApp.id)}
              />
            </motion.div>
          )}

          {/* PAGE 4: DOWNLOAD PREPARING PAGE */}
          {currentPage === "download" && selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DownloadProgress
                app={selectedApp}
                onBack={() => handleNavigate("details")}
                onDownloadLogged={handleDownloadLogged}
              />
            </motion.div>
          )}

          {/* PAGE 5: BOOKMARKS LIST PAGE */}
          {currentPage === "bookmarks" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fadeIn"
            >
              <div>
                <h1 className="text-xl font-bold text-white font-display">My Bookmarks</h1>
                <p className="text-xs text-gray-400 mt-1">Applications stored locally inside your private workspace profile.</p>
              </div>

              {bookmarks.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                  <Star size={40} className="mx-auto text-gray-600" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Your favorites list is empty</h3>
                    <p className="text-xs text-gray-400">Bookmark applications in their details screen to reference here.</p>
                  </div>
                  <button
                    onClick={() => handleNavigate("home")}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-xs"
                  >
                    Go Explore Apps
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {apps
                    .filter((app) => bookmarks.includes(app.id))
                    .map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        onClick={() => handleSelectApp(app.id)}
                        onBookmarkToggle={() => handleBookmarkToggle(app.id)}
                        isBookmarked={true}
                      />
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PAGE 6: ADMIN CONSOLE PANEL */}
          {currentPage === "admin" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel
                onBack={() => handleNavigate("home")}
                allApps={apps}
                onRefreshApps={handleRefreshApps}
                currentUser={currentUser}
                logoUrl={logoUrl}
                onUpdateLogoUrl={setLogoUrl}
                faviconUrl={faviconUrl}
                onUpdateFaviconUrl={setFaviconUrl}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Persistent Beautiful Footer */}
      <footer className="border-t border-white/5 bg-black/40 py-12 relative z-10 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                <span className="font-display font-extrabold text-sm text-white">xr</span>
              </div>
              <span className="font-display font-black text-lg text-white">xrok</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              A professional, offline-first secure marketplace for verified Android APK applications and utilities compiled without behavioral analytics.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider font-display">Directory</h4>
            <ul className="space-y-2 text-gray-400 font-semibold">
              <li>
                <button onClick={() => { setActiveCategory("All"); handleNavigate("search"); }} className="hover:text-accent transition-colors">
                  All Applications
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveCategory("Productivity"); handleNavigate("search"); }} className="hover:text-accent transition-colors">
                  Productivity Widgets
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveCategory("Gaming"); handleNavigate("search"); }} className="hover:text-accent transition-colors">
                  Arcade Gaming
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveCategory("Utility"); handleNavigate("search"); }} className="hover:text-accent transition-colors">
                  Privacy Utilities
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider font-display">Legals</h4>
            <ul className="space-y-2 text-gray-400 font-semibold">
              <li><a href="#privacy" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#dmca" className="hover:text-accent transition-colors">DMCA Takedown</a></li>
              <li><a href="#support" className="hover:text-accent transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider font-display">Integrity Handshake</h4>
            <div className="space-y-2 text-gray-400 text-[11px] leading-relaxed">
              <p>Every file is checksummed under SHA-256 and cross-scanned against multiple real antivirus definitions.</p>
              <div className="flex gap-2 items-center text-emerald-400 font-mono font-bold pt-1">
                <ShieldCheck size={14} />
                <span>Verified Clean Market</span>
              </div>
            </div>
          </div>

        </div>

        {/* Outer bottom footer strip */}
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[10px] font-mono">
          <span>&copy; {new Date().getFullYear()} xrok Android App Market. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Powered by xrok Core Dev</span>
            <span>Secure TLS Handshake</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
