const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

export const hadithService = {
    // Fetches the global metadata and caches it to prevent 400KB re-downloads
    getMetadata: async () => {
        try {
            try {
                const cached = localStorage.getItem('hadith_metadata');
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (e) {
                console.warn("Failed to read from localStorage:", e);
            }

            const response = await fetch(`${BASE_URL}/info.json`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const data = await response.json();
            
            try {
                localStorage.setItem('hadith_metadata', JSON.stringify(data));
            } catch (e) {
                console.warn("Failed to save to localStorage:", e);
            }
            
            return data;
        } catch (error) {
            console.error("Hadith Metadata Error:", error);
            throw error;
        }
    },

    // Fetches a specific section (chapter) for a book, pulling both Arabic and English
    getSection: async (bookId, sectionId) => {
        try {
            const [engRes, araRes] = await Promise.all([
                fetch(`${BASE_URL}/editions/eng-${bookId}/sections/${sectionId}.json`),
                fetch(`${BASE_URL}/editions/ara-${bookId}/sections/${sectionId}.json`)
            ]);

            if (!engRes.ok || !araRes.ok) {
                throw new Error(`Failed to fetch section ${sectionId} for ${bookId}`);
            }

            const engData = await engRes.json();
            const araData = await araRes.json();

            // Merge Arabic and English hadiths by iterating through English array
            const mergedHadiths = engData.hadiths.map((engHadith, index) => {
                const araHadith = araData.hadiths[index];
                return {
                    number: engHadith.hadithnumber,
                    english: engHadith.text,
                    arabic: araHadith ? araHadith.text : '',
                    grades: engHadith.grades || []
                };
            });

            return mergedHadiths;
        } catch (error) {
            console.error("Hadith Section Error:", error);
            throw error;
        }
    }
};
