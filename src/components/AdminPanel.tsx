import React, { useState, useEffect } from "react";
import { AppItem, Review, DownloadEvent } from "../types";
import { db } from "../dbHelper";
import { Charts } from "./Charts";
import { 
  Lock, LayoutDashboard, UploadCloud, FolderEdit, MessageSquare, LineChart, 
  Trash2, Edit3, Eye, EyeOff, Star, Copy, RefreshCw, Plus, Minus, Check, 
  LogOut, ShieldAlert, FileCode, CheckSquare, Sparkles, Database, HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db as firestoreDb } from "../firebase";

interface AdminPanelProps {
  onBack: () => void;
  allApps: AppItem[];
  onRefreshApps: () => void;
  currentUser?: any;
  logoUrl?: string;
  onUpdateLogoUrl?: (url: string) => void;
  faviconUrl?: string;
  onUpdateFaviconUrl?: (url: string) => void;
}

type AdminTab = "dashboard" | "upload" | "manage" | "reviews" | "settings";

export function AdminPanel({ 
  onBack, 
  allApps, 
  onRefreshApps, 
  currentUser, 
  logoUrl: propLogoUrl, 
  onUpdateLogoUrl,
  faviconUrl,
  onUpdateFaviconUrl
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [downloads, setDownloads] = useState<DownloadEvent[]>([]);

  // Website Settings State
  const [logoInput, setLogoInput] = useState(propLogoUrl || "");
  const [faviconInput, setFaviconInput] = useState(faviconUrl || "");

  useEffect(() => {
    if (propLogoUrl) {
      setLogoInput(propLogoUrl);
    }
  }, [propLogoUrl]);

  useEffect(() => {
    if (faviconUrl) {
      setFaviconInput(faviconUrl);
    }
  }, [faviconUrl]);

  // Editing state
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  
  // Quick update version modal
  const [quickUpdateApp, setQuickUpdateApp] = useState<AppItem | null>(null);
  const [quickVersion, setQuickVersion] = useState("");
  const [quickWhatsNew, setQuickWhatsNew] = useState("");

  // Form Fields
  const [appName, setAppName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [developerName, setDeveloperName] = useState("");
  const [category, setCategory] = useState("Productivity");
  const [version, setVersion] = useState("1.0.0");
  const [versionCode, setVersionCode] = useState(1);
  const [size, setSize] = useState("15.2 MB");
  const [androidRequirement, setAndroidRequirement] = useState("Android 8.0 or higher");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [whatsNew, setWhatsNew] = useState("");
  const [icon, setIcon] = useState("");
  const [banner, setBanner] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [screenshotInput, setScreenshotInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [website, setWebsite] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [mirrorUrl, setMirrorUrl] = useState("");
  const [apkUrl, setApkUrl] = useState("");
  
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [visibility, setVisibility] = useState(true);

  const [toastMessage, setToastMessage] = useState("");

  // Load backend statistics
  const loadData = async () => {
    // 1. Load apps
    let loadedApps: AppItem[] = [];
    try {
      const appsCollection = collection(firestoreDb, "apps");
      const appSnapshot = await getDocs(appsCollection);
      appSnapshot.forEach(doc => {
        loadedApps.push(doc.data() as AppItem);
      });
      if (loadedApps.length > 0) {
        setApps(loadedApps);
      } else {
        loadedApps = db.getApps();
        setApps(loadedApps);
      }
    } catch (err) {
      console.warn("Could not load apps from Firestore for admin:", err);
      loadedApps = db.getApps();
      setApps(loadedApps);
    }

    // 2. Load downloads
    try {
      const downloadsCollection = collection(firestoreDb, "downloads");
      const dSnapshot = await getDocs(downloadsCollection);
      const fbDownloads: DownloadEvent[] = [];
      dSnapshot.forEach(doc => {
        fbDownloads.push(doc.data() as DownloadEvent);
      });
      if (fbDownloads.length > 0) {
        fbDownloads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setDownloads(fbDownloads);
      } else {
        setDownloads(db.getDownloads());
      }
    } catch (err) {
      console.warn("Could not load downloads from Firestore for admin:", err);
      setDownloads(db.getDownloads());
    }

    // 3. Load reviews
    try {
      const allReviews: Review[] = [];
      for (const a of loadedApps) {
        const rRef = collection(firestoreDb, "apps", a.id, "reviews");
        const rSnap = await getDocs(rRef);
        rSnap.forEach(d => {
          allReviews.push(d.data() as Review);
        });
      }
      if (allReviews.length > 0) {
        allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(allReviews);
      } else {
        setReviews(db.getReviews());
      }
    } catch (err) {
      console.warn("Could not load reviews from Firestore subcollections for admin, using local fallback:", err);
      setReviews(db.getReviews());
    }
  };

  useEffect(() => {
    loadData();
    // Check if previously logged in or logged in as admin in the main app session
    const session = sessionStorage.getItem("xrok_admin_session");
    if (session === "active" || (currentUser && currentUser.isAdmin)) {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, try matching registered user accounts in the local DB
    try {
      const matched = db.loginUser(email, password);
      if (matched.isAdmin) {
        setIsAuthenticated(true);
        sessionStorage.setItem("xrok_admin_session", "active");
        setLoginError("");
        return;
      }
    } catch (err: any) {
      // Fail silently and check hardcoded admin below
    }

    if (email === "admin@xrok.com" && password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem("xrok_admin_session", "active");
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Please use admin@xrok.com or your registered admin account (e.g. indiafff568@gmail.com).");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("xrok_admin_session");
  };

  // List additions helpers
  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };
  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, idx) => idx !== index));
  };

  const addPermission = () => {
    if (permissionInput.trim()) {
      setPermissions([...permissions, permissionInput.trim()]);
      setPermissionInput("");
    }
  };
  const removePermission = (index: number) => {
    setPermissions(permissions.filter((_, idx) => idx !== index));
  };

  const addScreenshot = () => {
    if (screenshotInput.trim()) {
      setScreenshots([...screenshots, screenshotInput.trim()]);
      setScreenshotInput("");
    }
  };
  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, idx) => idx !== index));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = (index: number) => {
    setTags(tags.filter((_, idx) => idx !== index));
  };

  // Reset Form
  const resetForm = () => {
    setEditingAppId(null);
    setAppName("");
    setPackageName("");
    setDeveloperName("xrok Labs");
    setCategory("Productivity");
    setVersion("1.0.0");
    setVersionCode(1);
    setSize("12.5 MB");
    setAndroidRequirement("Android 8.0 or higher");
    setShortDescription("");
    setDescription("");
    setWhatsNew("");
    setIcon("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80");
    setBanner("https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80");
    setScreenshots([
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&q=80"
    ]);
    setFeatures([
      "Beautiful user interface with seamless loading states",
      "High performance engines with background execution models"
    ]);
    setPermissions([
      "Access Network Connection",
      "Vibrate Hardware Keys"
    ]);
    setTags(["tools", "utility", "essential"]);
    setWebsite("https://xrok.com");
    setPrivacyPolicy("https://xrok.com/privacy");
    setMirrorUrl("");
    setApkUrl("");
    setFeatured(false);
    setPopular(false);
    setVisibility(true);
  };

  // Handle Save App (Add or Edit)
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentApps = db.getApps();

    const apkMockUrl = apkUrl.trim() || `https://github.com/example/${packageName.replace(/\./g, "-")}/releases/download/v${version}/${packageName.split(".").pop()}.apk`;
    const appData: AppItem = {
      id: editingAppId || appName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: appName,
      packageName,
      developerName,
      category,
      version,
      versionCode: Number(versionCode),
      size,
      updatedAt: new Date().toISOString().split("T")[0],
      releasedAt: editingAppId ? (currentApps.find(a => a.id === editingAppId)?.releasedAt || "2026-01-01") : new Date().toISOString().split("T")[0],
      androidRequirement,
      shortDescription,
      description,
      features: features.length > 0 ? features : ["Fully optimized for Android devices."],
      whatsNew,
      permissions: permissions.length > 0 ? permissions : ["Access Network Connection"],
      icon: icon || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80",
      banner: banner || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80",
      screenshots: screenshots.length > 0 ? screenshots : ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80"],
      downloads: editingAppId ? (currentApps.find(a => a.id === editingAppId)?.downloads || 250) : 250,
      rating: editingAppId ? (currentApps.find(a => a.id === editingAppId)?.rating || 4.5) : 4.5,
      featured,
      popular,
      trending: false,
      visibility,
      apkUrl: apkMockUrl,
      mirrorUrl: mirrorUrl || "",
      checksum: editingAppId ? (currentApps.find(a => a.id === editingAppId)?.checksum || "da39a3ee5e6b4b0d3255bfef95601890afd80709") : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      tags: tags.length > 0 ? tags : ["xrok"],
      website,
      privacyPolicy
    };

    let updatedApps: AppItem[];
    if (editingAppId) {
      updatedApps = currentApps.map(a => (a.id === editingAppId ? appData : a));
    } else {
      updatedApps = [appData, ...currentApps];
    }

    // Save locally
    db.saveApps(updatedApps);

    // Save to Firestore
    try {
      await setDoc(doc(firestoreDb, "apps", appData.id), appData);
      showToast(editingAppId ? "App updated in Firestore!" : "New app added to Firestore!");
    } catch (err) {
      console.error("Firestore app sync failed:", err);
      showToast("Saved locally, but Firestore sync failed.");
    }

    onRefreshApps();
    await loadData();
    resetForm();
    setActiveTab("manage");
  };

  // Populate form for editing
  const handleEditApp = (app: AppItem) => {
    setEditingAppId(app.id);
    setAppName(app.name);
    setPackageName(app.packageName);
    setDeveloperName(app.developerName);
    setCategory(app.category);
    setVersion(app.version);
    setVersionCode(app.versionCode);
    setSize(app.size);
    setAndroidRequirement(app.androidRequirement);
    setShortDescription(app.shortDescription);
    setDescription(app.description);
    setWhatsNew(app.whatsNew);
    setIcon(app.icon);
    setBanner(app.banner);
    setScreenshots(app.screenshots);
    setFeatures(app.features);
    setPermissions(app.permissions);
    setTags(app.tags);
    setWebsite(app.website || "");
    setPrivacyPolicy(app.privacyPolicy || "");
    setMirrorUrl(app.mirrorUrl || "");
    setApkUrl(app.apkUrl || "");
    setFeatured(app.featured);
    setPopular(app.popular);
    setVisibility(app.visibility);

    setActiveTab("upload");
  };

  const handleDeleteApp = async (appId: string) => {
    if (confirm("Are you sure you want to permanently delete this application? This is irreversible.")) {
      const updated = apps.filter(a => a.id !== appId);
      db.saveApps(updated);
      try {
        await deleteDoc(doc(firestoreDb, "apps", appId));
        showToast("App deleted from Firestore!");
      } catch (err) {
        console.error("Firestore delete failed:", err);
      }
      onRefreshApps();
      await loadData();
      showToast("Application purged successfully.");
    }
  };

  const handleToggleVisibility = async (appId: string) => {
    const updated = apps.map(a => (a.id === appId ? { ...a, visibility: !a.visibility } : a));
    db.saveApps(updated);
    const targetApp = updated.find(a => a.id === appId);
    if (targetApp) {
      try {
        await setDoc(doc(firestoreDb, "apps", appId), targetApp);
      } catch (err) {
        console.error("Firestore visibility sync failed:", err);
      }
    }
    onRefreshApps();
    await loadData();
    showToast("Application visibility toggled.");
  };

  const handleToggleFeatured = async (appId: string) => {
    const updated = apps.map(a => (a.id === appId ? { ...a, featured: !a.featured } : a));
    db.saveApps(updated);
    const targetApp = updated.find(a => a.id === appId);
    if (targetApp) {
      try {
        await setDoc(doc(firestoreDb, "apps", appId), targetApp);
      } catch (err) {
        console.error("Firestore featured sync failed:", err);
      }
    }
    onRefreshApps();
    await loadData();
    showToast("Application featured toggle complete.");
  };

  const handleDuplicateApp = async (app: AppItem) => {
    const duplicate: AppItem = {
      ...app,
      id: app.id + "-copy",
      name: app.name + " (Copy)",
      packageName: app.packageName + ".copy",
      downloads: 0,
      rating: 5.0
    };
    const updated = [duplicate, ...apps];
    db.saveApps(updated);
    try {
      await setDoc(doc(firestoreDb, "apps", duplicate.id), duplicate);
    } catch (err) {
      console.error("Firestore duplicate sync failed:", err);
    }
    onRefreshApps();
    await loadData();
    showToast("Application duplicated successfully.");
  };

  // Review Operations
  const handleToggleReviewApprove = async (reviewId: string) => {
    const updated = reviews.map(r => (r.id === reviewId ? { ...r, approved: !r.approved } : r));
    db.saveReviews(updated);
    const r = updated.find(review => review.id === reviewId);
    if (r) {
      try {
        await setDoc(doc(firestoreDb, "apps", r.appId, "reviews", reviewId), r);
      } catch (err) {
        console.error("Firestore review approve sync failed:", err);
      }
    }
    await loadData();
    showToast("Review moderation state updated.");
  };

  const handleToggleReviewPin = async (reviewId: string) => {
    const updated = reviews.map(r => (r.id === reviewId ? { ...r, pinned: !r.pinned } : r));
    db.saveReviews(updated);
    const r = updated.find(review => review.id === reviewId);
    if (r) {
      try {
        await setDoc(doc(firestoreDb, "apps", r.appId, "reviews", reviewId), r);
      } catch (err) {
        console.error("Firestore review pin sync failed:", err);
      }
    }
    await loadData();
    showToast("Review pinned state updated.");
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Delete this user review?")) {
      const targetReview = reviews.find(r => r.id === reviewId);
      const updated = reviews.filter(r => r.id !== reviewId);
      db.saveReviews(updated);
      if (targetReview) {
        try {
          await deleteDoc(doc(firestoreDb, "apps", targetReview.appId, "reviews", reviewId));
        } catch (err) {
          console.error("Firestore review delete failed:", err);
        }
      }
      await loadData();
      showToast("Review removed.");
    }
  };

  // Quick version update saver
  const handleQuickVersionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUpdateApp) return;

    const updatedApp = {
      ...quickUpdateApp,
      version: quickVersion,
      whatsNew: quickWhatsNew,
      updatedAt: new Date().toISOString().split("T")[0]
    };

    const updated = apps.map(a => (a.id === quickUpdateApp.id ? updatedApp : a));
    db.saveApps(updated);
    
    try {
      await setDoc(doc(firestoreDb, "apps", quickUpdateApp.id), updatedApp);
    } catch (err) {
      console.error("Firestore quick update failed:", err);
    }

    onRefreshApps();
    await loadData();
    setQuickUpdateApp(null);
    showToast(`Quick updated ${quickUpdateApp.name} to version ${quickVersion}!`);
  };

  // Database seed reset
  const handleDatabaseReset = () => {
    if (confirm("DANGER: This will restore the store database to original seed state and wipe your custom uploads, reviews, or configurations. Proceed?")) {
      db.resetDatabase();
      onRefreshApps();
      loadData();
      showToast("Store database restored to clean factory seed state!");
    }
  };

  // Calculate high-level statistics
  const totalDownloads = apps.reduce((sum, a) => sum + a.downloads, 0);
  const totalReviewsCount = reviews.length;
  const storageMockUsed = (apps.length * 22.4).toFixed(1); // Mock MB storage used

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glassmorphism rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary to-primary" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              <Lock className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-extrabold text-white font-display">xrok Console Authorization</h2>
            <p className="text-xs text-gray-400">
              Authorized admin credentials required to compile packages and moderate community feedback.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-[11px] text-danger font-semibold mb-4 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-gray-400 font-mono">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@xrok.com"
                className="w-full bg-black/25 focus:bg-black/50 border border-white/5 focus:border-accent/40 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold text-gray-400 font-mono">Secret Security Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/25 focus:bg-black/50 border border-white/5 focus:border-accent/40 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Authenticate &amp; Initialize Console
            </button>
          </form>

          {/* Prompt guide */}
          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
              Demo access credentials:<br />
              Email: <span className="text-gray-300">admin@xrok.com</span> | Key: <span className="text-gray-300">admin123</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 relative">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-semibold text-xs py-3 px-6 rounded-2xl shadow-2xl z-50 flex items-center gap-2 border border-emerald-400"
          >
            <Check size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-widest">CONSOLE ACCESS ONLINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display flex items-center gap-2">
            xrok Deployment Center
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDatabaseReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 rounded-xl transition-all"
            title="Reset DB database"
          >
            <Database size={14} />
            <span>Restore Factory Defaults</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-danger hover:bg-danger/10 border border-danger/20 rounded-xl transition-all"
          >
            <LogOut size={14} />
            <span>Lock Terminal</span>
          </button>
        </div>
      </div>

      {/* Menu / Tabs Panel */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/5 pb-2 scrollbar-none">
        {[
          { id: "dashboard", label: "Stats & Analytics", icon: LayoutDashboard },
          { id: "upload", label: editingAppId ? "Modify Application" : "Upload Android App", icon: UploadCloud },
          { id: "manage", label: "Package Manager", icon: FolderEdit },
          { id: "reviews", label: "Feedback Moderation", icon: MessageSquare },
          { id: "settings", label: "Website Settings", icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
                if (tab.id !== "upload") {
                  resetForm();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                active 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats matrix cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glassmorphism rounded-2xl p-5 border border-white/5 shadow-md">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Total Apps Uploaded</span>
                <p className="text-2xl font-black text-white font-display mt-1">{apps.length}</p>
                <span className="text-[9px] text-accent font-mono">Live packages in CDN</span>
              </div>
              
              <div className="glassmorphism rounded-2xl p-5 border border-white/5 shadow-md">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Consolidated Installs</span>
                <p className="text-2xl font-black text-white font-display mt-1">{totalDownloads.toLocaleString()}</p>
                <span className="text-[9px] text-emerald-400 font-mono">+12.4% this week</span>
              </div>

              <div className="glassmorphism rounded-2xl p-5 border border-white/5 shadow-md">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Approved Feedback</span>
                <p className="text-2xl font-black text-white font-display mt-1">{totalReviewsCount}</p>
                <span className="text-[9px] text-amber-400 font-mono">Average 4.75 Rating</span>
              </div>

              <div className="glassmorphism rounded-2xl p-5 border border-white/5 shadow-md">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 font-mono">Virtual storage used</span>
                <p className="text-2xl font-black text-white font-display mt-1">{storageMockUsed} MB</p>
                <span className="text-[9px] text-purple-400 font-mono">5.0 GB Cloud Allocation</span>
              </div>
            </div>

            {/* Interactive Custom SVG Charts */}
            <Charts downloads={downloads} apps={apps} />

            {/* Recent Activity Table */}
            <div className="glassmorphism rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Recent App Installs</h3>
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-gray-400 uppercase tracking-widest text-[9px] font-mono">
                    <tr>
                      <th className="p-3">Application Name</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Deployment Node</th>
                      <th className="p-3">User Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {downloads.slice(0, 5).map((dl) => (
                      <tr key={dl.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-semibold text-white">{dl.appName}</td>
                        <td className="p-3 font-mono text-gray-400">
                          {new Date(dl.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-accent/20 text-accent font-mono text-[10px] rounded border border-accent/25">
                            {dl.platform}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-gray-400">{dl.country}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD APP FORM */}
        {activeTab === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl relative"
          >
            <div className="mb-6">
              <h2 className="text-md font-bold text-white uppercase tracking-wider font-display">
                {editingAppId ? `Editing App State: ${appName}` : "Create / Register New Application Bundle"}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Fill in all details to automatically package APK certificates, generate download links, and catalog the app.
              </p>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-6 text-xs">
              
              {/* Row 1: App Name & Package Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">App Name</label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => {
                      setAppName(e.target.value);
                      if (!editingAppId) {
                        setPackageName("com.xrok." + e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                      }
                    }}
                    placeholder="Zen Planner Pro"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Android Package Name</label>
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="com.xrok.zenplanner"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Category, Version, Code, Size */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none"
                  >
                    {["Productivity", "Utility", "Entertainment", "Tools", "Gaming", "Finance"].map((cat) => (
                      <option key={cat} value={cat} className="bg-brand-card">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Semantic Version</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Version Code</label>
                  <input
                    type="number"
                    required
                    value={versionCode}
                    onChange={(e) => setVersionCode(Number(e.target.value))}
                    placeholder="1"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Package Size</label>
                  <input
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="15.4 MB"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Dev Name, Android Requirement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Developer Name</label>
                  <input
                    type="text"
                    required
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    placeholder="xrok Labs"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Android Requirement</label>
                  <input
                    type="text"
                    required
                    value={androidRequirement}
                    onChange={(e) => setAndroidRequirement(e.target.value)}
                    placeholder="Android 8.0 or higher"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Short Catchy Description</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Elegant local-first offline Kanban board for personal scheduling..."
                  className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Extended Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a deep, elaborate explanation of the core functionalities..."
                  className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">What's New in this Build</label>
                <textarea
                  rows={2}
                  value={whatsNew}
                  onChange={(e) => setWhatsNew(e.target.value)}
                  placeholder="Added 4 new high fidelity ambient tracks, optimized resource threads..."
                  className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none resize-none"
                />
              </div>

              {/* Asset Links: Icon & Banner & APK URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">App Icon URL</label>
                  <input
                    type="url"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Banner Image URL</label>
                  <input
                    type="url"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">APK File Link (Direct Install)</label>
                  <input
                    type="url"
                    value={apkUrl}
                    onChange={(e) => setApkUrl(e.target.value)}
                    placeholder="https://example.com/download.apk"
                    className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Dynamic list editors: Screenshots, Features, Permissions, Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-white/5">
                {/* Features List */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono block">App Key Features</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Add key bullet point feature..."
                      className="flex-1 bg-black/20 border border-white/5 rounded-xl px-3 text-white focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 text-accent hover:bg-white/10"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <ul className="space-y-1.5 pt-1.5 max-h-32 overflow-y-auto pr-1">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex justify-between items-center gap-2 bg-black/10 p-2 rounded-lg border border-white/5 text-[11px] text-gray-300">
                        <span className="truncate">{feat}</span>
                        <button type="button" onClick={() => removeFeature(idx)} className="text-danger hover:scale-105 shrink-0">
                          <Minus size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Permissions List */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono block">Required Android Permissions</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={permissionInput}
                      onChange={(e) => setPermissionInput(e.target.value)}
                      placeholder="e.g. Access Camera, Run Background Audio..."
                      className="flex-1 bg-black/20 border border-white/5 rounded-xl px-3 text-white focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={addPermission}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 text-accent hover:bg-white/10"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <ul className="space-y-1.5 pt-1.5 max-h-32 overflow-y-auto pr-1">
                    {permissions.map((perm, idx) => (
                      <li key={idx} className="flex justify-between items-center gap-2 bg-black/10 p-2 rounded-lg border border-white/5 text-[11px] text-gray-300">
                        <span className="truncate">{perm}</span>
                        <button type="button" onClick={() => removePermission(idx)} className="text-danger hover:scale-105 shrink-0">
                          <Minus size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Screenshots List Input */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-mono block">Add Screenshot Image URLs</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={screenshotInput}
                    onChange={(e) => setScreenshotInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-black/20 border border-white/5 rounded-xl px-3 text-white focus:outline-none text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={addScreenshot}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 text-accent hover:bg-white/10"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {screenshots.map((screen, idx) => (
                    <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={screen} alt="screen" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-danger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags, Mirrors & Websites */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono block">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag (e.g. adblock, offline)..."
                      className="flex-1 bg-black/20 border border-white/5 rounded-xl px-3 text-white focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 text-accent hover:bg-white/10"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px] font-mono">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(idx)} className="text-danger hover:text-white">x</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Custom Developer Website Link</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://mydeveloper.com"
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-2.5 text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Privacy Policy URL</label>
                    <input
                      type="url"
                      value={privacyPolicy}
                      onChange={(e) => setPrivacyPolicy(e.target.value)}
                      placeholder="https://mydeveloper.com/privacy"
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-2.5 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles Panel */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 p-3 bg-black/10 rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    id="feat-toggle"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <label htmlFor="feat-toggle" className="text-[11px] font-bold text-gray-300 cursor-pointer">Featured App</label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/10 rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    id="pop-toggle"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <label htmlFor="pop-toggle" className="text-[11px] font-bold text-gray-300 cursor-pointer">Popular App</label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/10 rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    id="vis-toggle"
                    checked={visibility}
                    onChange={(e) => setVisibility(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <label htmlFor="vis-toggle" className="text-[11px] font-bold text-gray-300 cursor-pointer">Live Visibility</label>
                </div>
              </div>

              {/* Footer Save / Cancel button */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("manage");
                  }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all border border-white/5"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  {editingAppId ? "Update App Configuration" : "Build & Publish Package"}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* TAB 3: PACKAGE MANAGER (MANAGE APPS) */}
        {activeTab === "manage" && (
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 shadow-xl space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Active Store Packages</h3>

            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/5 text-gray-400 uppercase tracking-widest text-[9px] font-mono">
                  <tr>
                    <th className="p-3">App Details</th>
                    <th className="p-3">Pkg Identifier</th>
                    <th className="p-3">Ver (Code)</th>
                    <th className="p-3">Installs</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Labels</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {apps.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5">
                          <img src={app.icon} alt={app.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{app.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{app.category}</p>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[10px] text-gray-400">{app.packageName}</td>
                      <td className="p-3 font-mono">
                        {app.version} <span className="text-gray-500">({app.versionCode})</span>
                      </td>
                      <td className="p-3 font-mono">{app.downloads.toLocaleString()}</td>
                      <td className="p-3 font-semibold text-amber-400 font-mono flex items-center gap-0.5 mt-2.5">
                        <Star size={11} fill="currentColor" /> {app.rating.toFixed(1)}
                      </td>
                      <td className="p-3 space-y-1">
                        <div className="flex gap-1 flex-wrap">
                          {app.featured && (
                            <span className="px-1.5 py-0.5 bg-primary/20 text-accent font-mono text-[8px] rounded border border-primary/25 font-bold uppercase">
                              Feat
                            </span>
                          )}
                          {app.popular && (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 font-mono text-[8px] rounded border border-purple-500/25 font-bold uppercase">
                              Pop
                            </span>
                          )}
                          {!app.visibility && (
                            <span className="px-1.5 py-0.5 bg-danger/20 text-danger font-mono text-[8px] rounded border border-danger/25 font-bold uppercase">
                              Hidden
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleToggleVisibility(app.id)}
                            className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
                            title={app.visibility ? "Hide app from store" : "Reveal app on store"}
                          >
                            {app.visibility ? <Eye size={14} /> : <EyeOff size={14} className="text-danger" />}
                          </button>
                          
                          <button
                            onClick={() => {
                              setQuickUpdateApp(app);
                              setQuickVersion(app.version);
                              setQuickWhatsNew(app.whatsNew);
                            }}
                            className="p-2 hover:bg-white/5 text-gray-400 hover:text-accent rounded-lg transition-colors"
                            title="Quick release new build"
                          >
                            <RefreshCw size={14} />
                          </button>

                          <button
                            onClick={() => handleEditApp(app)}
                            className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
                            title="Edit App Details"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDuplicateApp(app)}
                            className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
                            title="Duplicate App"
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="p-2 hover:bg-white/5 text-danger hover:bg-danger/15 rounded-lg transition-colors"
                            title="Purge App"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS MODERATION */}
        {activeTab === "reviews" && (
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 shadow-xl space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Feedback Moderator Logs</h3>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-mono">
                  No comments logged inside database yet.
                </div>
              ) : (
                reviews.map((rev) => {
                  const targetApp = apps.find(a => a.id === rev.appId);
                  return (
                    <div
                      key={rev.id}
                      className="p-5 bg-black/10 hover:bg-black/20 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between gap-4 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{rev.userName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            on {targetApp ? targetApp.name : rev.appId}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-700"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed">{rev.comment}</p>
                        <span className="text-[10px] text-gray-500 font-mono block">
                          Logged: {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleToggleReviewPin(rev.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            rev.pinned 
                              ? "bg-secondary text-white" 
                              : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400"
                          }`}
                        >
                          {rev.pinned ? "Pinned" : "Pin Review"}
                        </button>

                        <button
                          onClick={() => handleToggleReviewApprove(rev.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            rev.approved 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                              : "bg-danger/10 text-danger border border-danger/20"
                          }`}
                        >
                          {rev.approved ? "Approved" : "Hidden"}
                        </button>

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-2 bg-white/5 hover:bg-danger/15 text-gray-400 hover:text-danger rounded-lg transition-colors"
                          title="Purge review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 5: WEBSITE SETTINGS */}
        {activeTab === "settings" && (
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 shadow-xl space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Website Configuration</h3>
              <p className="text-xs text-gray-400 mt-1">Configure global store branding, assets, and lookups stored persistently in Firebase Firestore.</p>
            </div>

            <div className="space-y-6 text-xs">
              {/* Store Logo configuration */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-extrabold text-gray-400 font-mono tracking-wider">Store Logo URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={logoInput}
                    onChange={(e) => setLogoInput(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/5 rounded-xl p-3 text-white focus:outline-none font-sans"
                  />
                  <button
                    onClick={async () => {
                      if (!logoInput.trim()) {
                        showToast("Please enter a valid image URL.");
                        return;
                      }
                      try {
                        const settingsRef = doc(firestoreDb, "settings", "website");
                        await setDoc(settingsRef, { logoUrl: logoInput.trim() }, { merge: true });
                        if (onUpdateLogoUrl) {
                          onUpdateLogoUrl(logoInput.trim());
                        }
                        showToast("Store branding logo updated successfully in Firestore!");
                      } catch (err) {
                        console.error("Failed to update logo in Firestore:", err);
                        showToast("Error updating logo settings.");
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Save Logo
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 font-mono leading-relaxed mt-1">
                  Provides a direct image link (SVG, PNG, WEBP) to render dynamically as the brand identity across the entire market layout.
                </p>
              </div>

              {/* Store Favicon configuration */}
              <div className="space-y-1.5 pt-4 border-t border-white/5">
                <label className="text-[10px] uppercase font-extrabold text-gray-400 font-mono tracking-wider">Store Favicon URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/favicon.ico"
                    value={faviconInput}
                    onChange={(e) => setFaviconInput(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/5 rounded-xl p-3 text-white focus:outline-none font-sans"
                  />
                  <button
                    onClick={async () => {
                      if (!faviconInput.trim()) {
                        showToast("Please enter a valid favicon URL.");
                        return;
                      }
                      try {
                        const settingsRef = doc(firestoreDb, "settings", "website");
                        await setDoc(settingsRef, { faviconUrl: faviconInput.trim() }, { merge: true });
                        if (onUpdateFaviconUrl) {
                          onUpdateFaviconUrl(faviconInput.trim());
                        }
                        showToast("Favicon icon updated successfully in Firestore!");
                      } catch (err) {
                        console.error("Failed to update favicon in Firestore:", err);
                        showToast("Error updating favicon settings.");
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Save Favicon
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 font-mono leading-relaxed mt-1">
                  Allows changing the favicon icon of the active website tab dynamically via an admin-supplied URL.
                </p>
              </div>

              {/* Logo Preview box */}
              {logoInput && (
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center gap-4 mt-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-1 border border-white/10 shrink-0 overflow-hidden">
                    <img 
                      src={logoInput} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&q=80";
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Dynamic Brand Preview</h4>
                    <p className="text-[10px] text-gray-400">This is how your custom admin-uploaded logo icon will display in the navigation bar.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* QUICK VERSION UPDATE MODAL POPUP */}
      <AnimatePresence>
        {quickUpdateApp && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setQuickUpdateApp(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-md glassmorphism p-6 rounded-3xl border border-white/5 shadow-2xl z-50 space-y-4"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                <RefreshCw size={14} className="text-accent animate-spin" />
                <span>Quick Update Version: {quickUpdateApp.name}</span>
              </h3>
              
              <form onSubmit={handleQuickVersionSave} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">New Build Version</label>
                  <input
                    type="text"
                    required
                    value={quickVersion}
                    onChange={(e) => setQuickVersion(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">What's New in this Build</label>
                  <textarea
                    required
                    rows={4}
                    value={quickWhatsNew}
                    onChange={(e) => setQuickWhatsNew(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white focus:outline-none resize-none font-sans leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickUpdateApp(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    Publish Release
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
