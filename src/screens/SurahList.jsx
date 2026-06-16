import React, { useState, useEffect } from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { quranService } from '../services/quranService';
import { useApp } from '../AppContext';
import { FiArrowLeft, FiSearch, FiAlertTriangle, FiChevronRight } from 'react-icons/fi';

export const SurahList = ({ setTab }) => {
    const { goBack } = useApp();
    const [activeTab, setActiveTab] = useState('surah'); // 'surah' or 'juz'
    const [surahs, setSurahs] = useState([]);
    const [juzs, setJuzs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [surahData, juzData] = await Promise.all([
                    quranService.getSurahList(),
                    quranService.getJuzList()
                ]);
                setSurahs(surahData);
                setJuzs(juzData);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load data. Please check your connection.');
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredSurahs = surahs.filter(s => 
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.name.includes(searchQuery)
    );

    // Filter Juz by number (if user types "1" it shows Juz 1, etc.)
    const filteredJuzs = juzs.filter(j => 
        (j.id || j.juz).toString().includes(searchQuery)
    );

    // Helper to get surah name for juz starting point
    const getSurahName = (surahNumber) => {
        const surah = surahs.find(s => s.number === surahNumber);
        return surah ? surah.englishName : `Surah ${surahNumber}`;
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative z-20">
            
            {/* Top Header (Sticky Fade Mask) */}
            <div className="w-full sticky top-0 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8">
                <div className="pointer-events-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={goBack} className="w-10 h-10 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all shadow-inner bg-emerald-dark shrink-0">
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <h2 className="font-display text-2xl text-cream tracking-wide">The Holy Quran</h2>
                            <span className="text-sage text-[10px] tracking-widest uppercase">114 Surahs • 30 Juzs</span>
                        </div>
                    </div>

                    {/* Tab Toggle */}
                    <div className="flex bg-emerald-dark/80 backdrop-blur-md rounded-full border border-cream/10 p-1 mb-4">
                        <button 
                            onClick={() => setActiveTab('surah')}
                            className={`flex-1 py-2 rounded-full text-xs font-display tracking-widest uppercase transition-all ${activeTab === 'surah' ? 'bg-gold text-forest shadow-md' : 'text-sage hover:text-cream'}`}
                        >
                            Surah
                        </button>
                        <button 
                            onClick={() => setActiveTab('juz')}
                            className={`flex-1 py-2 rounded-full text-xs font-display tracking-widest uppercase transition-all ${activeTab === 'juz' ? 'bg-gold text-forest shadow-md' : 'text-sage hover:text-cream'}`}
                        >
                            Juz
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <FiSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-sage text-lg" />
                        <input 
                            type="text" 
                            placeholder={activeTab === 'surah' ? "Search Surah..." : "Search Juz number..."} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-emerald-dark/50 border border-cream/10 rounded-2xl py-3 ps-12 pe-4 text-cream font-body text-sm focus:outline-none focus:border-gold/30 placeholder-sage/50"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full space-y-4 relative z-10">
                {isLoading ? (
                    // Loading Skeletons
                    Array.from({ length: 8 }).map((_, idx) => (
                        <div key={idx} className="h-20 bg-emerald-dark/30 rounded-3xl border border-cream/5 animate-pulse"></div>
                    ))
                ) : error ? (
                    // Error State
                    <div className="text-center py-10 text-rose-400 bg-rose-400/10 rounded-3xl border border-rose-400/20">
                        <FiAlertTriangle className="text-4xl mb-3 block mx-auto" />
                        <p className="font-display">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-rose-400/20 rounded-full text-xs hover:bg-rose-400/30 transition">Retry</button>
                    </div>
                ) : activeTab === 'surah' ? (
                    // Surah List
                    filteredSurahs.length === 0 ? (
                        <div className="text-center py-10 text-sage/50">
                            <FiSearch className="text-4xl mb-3 block mx-auto" />
                            <p className="font-display">No Surah found</p>
                        </div>
                    ) : (
                        filteredSurahs.map((surah) => (
                            <DoubleBezelCard 
                                key={`surah-${surah.number}`} 
                                delay={`anim-delay-0`}
                                onClick={() => setTab('quran-reader', { book: { readType: 'surah', id: surah.number, title: surah.englishName } })}
                                className="!p-1 hover:scale-[1.02] transition-transform"
                            >
                                <div className="flex items-center justify-between pointer-events-none">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 shrink-0 rounded-full border border-gold/30 flex items-center justify-center text-gold text-xs font-display relative bg-emerald-dark">
                                            {surah.number}
                                            <div className="absolute inset-0 bg-gold/5 rounded-full"></div>
                                        </div>
                                        <div>
                                            <h3 className="font-display text-xl text-cream truncate max-w-[140px]">{surah.englishName}</h3>
                                            <p className="text-sage text-[10px] tracking-widest uppercase">{surah.revelationType} • {surah.numberOfAyahs} Ayahs</p>
                                        </div>
                                    </div>
                                    <span className="font-urdu text-2xl text-cream opacity-80 ps-2">{surah.name.replace('سُورَةُ ', '')}</span>
                                </div>
                            </DoubleBezelCard>
                        ))
                    )
                ) : (
                    // Juz List
                    filteredJuzs.length === 0 ? (
                        <div className="text-center py-10 text-sage/50">
                            <FiSearch className="text-4xl mb-3 block mx-auto" />
                            <p className="font-display">No Juz found</p>
                        </div>
                    ) : (
                        filteredJuzs.map((juz) => (
                            <DoubleBezelCard 
                                key={`juz-${juz.id}`} 
                                delay={`anim-delay-0`}
                                onClick={() => setTab('quran-reader', { book: { readType: 'juz', id: juz.id, title: `Juz ${juz.id}` } })}
                                className="!p-1 hover:scale-[1.02] transition-transform"
                            >
                                <div className="flex items-center gap-4 pointer-events-none p-2">
                                    <div className="w-12 h-12 shrink-0 rounded-full border border-gold/30 flex items-center justify-center text-gold text-sm font-display relative bg-emerald-dark">
                                        {juz.id}
                                        <div className="absolute inset-0 bg-gold/5 rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display text-xl text-cream">Juz {juz.id}</h3>
                                        <p className="text-sage text-[10px] tracking-widest uppercase truncate">
                                            Starts at {getSurahName(juz.surah)}, Ayah {juz.ayah}
                                        </p>
                                    </div>
                                    <FiChevronRight className="text-gold text-xl" />
                                </div>
                            </DoubleBezelCard>
                        ))
                    )
                )}
            </div>
        </div>
    );
};
