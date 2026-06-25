import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- User Profile State ---
      userName: '',
      userAvatar: 'pattern1',
      setUserName: (name) => set({ userName: name }),
      setUserAvatar: (avatar) => set({ userAvatar: avatar }),

      // --- Bookmarks State ---
      bookmarks: [],
      addBookmark: (bookmark) => set((state) => ({
        bookmarks: [
            { id: Date.now().toString(), timestamp: Date.now(), ...bookmark }, 
            ...state.bookmarks
        ]
      })),
      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter(b => b.id !== id)
      })),
      clearBookmarks: () => set(() => ({
        bookmarks: []
      })),

      // --- Read History Tracking ---
      // Array of items: { id (bookId/surahId), type: 'quran' | 'book', title, subtitle, timestamp, progress (string/number) }
      readHistory: [],
      updateReadHistory: (item) => set((state) => {
          // Remove if it already exists to move it to the top
          const filteredHistory = state.readHistory.filter(h => h.id !== item.id);
          return {
              readHistory: [
                  { ...item, timestamp: Date.now() },
                  ...filteredHistory
              ].slice(0, 50) // keep last 50 items
          };
      }),
      clearHistory: () => set(() => ({
          readHistory: []
      })),

      // --- Quran Settings ---
      quranSettings: {
          arabicFontSize: 32, // pixels
          translationFontSize: 16, // pixels
          translationLanguage: 'ur.jalandhry', // Default Urdu
          showTranslation: true
      },
      updateQuranSettings: (newSettings) => set((state) => ({
          quranSettings: { ...state.quranSettings, ...newSettings }
      })),

      // --- Prayer Settings ---
      prayerSettings: {
          calculationMethod: 'Karachi', // 'Karachi', 'ISNA', 'MWL', etc.
          madhab: 'Hanafi' // 'Hanafi' or 'Shafi'
      },
      updatePrayerSettings: (newSettings) => set((state) => ({
          prayerSettings: { ...state.prayerSettings, ...newSettings }
      }))
    }),
    {
      name: 'noorbakhshia-app-storage', // unique name for localStorage key
      version: 2, // bump to force migration
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Migrate: switch default translation from English to Urdu
          if (persistedState.quranSettings?.translationLanguage === 'en.sahih') {
            persistedState.quranSettings.translationLanguage = 'ur.jalandhry';
          }
        }
        return persistedState;
      }
    }
  )
);
