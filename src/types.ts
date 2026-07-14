export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  developerName: string;
  category: string;
  version: string;
  versionCode: number;
  size: string;
  updatedAt: string;
  releasedAt: string;
  androidRequirement: string;
  shortDescription: string;
  description: string;
  features: string[];
  whatsNew: string;
  permissions: string[];
  icon: string;
  banner: string;
  screenshots: string[];
  downloads: number;
  rating: number;
  featured: boolean;
  popular: boolean;
  trending: boolean;
  visibility: boolean;
  apkUrl: string;
  mirrorUrl?: string;
  gdriveUrl?: string;
  githubUrl?: string;
  checksum: string;
  tags: string[];
  website?: string;
  privacyPolicy?: string;
}

export interface Review {
  id: string;
  appId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
  pinned: boolean;
}

export interface DownloadEvent {
  id: string;
  appId: string;
  appName: string;
  timestamp: string;
  platform: string;
  country: string;
}

export interface AnalyticsData {
  downloadsPerDay: { date: string; count: number }[];
  visitorCountries: { country: string; count: number }[];
  topApps: { name: string; count: number }[];
}
