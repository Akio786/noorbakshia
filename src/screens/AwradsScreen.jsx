import React from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { useApp } from '../AppContext';
import { useStore } from '../store/useStore';
import { AWRADS } from '../data/libraryBooks';
import { FiArrowLeft } from 'react-icons/fi';
import { FaBookmark, FaRegBookmark, FaScroll } from 'react-icons/fa6';

export const AwradsScreen = ({ setTab, setSelectedBook }) => {
    const { goBack } = useApp();
    const { bookmarks, addBookmark, removeBookmark } = useStore();

    const handleBookmark = (e, awrad) => {
        e.stopPropagation();
        const existing = bookmarks.find(b => b.bookId === awrad.id);
        if (existing) {
            removeBookmark(existing.id);
        } else {
            addBookmark({
                type: 'Awrad',
                bookId: awrad.id,
                title: awrad.title,
                preview: awrad.type,
                tab: 'awrad'
            });
        }
    };

    const handleAwradClick = (awrad) => {
        setSelectedBook({
            ...awrad,
            content: [
                { title: awrad.title, content: `O Allah, bless Muhammad and the family of Muhammad. This is the sacred text for ${awrad.title}. It is recited to seek nearness to the Almighty and purify the soul.` }
            ]
        });
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative">
            
            {/* Top Header (Sticky Fade Mask) */}
            <div className="self-stretch sticky -top-10 -mx-6 px-6 -mt-10 pt-[calc(5.5rem+env(safe-area-inset-top))] pb-8 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent">
                <div className="w-full flex items-center justify-between animate-fade-down relative pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <button onClick={goBack} className="w-10 h-10 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all shadow-inner bg-emerald-dark">
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <h2 className="font-display text-xl text-cream tracking-wide truncate max-w-[200px]">Awrads & Duas</h2>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="w-full mt-4 space-y-4 relative z-10">
                {AWRADS.map((awrad, idx) => {
                    const isBookmarked = bookmarks.some(b => b.bookId === awrad.id);
                    return (
                        <DoubleBezelCard 
                            key={awrad.id} 
                            delay={`anim-delay-${Math.min((idx+1)*100, 600)}`} 
                            onClick={() => handleAwradClick(awrad)}
                            className=""
                        >
                            <div className="flex items-center justify-between pointer-events-none pe-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 shrink-0 rounded-full border border-gold/30 flex items-center justify-center text-gold text-xs relative bg-emerald-dark">
                                        {awrad.Icon ? <awrad.Icon /> : <FaScroll />}
                                        <div className="absolute inset-0 bg-gold/5 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl text-cream">{awrad.title}</h3>
                                        <p className="text-sage text-[10px] tracking-widest uppercase">{awrad.type}</p>
                                    </div>
                                </div>
                                <button onClick={(e) => handleBookmark(e, awrad)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors pointer-events-auto ${isBookmarked ? 'text-gold' : 'text-sage hover:text-gold'}`}>
                                    {isBookmarked ? <FaBookmark className="text-xl" /> : <FaRegBookmark className="text-xl" />}
                                </button>
                            </div>
                        </DoubleBezelCard>
                    );
                })}
            </div>
        </div>
    );
};
