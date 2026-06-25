import localforage from 'localforage';

const quranStore = localforage.createInstance({
  name: "Noorbakhshia365",
  storeName: "quran_data_offline"
});

// Cache keys
const ARABIC_KEY = 'full_arabic_quran';
const ENGLISH_KEY = 'full_english_quran';
const URDU_KEY = 'full_urdu_quran';
const META_KEY = 'quran_meta';

// In-memory cache for ultra-fast access without indexedDB overhead
let memoryCache = {
    meta: null,
    arabic: null,
    english: null,
    urdu: null
};

export const quranService = {
  /**
   * Helper to load a full JSON file, prioritizing memory -> localforage -> network
   */
  _loadData: async (type) => {
      // 1. Memory
      if (memoryCache[type]) return memoryCache[type];

      // 2. LocalForage
      let key = type === 'arabic' ? ARABIC_KEY : 
                type === 'english' ? ENGLISH_KEY : 
                type === 'urdu' ? URDU_KEY : META_KEY;
                
      let data = await quranStore.getItem(key);
      if (data) {
          memoryCache[type] = data;
          return data;
      }

      // 3. Network (Fetch from local public/api/quran directory)
      const url = `/api/quran/${type}.json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load ${type} data offline.`);
      
      const json = await response.json();
      
      data = json.data; // AlQuran cloud puts the payload inside 'data'
      
      await quranStore.setItem(key, data);
      memoryCache[type] = data;
      
      return data;
  },

  getSurahList: async () => {
      const meta = await quranService._loadData('meta');
      return meta.surahs.references;
  },

  getJuzList: async () => {
      const meta = await quranService._loadData('meta');
      const juzs = meta.juzs.references;
      return juzs.map((j, index) => ({
          id: j.id || index + 1,
          surah: j.surah,
          ayah: j.ayah
      }));
  },

  getSurah: async (id, lang = 'en.sahih') => {
      const arabicData = await quranService._loadData('arabic');
      const langType = lang.startsWith('ur') ? 'urdu' : 'english';
      const translationData = await quranService._loadData(langType);

      // Surah arrays are 0-indexed
      const arSurah = arabicData.surahs[id - 1];
      const transSurah = translationData.surahs[id - 1];

      // Merge Ayahs
      const mergedAyahs = arSurah.ayahs.map((arAyah, index) => ({
          number: arAyah.number,
          numberInSurah: arAyah.numberInSurah,
          text: arAyah.text, 
          translation: transSurah.ayahs[index].text,
          juz: arAyah.juz,
          ruku: arAyah.ruku
      }));

      return {
          ...arSurah,
          ayahs: mergedAyahs
      };
  },

  getJuz: async (id, lang = 'en.sahih') => {
      const arabicData = await quranService._loadData('arabic');
      const langType = lang.startsWith('ur') ? 'urdu' : 'english';
      const translationData = await quranService._loadData(langType);

      // We must scan through all surahs and extract ayahs belonging to this Juz
      const mergedAyahs = [];
      const surahsIncluded = {};

      for (let s = 0; s < arabicData.surahs.length; s++) {
          const arSurah = arabicData.surahs[s];
          const transSurah = translationData.surahs[s];
          
          let hasJuz = false;
          
          for (let a = 0; a < arSurah.ayahs.length; a++) {
              const arAyah = arSurah.ayahs[a];
              
              if (arAyah.juz === parseInt(id)) {
                  if (!hasJuz) {
                      surahsIncluded[arSurah.number] = {
                          number: arSurah.number,
                          name: arSurah.name,
                          englishName: arSurah.englishName,
                          englishNameTranslation: arSurah.englishNameTranslation,
                          revelationType: arSurah.revelationType,
                          numberOfAyahs: arSurah.ayahs.length
                      };
                      hasJuz = true;
                  }
                  
                  mergedAyahs.push({
                      number: arAyah.number,
                      numberInSurah: arAyah.numberInSurah,
                      surah: surahsIncluded[arSurah.number], // Attach surah info
                      text: arAyah.text,
                      translation: transSurah.ayahs[a].text,
                      juz: arAyah.juz,
                      ruku: arAyah.ruku
                  });
              } else if (arAyah.juz > parseInt(id)) {
                  // Optimization: Since ayahs are sequential across the entire Quran, 
                  // if we passed the juz, we could break out entirely, but to be safe we just break the ayah loop.
                  break;
              }
          }
      }

      return {
          number: parseInt(id),
          ayahs: mergedAyahs,
          surahs: surahsIncluded
      };
  },

  parseTajweed: (rawText) => {
      if (!rawText) return '';
      const tajweedMap = {
          'h': 'tajweed-idgham',
          's': 'tajweed-ikhfa',
          'n': 'tajweed-ghunnah',
          'p': 'tajweed-qalqalah',
          'm': 'tajweed-madd',
          'q': 'tajweed-qalb',
          'c': 'tajweed-ikhfa', 
          'o': 'tajweed-idgham',
          'l': 'tajweed-idgham',
          'a': 'tajweed-idgham',
      };
      const regex = /\[([a-z]+)(?::[0-9]+)?\[([^\]]+)\]/g;
      return rawText.replace(regex, (match, ruleCode, text) => {
          const className = tajweedMap[ruleCode];
          if (!className) return text;
          return `<span class="${className}">${text}</span>`;
      });
  },

  stripTajweed: (rawText) => {
      if (!rawText) return '';
      const regex = /\[([a-z]+)(?::[0-9]+)?\[([^\]]+)\]/g;
      return rawText.replace(regex, '$2');
  }
};
