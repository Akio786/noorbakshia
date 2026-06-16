import React, { useState, useEffect, useMemo } from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { useApp } from '../AppContext';
import { noorbakhshiaService } from '../services/noorbakhshiaService';
import { hadithService } from '../services/hadithService';
import { FiChevronRight, FiAlertTriangle, FiSearch, FiArrowLeft } from 'react-icons/fi';

// Utility to check if text contains Arabic/Urdu script
const containsUrdu = (str) => /[؀-ۿ]/.test(str);

export const BookTocScreen = ({ setTab, selectedBook }) => {
    const { goBack } = useApp();
    const [chapters, setChapters] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // New Tab State
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        if (!selectedBook) return;

        const fetchChapters = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (selectedBook.isNoorbakhshia) {
                    const bookPayload = await noorbakhshiaService.getBook(selectedBook.id);
                    if (bookPayload && bookPayload.data) {
                        const parsedChapters = bookPayload.data.map((ch, idx) => {
                            let title = ch.chapter_name_ur || ch.chapter_name_en || `Chapter ${ch.chapter_id}`;
                            let subtitle = null;
                            let urduSideTitle = null;
                            let section = null;

                            // Apply string splitting strictly for dawat-shareef
                            if (selectedBook.id === 'dawat-shareef' && title.includes(' - ')) {
                                const parts = title.split(' - ');
                                section = parts[0].trim();
                                title = parts.slice(1).join(' - ').trim(); // Usually Urdu
                            } else if (ch.chapter_name_en && ch.chapter_name_ur) {
                                // If both exist (e.g. Fiqh book), show English as main title, Urdu on the side
                                title = ch.chapter_name_en;
                                urduSideTitle = ch.chapter_name_ur;
                            }

                            return {
                                id: ch.chapter_id,
                                title,
                                subtitle,
                                urduSideTitle,
                                section,
                                index: idx
                            };
                        });
                        setChapters(parsedChapters);
                    } else {
                        setError("Failed to parse Noorbakhshia book structure.");
                    }
                } else if (selectedBook.isHadith) {
                    const data = await hadithService.getMetadata();
                    const bookMeta = data[selectedBook.id]?.metadata;
                    if (bookMeta && bookMeta.sections) {
                        const parsedChapters = Object.entries(bookMeta.sections)
                            .filter(([id, title]) => title && title.trim() !== "")
                            .map(([id, title], idx) => ({ id, title, section: null, index: idx }));
                        setChapters(parsedChapters);
                    } else {
                        setError("Failed to load chapters for this collection.");
                    }
                } else {
                    setChapters(selectedBook.content?.map((c, i) => ({ ...c, section: null, index: i })) || []);
                }
            } catch (err) {
                setError(`Network error: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChapters();
    }, [selectedBook]);

    // Derived unique sections for tabs
    const tabs = useMemo(() => {
        if (selectedBook?.id !== 'dawat-shareef') return [];
        const uniqueSections = new Set();
        chapters.forEach(ch => {
            if (ch.section) uniqueSections.add(ch.section);
        });
        return ['All', ...Array.from(uniqueSections)];
    }, [chapters, selectedBook?.id]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim() !== '') {
            setActiveTab('All');
        }
    };

    const filteredChapters = chapters.filter(c => {
        const matchesSearch = 
            c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id?.toString().includes(searchQuery);
            
        const matchesTab = activeTab === 'All' || c.section === activeTab;
        
        return matchesSearch && matchesTab;
    });

    if (!selectedBook) return null;

    let renderContent = null;

    function renderChapterCard(chapter, animDelay = 0) {
        const isTitleUrdu = containsUrdu(chapter.title);

        return (
            <DoubleBezelCard 
                key={chapter.id} 
                delay={`anim-delay-${animDelay}`}
                onClick={() => setTab('book-reader', { book: { ...selectedBook, chapterIndex: chapter.index } })}
                className="!p-1 hover:scale-[1.02] transition-transform"
            >
                <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-4 flex-1 min-w-0 pe-4">
                        <div className="w-12 h-12 shrink-0 rounded-full border border-gold/30 flex items-center justify-center text-gold text-sm font-display relative bg-emerald-dark">
                            {chapter.index + 1}
                            <div className="absolute inset-0 bg-gold/5 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center py-2">
                            {chapter.section && activeTab === 'All' && (
                                <span className="text-gold/80 text-[8px] uppercase tracking-widest font-bold mb-1 block text-left truncate" dir="ltr">
                                    {chapter.section.replace('_', ' ')}
                                </span>
                            )}
                            <h3 
                                dir={isTitleUrdu ? "rtl" : "ltr"}
                                className={`text-cream truncate ${isTitleUrdu ? 'font-indopak text-xl text-right' : 'font-display text-base text-left'}`}
                            >
                                {chapter.title}
                            </h3>
                            {chapter.subtitle && (
                                <p 
                                    dir={containsUrdu(chapter.subtitle) ? "rtl" : "ltr"}
                                    className={`text-sage text-[10px] tracking-widest uppercase mt-1 truncate ${containsUrdu(chapter.subtitle) ? 'font-indopak text-lg text-right' : 'font-display text-left'}`}
                                >
                                    {chapter.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {chapter.urduSideTitle && (
                        <span className="font-indopak text-xl text-cream opacity-80 ps-2 shrink-0 max-w-[120px] text-right truncate" dir="rtl">
                            {chapter.urduSideTitle}
                        </span>
                    )}
                    <FiChevronRight className="text-gold text-xl ms-2 opacity-50 shrink-0" />
                </div>
            </DoubleBezelCard>
        );
    }

    if (isLoading) {
        renderContent = Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-20 bg-emerald-dark/30 rounded-3xl border border-cream/5 animate-pulse mb-4"></div>
        ));
    } else if (error) {
        renderContent = (
            <div className="text-center py-10 text-rose-400 bg-rose-400/10 rounded-3xl border border-rose-400/20">
                <FiAlertTriangle className="text-4xl mb-3 block mx-auto" />
                <p className="font-display">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-rose-400/20 rounded-full text-xs hover:bg-rose-400/30 transition">Retry</button>
            </div>
        );
    } else if (filteredChapters.length === 0) {
        renderContent = (
            <div className="text-center py-10 text-sage/50">
                <FiSearch className="text-4xl mb-3 block mx-auto" />
                <p className="font-display">No Chapters found</p>
            </div>
        );
    } else {
        renderContent = <div className="w-full space-y-4 relative z-10">{filteredChapters.map((chapter) => renderChapterCard(chapter, 0))}</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative z-20">
            
            {/* Top Header (Sticky Fade Mask) */}
            <div className="w-full sticky top-0 z-[100] bg-gradient-to-b from-[#05110d] from-60% via-[#05110d]/90 to-transparent -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-6">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={goBack} className="w-10 h-10 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all shadow-inner bg-emerald-dark shrink-0">
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <h2 className="font-display text-2xl text-cream tracking-wide truncate max-w-[200px] sm:max-w-[300px]">{selectedBook.title}</h2>
                            <span className="text-sage text-[10px] tracking-widest uppercase">{chapters.length} Chapters</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <FiSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-sage text-lg" />
                        <input 
                            type="text" 
                            placeholder="Search chapters..." 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-emerald-dark/50 border border-cream/10 rounded-2xl py-3 ps-12 pe-4 text-cream font-body text-sm focus:outline-none focus:border-gold/30 placeholder-sage/50 shadow-inner"
                        />
                    </div>

                    {/* Horizontal Scrollable Tabs */}
                    {tabs.length > 0 && (
                        <div className="flex overflow-x-auto hide-scroll gap-2 pb-2 -mx-6 px-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setSearchQuery('');
                                    }}
                                    className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-display uppercase tracking-widest transition-all duration-300 shadow-sm
                                        ${activeTab === tab 
                                            ? 'bg-gold/20 text-gold border border-gold/50 shadow-[0_0_15px_rgba(201,168,76,0.15)]' 
                                            : 'bg-emerald-dark border border-cream/10 text-sage hover:text-cream hover:border-cream/30'
                                        }`}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="w-full relative z-10 pt-2">
                {renderContent}
            </div>
        </div>
    );
};
