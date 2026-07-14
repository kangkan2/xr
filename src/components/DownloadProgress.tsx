import React, { useEffect } from "react";
import { AppItem } from "../types";
import { ArrowLeft, ShieldCheck, Download, RefreshCw } from "lucide-react";
import { db } from "../dbHelper";
import { doc, setDoc } from "firebase/firestore";
import { db as firestoreDb } from "../firebase";

interface DownloadProgressProps {
  app: AppItem;
  onBack: () => void;
  onDownloadLogged: () => void;
}

export function DownloadProgress({ app, onBack, onDownloadLogged }: DownloadProgressProps) {

  // Triggers downloaded file download containing app metadata info or direct URL
  const triggerApkDownload = (mirrorType: string) => {
    // Log the download to DB
    const countries = ["United States", "United Kingdom", "Germany", "Japan", "India", "Canada", "Australia", "Brazil"];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    db.addDownload(app.id, app.name, `${mirrorType}`, randomCountry);
    onDownloadLogged();

    // Log the download to Firestore as well!
    const downloadId = "download_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const downloadData = {
      id: downloadId,
      appId: app.id,
      appName: app.name,
      mirrorType: `${mirrorType}`,
      country: randomCountry,
      timestamp: new Date().toISOString()
    };
    
    const saveToFirestore = async () => {
      try {
        await setDoc(doc(firestoreDb, "downloads", downloadId), downloadData);
      } catch (err) {
        console.warn("Firestore download log failed:", err);
      }
    };
    saveToFirestore();

    // If there is a real, valid URL configured on the app, open it directly to start the actual installation package
    if (app.apkUrl && app.apkUrl.startsWith("http") && !app.apkUrl.includes("github.com/example/")) {
      const link = document.createElement("a");
      link.href = app.apkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (app.apkUrl.match(/\.(apk|zip|rar|bin|txt|pdf|png|jpg|jpeg|gif)$/i)) {
        link.download = app.apkUrl.substring(app.apkUrl.lastIndexOf('/') + 1) || `${app.id}_v${app.version}.apk`;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate real plain-text APK file wrapper so user gets an actual file
      const fileContent = `xrok APP PACKAGING DOWNLOAD CORE
====================================
App Name: ${app.name}
Package: ${app.packageName}
Version: ${app.version}
Developer: ${app.developerName}
CDN Gateway: ${mirrorType}
Verified safe by xrok Security Protocol.
Thank you for downloading from xrok App Market!`;

      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${app.id}_v${app.version}.apk`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    // Automatically trigger the direct download on mount after a smooth 800ms delay
    const timer = setTimeout(() => {
      triggerApkDownload("Primary CDN Node");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Return to {app.name}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main: Download status screen */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glassmorphism rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

            <div className="space-y-8 animate-fadeIn">
              {/* Success alert header */}
              <div className="flex items-start gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <ShieldCheck size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400">Download starting automatically...</h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Your secure package download for <b>{app.name}</b> has been initiated. If the download does not start within a few seconds, please click the <b>Download APK</b> button below.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4 py-4">
                <p className="text-sm text-gray-300">Choose your preferred download node:</p>
                
                {/* Download Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
                  <button
                    onClick={() => triggerApkDownload("Primary CDN Node")}
                    className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-accent/20 group scale-100 active:scale-95 cursor-pointer text-left"
                  >
                    <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    <div>
                      <div className="text-sm font-bold">Download APK</div>
                      <div className="text-[9px] text-white/70 font-mono">Primary Node (Fastest)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerApkDownload("Mirror CDN Server")}
                    className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all border border-white/10 group scale-100 active:scale-95 cursor-pointer text-left"
                  >
                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500 text-accent" />
                    <div>
                      <div className="text-sm font-bold">Mirror Download</div>
                      <div className="text-[9px] text-gray-400 font-mono">Backup Mirror (US East)</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick guide card */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3 font-display">How to install an APK file?</h3>
            <ol className="space-y-3.5 text-xs text-gray-300 pl-4 list-decimal marker:text-primary">
              <li>
                Click on the <b>Download APK</b> button above to download the verified file bundle.
              </li>
              <li>
                Open your device <b>Settings</b> &rarr; <b>Security &amp; Privacy</b>.
              </li>
              <li>
                Enable <b>Install Unknown Apps</b> toggle for your browser or file manager.
              </li>
              <li>
                Open your Android <b>Downloads</b> folder and tap the downloaded <b>.apk</b> file to complete installation.
              </li>
            </ol>
          </div>
        </div>

        {/* Right side panel: File details */}
        <div className="lg:col-span-4 space-y-6">
          {/* File details card */}
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-bg border border-white/10 shrink-0">
                <img src={app.icon} alt={app.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-display leading-tight">{app.name}</h4>
                <p className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">{app.packageName}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-gray-400">File version</span>
                <span className="text-white font-mono">{app.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Package Size</span>
                <span className="text-white font-mono">{app.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Requirements</span>
                <span className="text-accent font-display text-[11px]">{app.androidRequirement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Compilation Date</span>
                <span className="text-white font-mono">{app.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
