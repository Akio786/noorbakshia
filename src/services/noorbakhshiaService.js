export const noorbakhshiaService = {
    // Fetches the entire book payload from the statically hosted JSON in public/api/books/
    getBook: async (bookId) => {
        try {
            const baseUrl = import.meta.env.BASE_URL || '/';
            // Clean up double slashes just in case
            const url = `${baseUrl}api/books/${bookId}.json`.replace(/([^:]\/)\/+/g, "$1");
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const data = await response.json();
            
            // Auto-flatten single-chapter books (e.g. Kitab al-Aetiqadia)
            if (data && data.data && data.data.length === 1 && data.data[0].topics) {
                const singleChapter = data.data[0];
                data.data = singleChapter.topics.map(topic => ({
                    chapter_id: topic.topic_id,
                    chapter_name_ur: topic.topic_name_ur,
                    chapter_name_en: topic.topic_name_en || null,
                    topics: [topic] // Wrap in array so BookReaderScreen parses it identically
                }));
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching Noorbakhshia Book (${bookId}):`, error);
            throw error;
        }
    }
};
