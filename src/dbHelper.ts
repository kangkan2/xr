import { AppItem, Review, DownloadEvent } from "./types";
import { INITIAL_APPS, INITIAL_REVIEWS, INITIAL_DOWNLOADS } from "./initialData";

// Keys
const KEY_APPS = "xrok_apps";
const KEY_REVIEWS = "xrok_reviews";
const KEY_DOWNLOADS = "xrok_downloads";
const KEY_FAVORITES = "xrok_favorites";
const KEY_USERS = "xrok_users";

export interface UserAccount {
  email: string;
  password?: string;
  isAdmin: boolean;
}

export const db = {
  getUsers(): UserAccount[] {
    const data = localStorage.getItem(KEY_USERS);
    if (!data) {
      const defaultUsers: UserAccount[] = [
        { email: "indiafff568@gmail.com", password: "password123", isAdmin: true }
      ];
      localStorage.setItem(KEY_USERS, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(data);
  },

  saveUsers(users: UserAccount[]) {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  },

  registerUser(email: string, password?: string): UserAccount {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("This email is already registered.");
    }
    const isAdmin = cleanEmail === "indiafff568@gmail.com";
    const newUser: UserAccount = {
      email: cleanEmail,
      password,
      isAdmin
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  loginUser(email: string, password?: string): UserAccount {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    
    // Always guarantee that indiafff568@gmail.com exists in DB
    if (cleanEmail === "indiafff568@gmail.com" && !users.some(u => u.email.toLowerCase() === cleanEmail)) {
      const adminUser: UserAccount = {
        email: cleanEmail,
        password: password || "password123",
        isAdmin: true
      };
      users.push(adminUser);
      this.saveUsers(users);
    }

    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      throw new Error("User account not found. Please sign up first.");
    }
    if (password && found.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }
    return found;
  },

  getApps(): AppItem[] {
    const data = localStorage.getItem(KEY_APPS);
    if (!data) {
      localStorage.setItem(KEY_APPS, JSON.stringify(INITIAL_APPS));
      return INITIAL_APPS;
    }
    return JSON.parse(data);
  },

  saveApps(apps: AppItem[]) {
    localStorage.setItem(KEY_APPS, JSON.stringify(apps));
  },

  getReviews(): Review[] {
    const data = localStorage.getItem(KEY_REVIEWS);
    if (!data) {
      localStorage.setItem(KEY_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(data);
  },

  saveReviews(reviews: Review[]) {
    localStorage.setItem(KEY_REVIEWS, JSON.stringify(reviews));
  },

  getDownloads(): DownloadEvent[] {
    const data = localStorage.getItem(KEY_DOWNLOADS);
    if (!data) {
      localStorage.setItem(KEY_DOWNLOADS, JSON.stringify(INITIAL_DOWNLOADS));
      return INITIAL_DOWNLOADS;
    }
    return JSON.parse(data);
  },

  addDownload(appId: string, appName: string, platform: string, country: string) {
    const downloads = this.getDownloads();
    const newDownload: DownloadEvent = {
      id: "download_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      appId,
      appName,
      timestamp: new Date().toISOString(),
      platform,
      country
    };
    downloads.unshift(newDownload);
    localStorage.setItem(KEY_DOWNLOADS, JSON.stringify(downloads));

    // Also update the total download count for the app itself!
    const apps = this.getApps();
    const updatedApps = apps.map(app => {
      if (app.id === appId) {
        return { ...app, downloads: (app.downloads || 0) + 1 };
      }
      return app;
    });
    this.saveApps(updatedApps);
  },

  getFavorites(): string[] {
    const data = localStorage.getItem(KEY_FAVORITES);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  },

  toggleFavorite(appId: string): string[] {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(appId);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(appId);
    }
    localStorage.setItem(KEY_FAVORITES, JSON.stringify(favorites));
    return favorites;
  },

  isFavorite(appId: string): boolean {
    return this.getFavorites().includes(appId);
  },

  resetDatabase() {
    localStorage.setItem(KEY_APPS, JSON.stringify(INITIAL_APPS));
    localStorage.setItem(KEY_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    localStorage.setItem(KEY_DOWNLOADS, JSON.stringify(INITIAL_DOWNLOADS));
    localStorage.setItem(KEY_FAVORITES, JSON.stringify([]));
  }
};
