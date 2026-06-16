import React from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { useApp } from '../AppContext';
import { FaBookQuran, FaBookOpen } from 'react-icons/fa6';
import { FiSearch } from 'react-icons/fi';

import { NOORBAKHSHIA_BOOKS, HADITH_BOOKS } from '../data/libraryBooks';

export const LibraryScreen = ({ setTab, setSelectedBook }) => {
    const { setSearchOpen } = useApp();

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center">

            {/* Top Header (Sticky Fade Mask) */}
            <div className="sticky top-0 w-full -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent">
                <div className="w-full flex items-center justify-between animate-fade-down relative pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <FaBookOpen className="text-gold text-2xl" />
                        <h2 className="font-display text-3xl text-cream tracking-wide">Library</h2>
                    </div>
                    <button onClick={() => setSearchOpen(true)} className="text-sage hover:text-gold transition-colors">
                        <FiSearch className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="w-full space-y-8 relative z-10">

                {/* Section 1: Al-Quran (Hero) */}
                <div className="w-full animate-fade-up">
                    <h3 className="text-[10px] text-sage uppercase tracking-[0.3em] mb-3 px-2 font-semibold">Divine Revelation</h3>
                    <div onClick={() => setTab('quran')} className="w-full bg-forest border border-cream/10 rounded-[2rem] p-6 flex items-center gap-5 cursor-pointer hover:border-gold/30 transition-colors shadow-lg relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 text-[150px] text-gold opacity-[0.03] group-hover:opacity-[0.05] transition-opacity font-display">Q</div>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-dark border border-cream/5 flex items-center justify-center text-gold text-3xl shadow-inner relative z-10 shrink-0">
                            <FaBookQuran />
                        </div>
                        <div className="relative z-10 flex-1 flex justify-between items-center pr-2">
                            <div>
                                <h3 className="font-display text-[1.1rem] sm:text-lg text-cream mb-1 mt-1">Al-Quran</h3>
                                <p className="text-sage text-[10px] sm:text-xs leading-relaxed max-w-[160px]">Read, listen, and explore the Holy Quran with translations.</p>
                            </div>
                            <div className="font-urdu text-[1.3rem] sm:text-xl text-gold opacity-80 text-right leading-none mb-4 mt-1">القرآن الکریم</div>
                        </div>
                    </div>
                </div>
                {/* Hadith section removed per user request */}


                {/* Section 3: Noorbakhshia Books */}
                <div className="w-full animate-fade-up anim-delay-200">
                    <h3 className="text-[10px] text-sage uppercase tracking-[0.3em] mb-3 px-2 font-semibold">Noorbakhshia Literature</h3>
                    <div className="space-y-4">
                        {NOORBAKHSHIA_BOOKS.map((book) => (
                            <div 
                                key={book.id} 
                                onClick={() => {
                                    setSelectedBook(book);
                                }} 
                                className="w-full bg-forest border border-cream/10 rounded-[2rem] p-6 flex items-center gap-5 cursor-pointer hover:border-gold/30 transition-colors shadow-lg relative overflow-hidden group"
                            >
                                <div className="absolute -right-10 -bottom-10 text-[150px] text-gold opacity-[0.03] group-hover:opacity-[0.05] transition-opacity font-display">
                                    {book.title.charAt(0)}
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-emerald-dark border border-cream/5 flex items-center justify-center text-gold text-3xl shadow-inner relative z-10 shrink-0">
                                    <book.Icon />
                                </div>
                                <div className="relative z-10 flex-1 flex justify-between items-center pr-2">
                                    <div>
                                        <h3 className="font-display text-[1.1rem] sm:text-lg text-cream mb-1 mt-1">{book.title}</h3>
                                        <p className="text-sage text-[10px] sm:text-xs leading-relaxed max-w-[130px] sm:max-w-[150px]">{book.subtitle}</p>
                                    </div>
                                    {book.urduTitle && (
                                        <div className="font-urdu text-[1.3rem] sm:text-xl text-gold opacity-80 text-right leading-none mb-3 mt-1">
                                            {book.urduTitle}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Section 2 removed per user request */}

            </div>
        </div>
    );
};
