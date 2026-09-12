/**
 * LudoVerse 3D — UI Store (Zustand)
 * Modal states, overlays, notifications
 */

import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Modals
  showPause: false,
  showVictory: false,
  showSettings: false,
  showAbout: false,
  showLoading: false,
  loadingProgress: 0,

  // Notifications
  notifications: [],

  // HUD
  showHUD: true,
  activeTokenHighlights: [], // token IDs to highlight

  // Victory
  winner: null,
  winnerRank: [],

  // Actions
  setPause: (v) => set({ showPause: v }),
  setVictory: (winner, rank) => set({ showVictory: true, winner, winnerRank: rank }),
  setSettings: (v) => set({ showSettings: v }),
  setLoading: (v, progress = 0) => set({ showLoading: v, loadingProgress: progress }),
  setLoadingProgress: (v) => set({ loadingProgress: v }),
  setHUD: (v) => set({ showHUD: v }),
  setHighlights: (ids) => set({ activeTokenHighlights: ids }),
  clearHighlights: () => set({ activeTokenHighlights: [] }),
  closeVictory: () => set({ showVictory: false, winner: null }),

  addNotification: (message, type = 'info', duration = 2500) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now(), message, type, duration },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
