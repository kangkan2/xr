import React, { useState, useEffect } from "react";
import { AppItem, Review } from "../types";
import { ArrowLeft, Star, Download, Share2, Copy, Check, MessageSquare, ShieldCheck, ChevronLeft, ChevronRight, QrCode, Bookmark, ChevronDown, ListPlus, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../dbHelper";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { auth, db as firestoreDb, OperationType, handleFirestoreError } from "../firebase";

interface AppDetailsProps {
  app: AppItem;
  allApps: AppItem[];
  onBack: () => void;
  onDownloadClick: () => void;
  onNavigateToApp: (appId: string) => void;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}

export function AppDetails({
  app,
  allApps,
  onBack,
  onDownloadClick,
  onNavigateToApp,
  isBookmarked,
  onBookmarkToggle
}: AppDetailsProps) {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showQr, setShowQr] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    // Load reviews for this app from Firestore (if possible) or fallback to local db helper
    const loadReviews = async () => {
      try {
        const reviewsRef = collection(firestoreDb, "apps", app.id, "reviews");
        const querySnapshot = await getDocs(reviewsRef);
        const fbReviews: Review[] = [];
        querySnapshot.forEach((doc) => {
          fbReviews.push(doc.data() as Review);
        });
        if (fbReviews.length > 0) {
          // Sort by date descending
          fbReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setReviews(fbReviews);
        } else {
          // fallback to local data
          const appReviews = db.getReviews().filter(r => r.appId === app.id && r.approved);
          setReviews(appReviews);
        }
      } catch (err) {
        console.warn("Firestore reviews load failed, using local fallback:", err);
        const appReviews = db.getReviews().filter(r => r.appId === app.id && r.approved);
        setReviews(appReviews);
      }
    };
    loadReviews();
  }, [app.id]);

  useEffect(() => {
    if (auth.currentUser && reviews.length > 0) {
      const existing = reviews.find(r => r.userEmail === auth.currentUser?.email);
      if (existing) {
        setNewReviewComment(existing.comment);
        setNewReviewRating(existing.rating);
        setNewReviewName(existing.userName);
      }
    }
  }, [auth.currentUser, reviews]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/#app/${app.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: app.name,
        text: app.shortDescription,
        url: window.location.href,
      }).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }).catch(err => console.log(err));
    } else {
      handleCopyLink();
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment) return;

    const reviewerName = auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || newReviewName || "Anonymous";
    const reviewerEmail = auth.currentUser?.email || "anonymous@example.com";

    const existing = auth.currentUser ? reviews.find(r => r.userEmail === auth.currentUser?.email) : null;

    if (existing) {
      // 1. Update existing review in-place
      const updatedReview: Review = {
        ...existing,
        userName: reviewerName,
        rating: newReviewRating,
        comment: newReviewComment,
        createdAt: new Date().toISOString()
      };

      // Save locally
      const allReviews = db.getReviews();
      const updatedReviews = allReviews.map(r => r.id === existing.id ? updatedReview : r);
      db.saveReviews(updatedReviews);

      // Save to Firestore
      if (auth.currentUser) {
        try {
          const reviewRef = doc(firestoreDb, "apps", app.id, "reviews", existing.id);
          await setDoc(reviewRef, updatedReview);
        } catch (err) {
          console.error("Failed to sync updated review to Firestore:", err);
          handleFirestoreError(err, OperationType.WRITE, `apps/${app.id}/reviews/${existing.id}`);
        }
      }

      // Refresh state
      setReviews(prev => prev.map(r => r.id === existing.id ? updatedReview : r));

      // Recalculate average rating of the app
      const appSpecificReviews = reviews.map(r => r.id === existing.id ? updatedReview : r);
      const avgRating = appSpecificReviews.reduce((sum, r) => sum + r.rating, 0) / appSpecificReviews.length;
      
      const allAppsList = db.getApps();
      const updatedApps = allAppsList.map(a => {
        if (a.id === app.id) {
          return { ...a, rating: Number(avgRating.toFixed(1)) };
        }
        return a;
      });
      db.saveApps(updatedApps);

      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      return;
    }

    // 2. Submit brand-new review
    const reviewId = "review_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const newReview: Review = {
      id: reviewId,
      appId: app.id,
      userName: reviewerName,
      userEmail: reviewerEmail,
      rating: newReviewRating,
      comment: newReviewComment,
      createdAt: new Date().toISOString(),
      approved: true, // Auto-approve
      pinned: false
    };

    // Save locally
    const allReviews = db.getReviews();
    const updatedReviews = [newReview, ...allReviews];
    db.saveReviews(updatedReviews);

    // Save to Firestore if user is authenticated
    if (auth.currentUser) {
      try {
        const reviewRef = doc(firestoreDb, "apps", app.id, "reviews", reviewId);
        await setDoc(reviewRef, newReview);
      } catch (err) {
        console.error("Failed to sync review to Firestore:", err);
        handleFirestoreError(err, OperationType.WRITE, `apps/${app.id}/reviews/${reviewId}`);
      }
    }

    // Refresh state
    setReviews(prev => [newReview, ...prev]);
    
    // Recalculate average rating of the app
    const appSpecificReviews = [newReview, ...reviews];
    const avgRating = appSpecificReviews.reduce((sum, r) => sum + r.rating, 0) / appSpecificReviews.length;
    
    const allAppsList = db.getApps();
    const updatedApps = allAppsList.map(a => {
      if (a.id === app.id) {
        return { ...a, rating: Number(avgRating.toFixed(1)) };
      }
      return a;
    });
    db.saveApps(updatedApps);

    // Reset input
    setNewReviewName("");
    setNewReviewComment("");
    setNewReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Find related apps in same category or just popular ones

  const relatedApps = allApps
    .filter(a => a.id !== app.id && a.visibility && (a.category === app.category || a.featured))
    .slice(0, 3);

  // Mock version history (derived or customized)
  const mockVersionHistory = [
    { version: app.version, date: app.updatedAt, notes: app.whatsNew },
    { version: `${app.version.split(".")[0]}.${Number(app.version.split(".")[1]) - 1}.0`, date: "2025-10-12", notes: "General layout improvements and performance boosts across main container threads." },
    { version: "1.0.0", date: app.releasedAt, notes: "Initial release launcher deployment on Android Store." }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Back to Home Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to App Explorer</span>
      </button>

      {/* Main Grid: Detail Header & Center Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column (8 cols): Large Cover details, Screenshots, Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Card (App Icon, Name, Dev, Download, Actions) */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row gap-6">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />

            {/* Icon */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-brand-bg relative shrink-0 mx-auto sm:mx-0">
              <img
                src={app.icon}
                alt={`${app.name} icon`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meta */}
            <div className="flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 text-[10px] tracking-wider uppercase font-extrabold bg-primary/20 text-accent border border-primary/20 rounded-full font-mono">
                    {app.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onBookmarkToggle}
                      className={`p-2 rounded-xl transition-all border ${
                        isBookmarked 
                          ? "bg-primary/20 border-primary text-primary" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400"
                      }`}
                      title={isBookmarked ? "Bookmarked" : "Add to favorites"}
                    >
                      <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                      title="Share application"
                    >
                      <Share2 size={15} />
                    </button>
                    <button
                      onClick={() => setShowQr(!showQr)}
                      className={`p-2 rounded-xl border transition-all ${
                        showQr 
                          ? "bg-accent/20 border-accent text-accent" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400"
                      }`}
                      title="Show installation QR Code"
                    >
                      <QrCode size={15} />
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display leading-tight">
                  {app.name}
                </h1>
                
                <p className="text-xs text-gray-400 font-mono">
                  Developer: <span className="text-gray-300 font-semibold">{app.developerName}</span>
                </p>
              </div>

              {/* Install and copy button panel */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <button
                  onClick={onDownloadClick}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-accent/20 group cursor-pointer"
                >
                  <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                  <span>Download Free APK</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold rounded-2xl transition-all"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-xs">Copied link!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className="text-xs">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Reveal Panel */}
          {showQr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glassmorphism rounded-3xl p-6 border border-accent/25 shadow-xl flex flex-col sm:flex-row items-center gap-6"
            >
              <div className="w-32 h-32 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                {/* Generate beautiful custom mock QR block */}
                <div className="w-full h-full border-4 border-dashed border-gray-900 flex flex-col items-center justify-center text-gray-900">
                  <QrCode size={48} className="text-gray-900" />
                  <span className="text-[8px] font-bold font-mono uppercase tracking-widest mt-1 text-center">xrok Scan</span>
                </div>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white font-display">Install directly on your smartphone</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Open your mobile camera lens and align with the QR Code. It will securely pull down the compiled <b>{app.name}</b> APK installation package over our fast cloud network.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-emerald-400 font-mono">
                  <ShieldCheck size={12} />
                  <span>Verified dynamic package link</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Screenshots slider */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 font-display">Screenshots</h3>
            <div className="relative rounded-3xl overflow-hidden glassmorphism p-3 border border-white/5">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/40 relative">
                <img
                  src={app.screenshots[activeScreenshot]}
                  alt={`${app.name} screenshot ${activeScreenshot + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                />
                
                {/* Overlay navigation arrows */}
                <button
                  onClick={() => setActiveScreenshot(prev => (prev === 0 ? app.screenshots.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveScreenshot(prev => (prev === app.screenshots.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Thumbnails list */}
              <div className="flex gap-2.5 mt-3 justify-center">
                {app.screenshots.map((screen, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScreenshot(idx)}
                    className={`w-16 h-10 rounded-lg overflow-hidden border transition-all ${
                      activeScreenshot === idx ? "border-accent scale-105" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={screen} alt="Thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description & Features Tab */}
          <div className="glassmorphism rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
            <div className="space-y-3">
              <h3 className="text-md font-bold text-white font-display">Product Overview</h3>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line text-justify">
                {app.description}
              </p>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h3 className="text-md font-bold text-white font-display">Key Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-gray-300">
                {app.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {app.whatsNew && (
              <div className="border-t border-white/5 pt-6 space-y-3">
                <h3 className="text-md font-bold text-white font-display">What's New in Version {app.version}</h3>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {app.whatsNew}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Reviews & Comments */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 font-display">User Reviews</h3>
              <span className="text-xs text-accent font-mono font-bold flex items-center gap-1">
                <MessageSquare size={13} /> {reviews.length} Approved Reviews
              </span>
            </div>

            {/* Write a comment form */}
            <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-4">
              {(() => {
                const userReview = auth.currentUser ? reviews.find(r => r.userEmail === auth.currentUser?.email) : null;
                return (
                  <>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {userReview ? "Edit Your Review" : "Leave a Review"}
                    </h4>
                    
                    {!auth.currentUser ? (
                      <div className="text-center py-6 space-y-3 bg-black/10 rounded-2xl border border-white/5">
                        <p className="text-xs text-gray-400">You must be signed in to post reviews on xrok.</p>
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent("open-auth-modal"));
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                        >
                          Sign In / Sign Up
                        </button>
                      </div>
                    ) : (
                      <>
                        {reviewSuccess && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-semibold">
                            {userReview 
                              ? "Review updated successfully!" 
                              : "Review submitted successfully! Your thoughts help us construct a safer app-space."}
                          </div>
                        )}

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Your Name</label>
                              <input
                                type="text"
                                required
                                value={newReviewName || auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || ""}
                                onChange={(e) => setNewReviewName(e.target.value)}
                                placeholder="Jane Doe"
                                className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Rating (1 to 5 Stars)</label>
                              <div className="flex items-center gap-1.5 pt-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReviewRating(star)}
                                    className="text-gray-500 hover:text-amber-400 transition-colors"
                                  >
                                    <Star
                                      size={20}
                                      className={star <= newReviewRating ? "text-amber-400 fill-amber-400" : "text-gray-600"}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-gray-400 font-mono font-sans">Your Experience / Feedback</label>
                            <textarea
                              required
                              rows={3}
                              value={newReviewComment}
                              onChange={(e) => setNewReviewComment(e.target.value)}
                              placeholder="This app makes focus sessions extremely simple. Beautiful interface..."
                              className="w-full bg-black/20 focus:bg-black/40 border border-white/5 focus:border-accent/30 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-primary/10 cursor-pointer"
                          >
                            <Send size={13} />
                            <span>{userReview ? "Update Review" : "Post Review"}</span>
                          </button>
                        </form>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* List reviews */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs font-mono bg-white/5 border border-white/5 rounded-3xl">
                  No community reviews approved yet. Be the first to leave one!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      rev.pinned 
                        ? "bg-secondary/10 border-secondary/35 shadow-lg shadow-secondary/5" 
                        : "glassmorphism border-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rev.userName}</span>
                          {rev.pinned && (
                            <span className="px-2 py-0.5 bg-secondary text-white text-[8px] font-mono font-extrabold rounded uppercase tracking-wider">
                              Pinned
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column (4 cols): Detailed metrics, install guides, related apps */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Detailed package metrics card */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Technical Info</h3>
            
            <div className="space-y-3.5 text-xs border-b border-white/5 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Package Name</span>
                <span className="text-white font-mono text-[10px] truncate max-w-[150px]" title={app.packageName}>
                  {app.packageName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Version</span>
                <span className="text-white font-mono">{app.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Version Code</span>
                <span className="text-white font-mono">{app.versionCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Package Size</span>
                <span className="text-white font-mono">{app.size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Release Date</span>
                <span className="text-white font-mono">{app.releasedAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-white font-mono">{app.updatedAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Android Target</span>
                <span className="text-accent font-semibold font-display text-[11px]">
                  {app.androidRequirement}
                </span>
              </div>
            </div>

            {/* Developer website & privacy link */}
            <div className="space-y-2.5 pt-1 text-xs">
              {app.website && (
                <a
                  href={app.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all border border-white/5"
                >
                  Visit Developer Website
                </a>
              )}
              {app.privacyPolicy && (
                <a
                  href={app.privacyPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy Policy
                </a>
              )}
            </div>
          </div>

          {/* Android permissions card */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Required Permissions</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              These low-level Android permissions must be granted to enable core app functions:
            </p>
            <ul className="space-y-2 pt-1 text-xs text-gray-300">
              {app.permissions.map((perm, idx) => (
                <li key={idx} className="flex gap-2 items-center bg-black/10 px-3 py-2 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="truncate">{perm}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed install guide card */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">Easy Installation Guide</h3>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <span>Download the certified <b>.apk</b> file above.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <span>Enable installation from unknown sources in browser settings.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <span>Launch the package installer on your phone.</span>
              </li>
            </ul>
          </div>

          {/* Related applications list */}
          {relatedApps.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 font-display">Related Applications</h3>
              <div className="space-y-3">
                {relatedApps.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onNavigateToApp(rel.id)}
                    className="flex gap-3.5 p-3.5 rounded-2xl glassmorphism border border-white/5 hover:border-accent/25 hover:shadow-lg hover:shadow-primary/5 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-bg shrink-0 border border-white/10">
                      <img src={rel.icon} alt={rel.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-accent transition-colors truncate font-display">
                        {rel.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono truncate mb-1">
                        {rel.packageName}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold font-mono">
                          <Star size={10} fill="currentColor" /> {rel.rating.toFixed(1)}
                        </span>
                        <span>{(rel.downloads >= 1000 ? `${(rel.downloads/1000).toFixed(1)}k` : rel.downloads)} dl</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
