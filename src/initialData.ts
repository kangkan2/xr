import { AppItem, Review, DownloadEvent } from "./types";

export const INITIAL_APPS: AppItem[] = [
  {
    id: "aura-ambient",
    name: "Aura Ambient Soundscape",
    packageName: "com.xrok.aura.ambient",
    developerName: "xrok Labs",
    category: "Productivity",
    version: "1.4.2",
    versionCode: 15,
    size: "18.4 MB",
    updatedAt: "2026-07-10",
    releasedAt: "2025-01-15",
    androidRequirement: "Android 8.0 or higher",
    shortDescription: "Customizable high-fidelity white noise, nature sounds, and binaural beats for ultimate focus and deep sleep.",
    description: "Transform your environment with Aura, the ultimate ambient soundscape generator designed to boost concentration, induce calm, and improve sleep. Mix and match dozens of hand-crafted nature sounds, weather effects, workspace hubbubs, and low-frequency brainwave modulators to craft your perfect acoustic refuge. Ideal for remote workers, students, insomniacs, and practitioners of mindfulness.",
    features: [
      "Dynamic sound mixer: combine up to 8 sounds concurrently with independent volume levels",
      "Binaural beats & Solfeggio frequencies to stimulate focus, creativity, or REM cycles",
      "Elegant sleep timer with smooth sound fade-out",
      "Pre-configured profiles: Forest Rain, Alpine Cabin, Coffee Shop Chill, Deep Space Voyager",
      "Full offline support with no persistent telemetry footprint"
    ],
    whatsNew: "Added 4 new high-fidelity sound tracks: Nordic Hearth, Cozy Greenhouse, Solar Winds, and Cat Purr. Improved battery efficiency during background playback by 15%. Fixed landscape mode UI clipping on folding screens.",
    permissions: [
      "Access Network State (for custom profile sync)",
      "Prevent Device from Sleeping (during active audio sessions)",
      "Run Foreground Service (for background audio controls)"
    ],
    icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80&fit=crop&auto=format",
    banner: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&q=80"
    ],
    downloads: 12450,
    rating: 4.8,
    featured: true,
    popular: true,
    trending: true,
    visibility: true,
    apkUrl: "https://github.com/example/aura-ambient/releases/download/v1.4.2/aura_ambient.apk",
    mirrorUrl: "https://drive.google.com/uc?export=download&id=aura_ambient_mirror",
    checksum: "8f9a2e316cd961f67f8e819bdf8c8a1e8a9f6d71b8770c01284a1e9df6469b82",
    tags: ["ambience", "focus", "sleep", "meditation", "white noise"],
    website: "https://xrok.com/apps/aura",
    privacyPolicy: "https://xrok.com/privacy/aura"
  },
  {
    id: "nova-browser",
    name: "Nova Privacy Browser",
    packageName: "com.xrok.nova.browser",
    developerName: "xrok Labs",
    category: "Utility",
    version: "4.1.0",
    versionCode: 41,
    size: "34.2 MB",
    updatedAt: "2026-07-08",
    releasedAt: "2024-05-10",
    androidRequirement: "Android 9.0 or higher",
    shortDescription: "Ultra-fast web browser built with advanced tracker blocking, custom cookie isolation, and native dark mode.",
    description: "Take back control of your digital footprint with Nova. Engineered for speed and uncompromising privacy, Nova blocks intrusive advertising, dynamic behavioral trackers, and cryptominers out of the box. Features standard client-side sandbox container tabs, secure HTTPS-Only upgrades, DNS-over-HTTPS options, and a highly customizable interface with rich rendering styles.",
    features: [
      "Shields Engine: Built-in ad blocker and fingerprint protect",
      "Private Tabs Sandbox: Isolated cookies that wipe clean on tab closure",
      "Built-in media downloader with background thread optimization",
      "Sleek reader layout with specialized typography controls",
      "Custom CSS themes and real-time page rendering injection"
    ],
    whatsNew: "Updated privacy engine to block next-gen CNAME cloaked tracking. Upgraded Chromium web rendering engine core. Added native translation module supporting 12 offline languages.",
    permissions: [
      "Camera (for QR-code scanning)",
      "Location (optional, sandboxed per page)",
      "Read/Write External Storage (for file downloads)"
    ],
    icon: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=150&q=80&fit=crop&auto=format",
    banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80"
    ],
    downloads: 48900,
    rating: 4.6,
    featured: false,
    popular: true,
    trending: true,
    visibility: true,
    apkUrl: "https://github.com/example/nova-browser/releases/download/v4.1.0/nova_browser.apk",
    mirrorUrl: "https://drive.google.com/uc?export=download&id=nova_browser_mirror",
    checksum: "a3f56b19d27b9c9f0b18e7e1f487e812b1d354deef3c200ab56e913a7b6cf79d",
    tags: ["privacy", "browser", "adblock", "fast", "web"],
    website: "https://xrok.com/apps/nova",
    privacyPolicy: "https://xrok.com/privacy/nova"
  },
  {
    id: "taskflow-kanban",
    name: "Taskflow Kanban & Planner",
    packageName: "com.xrok.taskflow",
    developerName: "GridWorks Apps",
    category: "Productivity",
    version: "2.8.5",
    versionCode: 28,
    size: "12.8 MB",
    updatedAt: "2026-07-12",
    releasedAt: "2024-11-20",
    androidRequirement: "Android 7.0 or higher",
    shortDescription: "Elegant local-first offline Kanban board for personal task tracking, schedules, and flowcharts.",
    description: "Taskflow is a visual board and task scheduler centered around clarity, simplicity, and lightning-fast entry. Designed for creators, software developers, and task-managers, it stores all data strictly locally on your Android device with seamless export/import triggers in standard JSON. No cloud login, no slow loads, no data harvesting.",
    features: [
      "Beautiful Kanban boards with draggable cards and multi-colored tags",
      "Pomodoro focus session tracker built into every individual task card",
      "Sleek calendar matrix view with dynamic time blocking grids",
      "Interactive data visualizations tracking task completions over time",
      "Quick-Add launcher widget for instant task creation"
    ],
    whatsNew: "Introduced recursive sub-tasks. Added global search functionality across all active and archived boards. Implemented dynamic home screen widgets with custom transparency filters.",
    permissions: [
      "Vibrate (for timer alarm notifications)",
      "Write External Storage (for backup file generation)"
    ],
    icon: "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=150&q=80&fit=crop&auto=format",
    banner: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=500&q=80",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80"
    ],
    downloads: 9210,
    rating: 4.9,
    featured: true,
    popular: false,
    trending: true,
    visibility: true,
    apkUrl: "https://github.com/example/taskflow/releases/download/v2.8.5/taskflow.apk",
    checksum: "d5c412ae8b10fcd91e84a22bdf16417fa8c3d64fe96180cdbdfa294fc6121ea2",
    tags: ["productivity", "kanban", "planner", "gtd", "offline"],
    website: "https://gridworks.example.com/taskflow",
    privacyPolicy: "https://gridworks.example.com/privacy/taskflow"
  },
  {
    id: "retropulse-arcade",
    name: "RetroPulse Synth Arcade",
    packageName: "com.xrok.retropulse",
    developerName: "xrok Labs",
    category: "Gaming",
    version: "1.0.8",
    versionCode: 8,
    size: "62.5 MB",
    updatedAt: "2026-06-30",
    releasedAt: "2026-04-12",
    androidRequirement: "Android 10.0 or higher",
    shortDescription: "An immersive neon retro-synth-wave endless runner featuring procedurally generated rhythm grids.",
    description: "Dash, slide, and pulse through a cyber-grid landscape synchronized to an intense, modular synthesizer soundtrack. Control your light-cycle to collect frequency tokens while avoiding high-frequency system firewalls. RetroPulse merges classic arcade muscle-memory with futuristic aesthetic elements, delivering an intense sensory loop.",
    features: [
      "High-frame-rate responsive mechanics supporting up to 120Hz displays",
      "Dynamic reactive environment: backgrounds warp and flash based on music audio features",
      "Over 18 custom tracks from pioneering synthwave and cyber-chill artists",
      "Custom garage: unlock and upgrade 10 futuristic light-cycles with unique active shield perks",
      "Global leaderboard logs for competitive speed-runners"
    ],
    whatsNew: "Launched 'Neon Midnight' expansion pack with 6 additional challenging tracks and 2 heavy light-cycles. Optimized Vulkan renderer to lower device temperatures during intense gaming.",
    permissions: [
      "Access Network (for global high score syncing)",
      "Vibrate (for custom tactile pulse impacts)"
    ],
    icon: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&q=80&fit=crop&auto=format",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80",
      "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=500&q=80",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&q=80"
    ],
    downloads: 34100,
    rating: 4.7,
    featured: true,
    popular: true,
    trending: false,
    visibility: true,
    apkUrl: "https://github.com/example/retropulse/releases/download/v1.0.8/retropulse.apk",
    checksum: "fa10c309bc8722b918eeffcdd5a11c81a2f6412f9bda0540d6e5a6efc023d8df",
    tags: ["arcade", "synthwave", "rhythm", "runner", "action"],
    website: "https://xrok.com/apps/retropulse",
    privacyPolicy: "https://xrok.com/privacy/retropulse"
  },
  {
    id: "zen-journal",
    name: "Zen Journal: Mindful Micro-logs",
    packageName: "com.xrok.zenjournal",
    developerName: "Zenith Mind",
    category: "Entertainment",
    version: "3.2.1",
    versionCode: 32,
    size: "9.6 MB",
    updatedAt: "2026-07-01",
    releasedAt: "2023-08-01",
    androidRequirement: "Android 8.0 or higher",
    shortDescription: "A serene, minimalist micro-journaling app that prompts you daily with insightful wellness check-ins.",
    description: "Quiet the mental noise with Zen Journal. Built on proven cognitive behavioral therapy and mindfulness protocols, Zen Journal strips away the distraction of social streams and verbose note-taking apps. It invites you to log your daily emotions, activities, and reflections through simple, elegant tap counters, brief micro-sentences, and secure photo-logs.",
    features: [
      "Clean, high-contrast typography centered on deep mental tranquility",
      "Structured micro-prompts supporting gratitude tracking and sleep ratings",
      "Local-first military-grade secure password/biometric locks",
      "Atmospheric mood-trend graphs outlining emotional wellness cycles",
      "Seamless daily reminder scheduling with custom sound cues"
    ],
    whatsNew: "Added beautiful dark wood color theme variations. Implemented secure PDF and markdown file archives exporting with localized photo attachments. Fixed minor calendar streak count anomalies.",
    permissions: [
      "Use Biometric Credentials (for secure entry locks)",
      "Access Camera (for journal-specific image attachments)"
    ],
    icon: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=150&q=80&fit=crop&auto=format",
    banner: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&q=80"
    ],
    downloads: 16800,
    rating: 4.8,
    featured: false,
    popular: true,
    trending: false,
    visibility: true,
    apkUrl: "https://github.com/example/zenjournal/releases/download/v3.2.1/zenjournal.apk",
    checksum: "9d8e7c16ba5f6d71c8901235678a9be12f94ca23efcd316a70eefbc382901dc4",
    tags: ["journal", "mindfulness", "health", "diary", "mood tracker"],
    website: "https://zenjournal.example.org",
    privacyPolicy: "https://zenjournal.example.org/privacy"
  },
  {
    id: "apex-crypto",
    name: "Apex Non-Custodial Wallet",
    packageName: "com.xrok.apexwallet",
    developerName: "Apex Chain Labs",
    category: "Finance",
    version: "2.0.1",
    versionCode: 20,
    size: "22.1 MB",
    updatedAt: "2026-07-05",
    releasedAt: "2025-06-18",
    androidRequirement: "Android 10.0 or higher",
    shortDescription: "Ultra-secure non-custodial crypto wallet supporting major layer-1 chains and real-time gas fees.",
    description: "Apex gives you raw, self-sovereign control over your digital assets. Keep absolute custody of your private seeds and keys, stored exclusively inside your device's Android Secure Enclave. Enjoy frictionless swaps across Ethereum, Solana, and key EVM layer-2 rollups with minimal fees and real-time transaction tracking.",
    features: [
      "Hardware-isolated security with local biometric signature prompts",
      "Integrated cross-chain token swaps with automatic routing optimization",
      "Custom gas fee controller supporting advanced priority adjustments",
      "DeFi dashboard highlighting token gains, yields, and detailed history logs",
      "In-app WalletConnect core facilitating direct secure web3 linkups"
    ],
    whatsNew: "Launched fully integrated support for Arbitrum, Optimism, and Base networks. Enhanced price-feed graph resolutions with real-time candlestick views. Optimized private seed encryption layers.",
    permissions: [
      "Internet Connection (to request real-time network prices)",
      "Camera Access (to capture QR code addresses)"
    ],
    icon: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=150&q=80&fit=crop&auto=format",
    banner: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&q=80",
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&q=80",
      "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=500&q=80"
    ],
    downloads: 7850,
    rating: 4.5,
    featured: false,
    popular: false,
    trending: true,
    visibility: true,
    apkUrl: "https://github.com/example/apexwallet/releases/download/v2.0.1/apexwallet.apk",
    checksum: "3e5a7b6cf718e213bdf2d56a70e1bf4520ef8d91a27e360fba45c1284a1efd5c",
    tags: ["finance", "crypto", "bitcoin", "ethereum", "wallet"],
    website: "https://apexwallet.example.com",
    privacyPolicy: "https://apexwallet.example.com/privacy"
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    appId: "aura-ambient",
    userName: "Alex Rivera",
    rating: 5,
    comment: "This app is an absolute masterpiece! The sound mixer is extremely smooth, and it works flawlessly offline. Highly recommended for reading sessions.",
    createdAt: "2026-07-12T14:32:00Z",
    approved: true,
    pinned: true
  },
  {
    id: "r2",
    appId: "aura-ambient",
    userName: "Nadav Stern",
    rating: 4,
    comment: "Excellent sound quality. The Nord Hearth ambient is super cozy. Only minor issue is I wish I could assign icons to custom mixers, but overall fantastic.",
    createdAt: "2026-07-11T09:15:00Z",
    approved: true,
    pinned: false
  },
  {
    id: "r3",
    appId: "nova-browser",
    userName: "Elena Rostova",
    rating: 5,
    comment: "Genuinely blocks 99% of annoying advertisements and tracker payloads. The isolated sandbox tab feature is perfect for checking quick bank notes.",
    createdAt: "2026-07-09T18:40:00Z",
    approved: true,
    pinned: true
  },
  {
    id: "r4",
    appId: "taskflow-kanban",
    userName: "Liam Tanaka",
    rating: 5,
    comment: "The absolute gold standard of offline productivity. No subscription, no login screens, just clean, robust, simple Kanban boards. Pomodoro integration is a lifesaver.",
    createdAt: "2026-07-13T10:05:00Z",
    approved: true,
    pinned: true
  },
  {
    id: "r5",
    appId: "retropulse-arcade",
    userName: "Sarah Connor",
    rating: 4,
    comment: "Adrenaline rushing! The procedural sync with the synthwave beat makes it insanely fun. It gets extremely hard around level 10 though!",
    createdAt: "2026-07-02T22:30:00Z",
    approved: true,
    pinned: false
  }
];

export const INITIAL_DOWNLOADS: DownloadEvent[] = [
  { id: "d1", appId: "aura-ambient", appName: "Aura Ambient Soundscape", timestamp: "2026-07-14T06:45:00Z", platform: "Android APK", country: "United States" },
  { id: "d2", appId: "nova-browser", appName: "Nova Privacy Browser", timestamp: "2026-07-14T06:12:00Z", platform: "Android APK", country: "Germany" },
  { id: "d3", appId: "retropulse-arcade", appName: "RetroPulse Synth Arcade", timestamp: "2026-07-14T05:50:00Z", platform: "Android APK", country: "Japan" },
  { id: "d4", appId: "taskflow-kanban", appName: "Taskflow Kanban & Planner", timestamp: "2026-07-14T05:15:00Z", platform: "Android APK", country: "United Kingdom" },
  { id: "d5", appId: "zen-journal", appName: "Zen Journal: Mindful Micro-logs", timestamp: "2026-07-14T04:20:00Z", platform: "Android APK", country: "Canada" },
  { id: "d6", appId: "aura-ambient", appName: "Aura Ambient Soundscape", timestamp: "2026-07-13T23:45:00Z", platform: "Android APK", country: "Australia" },
  { id: "d7", appId: "nova-browser", appName: "Nova Privacy Browser", timestamp: "2026-07-13T21:30:00Z", platform: "Android APK", country: "France" },
  { id: "d8", appId: "apex-crypto", appName: "Apex Non-Custodial Wallet", timestamp: "2026-07-13T19:20:00Z", platform: "Android APK", country: "India" },
  { id: "d9", appId: "aura-ambient", appName: "Aura Ambient Soundscape", timestamp: "2026-07-13T15:40:00Z", platform: "Android APK", country: "Brazil" },
  { id: "d10", appId: "retropulse-arcade", appName: "RetroPulse Synth Arcade", timestamp: "2026-07-13T12:10:00Z", platform: "Android APK", country: "South Korea" }
];
