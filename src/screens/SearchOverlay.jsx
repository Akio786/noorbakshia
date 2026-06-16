import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { useApp } from '../AppContext';
import { FiCompass, FiUsers, FiUser, FiSettings, FiBook, FiBookOpen, FiArrowLeft, FiSearch, FiXCircle } from 'react-icons/fi';
import { FaHandsPraying, FaScaleBalanced, FaQuoteRight, FaScroll } from 'react-icons/fa6';

// Mock data (App features)
const APP_FEATURES = [
    { type: 'Feature', title: 'Qibla Compass', subtitle: 'Find the direction of the Kaaba', id: 'compass', icon: FiCompass },
    { type: 'Feature', title: 'Tasbeeh Counter', subtitle: 'Digital dhikr counter', id: 'tasbeeh', icon: FaHandsPraying },
    { type: 'Feature', title: 'Community', subtitle: 'News, Masjids & Fatawa', id: 'community', icon: FiUsers },
    { type: 'Feature', title: 'My Journey', subtitle: 'Spiritual streaks and bookmarks', id: 'profile', icon: FiUser },
    { type: 'Feature', title: 'Settings', subtitle: 'App preferences and downloads', id: 'settings', icon: FiSettings },
];

// Mock data (Books/Literature)
const LITERATURE = [
    { type: 'Literature', title: 'Fiqh Ul Ahwat', subtitle: 'Jurisprudence by Syed Muhammad Nurbakhsh', id: 'library', icon: FaScaleBalanced },
    { type: 'Literature', title: 'Kitabul Etiqadia', subtitle: 'Theology & Beliefs', id: 'library', icon: FiBook },
    { type: 'Literature', title: 'Hadith Collection', subtitle: 'Sayings of the Prophet (PBUH)', id: 'library', icon: FaQuoteRight }
];

// In a real app, this would be a much larger dataset of Quran/Awrads lazily fetched.
const QURAN_MOCK = [
    { type: 'Quran', title: 'Surah Al-Fatihah', subtitle: 'The Opening • Makki', id: 'quran', icon: FiBookOpen },
    { type: 'Quran', title: 'Surah Ya-Seen', subtitle: 'Makki • 83 Verses', id: 'quran', icon: FiBookOpen },
    { type: 'Awrad', title: 'Dua Kumayl', subtitle: 'Thursday Night Practice', id: 'awrad', icon: FaScroll },
    { type: 'Awrad', title: 'Dua Joshan Kabeer', subtitle: '100 Names of Allah', id: 'awrad', icon: FaScroll },
];

export const SearchOverlay = () => {
    const { isSearchOpen, setSearchOpen, navigateTo } = useApp();
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const [fuse, setFuse] = useState(null);

    // Initialize Fuse.js ONLY when search is opened (Lazy Loading)
    useEffect(() => {
        if (isSearchOpen && !fuse) {
            const allData = [...APP_FEATURES, ...LITERATURE, ...QURAN_MOCK];
            const fuseInstance = new Fuse(allData, {
                keys: ['title', 'subtitle', 'type'],
                threshold: 0.3, // Fuzzy matching threshold
                includeScore: true
            });
            setFuse(fuseInstance);
        }
    }, [isSearchOpen, fuse]);

    // Auto-focus input when opened
    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchOpen]);

    if (!isSearchOpen) return null;

    let filtered = [];
    if (query && fuse) {
        filtered = fuse.search(query).map(result => result.item);
    }

    const handleSelect = (item) => {
        setSearchOpen(false);
        setQuery('');
        
        if (item.id === 'quran') {
            // Pass a mock ayahId for testing deep linking
            navigateTo('quran-reader', { book: { ayahId: 3 } });
        } else {
            navigateTo(item.id);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-fade-in flex flex-col">
            <div className="w-full h-full bg-[#05110d] animate-slide-up flex flex-col relative">
                
                {/* Search Header */}
                <div className="w-full px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-4 border-b border-cream/5 flex items-center gap-4 bg-emerald-dark/50">
                    <button onClick={() => setSearchOpen(false)} className="text-sage hover:text-gold transition-colors">
                        <FiArrowLeft className="text-2xl" />
                    </button>
                    <div className="flex-1 relative">
                        <FiSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-gold text-lg" />
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search Quran, Hadith, Fatawa..." 
                            className="w-full bg-[#071510] border border-cream/10 rounded-full py-3 ps-12 pe-10 text-cream font-body focus:outline-none focus:border-gold/50 transition-colors placeholder:text-sage/50"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="absolute end-4 top-1/2 -translate-y-1/2 text-sage hover:text-cream">
                                <FiXCircle className="text-lg" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 hide-scroll">
                    {!query ? (
                        <div className="animate-fade-up">
                            <span className="text-[10px] uppercase tracking-widest text-sage mb-4 block">Quick Links</span>
                            <div className="flex flex-wrap gap-2">
                                {['Surah Ya-Seen', 'Dua Kumayl', 'Tasbeeh Counter', 'Fiqh Ul Ahwat'].map(tag => (
                                    <button key={tag} onClick={() => setQuery(tag)} className="px-4 py-2 rounded-full border border-cream/5 bg-emerald-dark text-sage text-xs hover:border-gold/30 hover:text-cream transition-colors">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-up">
                            <span className="text-[10px] uppercase tracking-widest text-gold mb-4 block">
                                {filtered.length} Results for "{query}"
                            </span>
                            <div className="space-y-3">
                                {filtered.length > 0 ? filtered.map((res, idx) => (
                                    <div key={idx} onClick={() => handleSelect(res)} className="p-4 rounded-2xl border border-cream/5 flex items-center gap-4 bg-emerald-dark/30 hover:bg-emerald-dark/80 cursor-pointer transition-colors group">
                                        <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                            <res.icon className="text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="font-display text-cream text-lg">{res.title}</h4>
                                            <p className="text-sage text-xs mt-0.5">{res.type} • {res.subtitle}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12">
                                        <FiSearch className="text-4xl text-sage/30 mb-4 mx-auto block" />
                                        <h4 className="font-display text-cream text-lg mb-1">No results found</h4>
                                        <p className="text-sage text-sm font-light">Try checking your spelling or use different keywords.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
