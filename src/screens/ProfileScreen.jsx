import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useApp } from '../AppContext';
import moment from 'moment';
import { NOORBAKHSHIA_BOOKS, HADITH_BOOKS } from '../data/libraryBooks';
import { FiSettings, FiClock, FiBookOpen, FiBook, FiBookmark, FiArrowRight } from 'react-icons/fi';
import { FaUser, FaBookOpen, FaBook, FaPlay, FaBookmark, FaRegBookmark, FaTrash } from 'react-icons/fa6';

export const ProfileScreen = ({ setTab }) => {
    const { userName, userAvatar, setUserAvatar, readHistory, bookmarks, removeBookmark, clearHistory, clearBookmarks } = useStore();
    const { navigateTo } = useApp();
    const [activeSection, setActiveSection] = useState('history'); // 'history' or 'bookmarks'

    const recentItem = readHistory && readHistory.length > 0 ? readHistory[0] : null;
    const historyList = readHistory && readHistory.length > 1 ? readHistory.slice(1) : [];

    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setUserAvatar(dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleResume = (item) => {
        if (!item) return;
        let params;
        if (item.type === 'quran') {
            params = { book: { id: item.id, readType: item.readType, lastVerseId: item.lastVerseId } };
        } else {
            const fullBook = [...NOORBAKHSHIA_BOOKS, ...HADITH_BOOKS].find(b => b.id === item.id) || { id: item.id };
            params = { book: { ...fullBook, chapterIndex: item.chapterIndex, lastParaId: item.lastParaId } };
        }
        navigateTo(item.type === 'quran' ? 'quran-reader' : 'book-reader', params);
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col relative z-20">
            {/* Top Header (Sticky Fade Mask) */}
            <div className="sticky top-0 -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent">
                <div className="flex items-center justify-between animate-fade-down pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-14 h-14 rounded-full bg-gold text-forest flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.3)] cursor-pointer overflow-hidden relative group shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {userAvatar && userAvatar.startsWith('data:image') ? (
                                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <FaUser className="text-3xl" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] text-cream font-bold uppercase tracking-widest text-center leading-tight">Change<br/>Photo</span>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                        />
                        <div className="flex-1 min-w-0">
                            <h2 className="font-display text-2xl text-cream tracking-wide truncate">
                                {userName ? userName : 'My Journey'}
                            </h2>
                            <span className="text-sage text-xs tracking-widest uppercase mt-1 block">Your personal dashboard</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setTab('settings')}
                        className="w-12 h-12 rounded-full bg-white/5 border border-cream/5 flex items-center justify-center text-sage hover:text-gold hover:bg-white/10 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md shrink-0"
                    >
                        <FiSettings className="text-2xl" />
                    </button>
                </div>
            </div>

            {/* Hero Card: Resume Reading */}
            {recentItem && (
                <div className="mb-8 animate-fade-down anim-delay-100">
                    <h3 className="font-display text-sage text-sm mb-3 px-1">Resume Reading</h3>
                    <div 
                        onClick={() => handleResume(recentItem)}
                        className="w-full bg-forest border border-gold/30 rounded-3xl p-5 shadow-[0_8px_30px_rgba(201,168,76,0.1)] relative overflow-hidden group cursor-pointer hover:border-gold/60 transition-colors"
                    >
                        <div className="absolute top-0 end-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                                {recentItem.type === 'quran' ? <FaBookOpen className="text-gold text-2xl" /> : <FaBook className="text-gold text-2xl" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-cream font-display text-xl truncate group-hover:text-gold transition-colors">{recentItem.title}</h4>
                                <p className="text-sage text-sm truncate flex items-center gap-2 mt-0.5">
                                    <span>{recentItem.subtitle}</span>
                                    <span className="w-1 h-1 rounded-full bg-cream/20"></span>
                                    <span className="text-gold">{recentItem.progress}</span>
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gold text-forest flex items-center justify-center shrink-0 shadow-lg">
                                <FaPlay className="text-lg ps-0.5" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Segmented Sub-Navigation */}
            <div className="flex bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md rounded-full border border-cream/10 p-1 mb-6 animate-fade-up anim-delay-200">
                <button 
                    onClick={() => setActiveSection('history')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-display transition-all ${activeSection === 'history' ? 'bg-gold text-forest shadow-md' : 'text-sage hover:text-cream'}`}
                >
                    <FiClock />
                    History
                </button>
                <button 
                    onClick={() => setActiveSection('bookmarks')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-display transition-all ${activeSection === 'bookmarks' ? 'bg-gold text-forest shadow-md' : 'text-sage hover:text-cream'}`}
                >
                    {activeSection === 'bookmarks' ? <FaBookmark /> : <FaRegBookmark />}
                    Bookmarks
                </button>
            </div>

            {/* 1. Read History Section */}
            {activeSection === 'history' && (
                <div className="space-y-4 animate-fade-up">
                    {(!readHistory || readHistory.length === 0) ? (
                        <div className="text-center py-12 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl border border-cream/5">
                            <FiClock className="text-5xl text-gold/30 mb-4 mx-auto block" />
                            <p className="font-display text-cream text-lg">No reading history</p>
                            <p className="text-sm text-sage mt-2 mb-6">Start your journey by reading the Quran.</p>
                            <button 
                                onClick={() => setTab('home')}
                                className="px-6 py-2.5 bg-gold text-forest font-bold text-sm rounded-full hover:bg-cream transition-colors"
                            >
                                Read Al-Quran
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-end mb-2 px-1">
                                <h3 className="font-display text-sage text-sm">Earlier</h3>
                                <button 
                                    onClick={() => clearHistory()}
                                    className="text-[10px] text-sage hover:text-rose-400 uppercase tracking-widest font-bold transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                            {historyList.length === 0 ? (
                                <p className="text-center text-sage/50 text-xs py-4">No older history.</p>
                            ) : (
                                historyList.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5 rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleResume(item)}>
                                        <div className="w-12 h-12 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center shrink-0">
                                            {item.type === 'quran' ? <FiBookOpen className="text-gold text-xl" /> : <FiBook className="text-gold text-xl" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-cream font-display text-lg truncate group-hover:text-gold transition-colors">{item.title}</h4>
                                            <p className="text-sage text-xs truncate flex items-center gap-2 mt-0.5">
                                                <span>{item.subtitle}</span>
                                            </p>
                                        </div>
                                        <div className="text-end shrink-0">
                                            <p className="text-[10px] text-sage/70 uppercase tracking-widest block mb-1">
                                                {moment(item.timestamp).fromNow(true)} ago
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            )}

            {/* 2. Bookmarks Section */}
            {activeSection === 'bookmarks' && (
                <div className="space-y-4 animate-fade-up">
                    {(!bookmarks || bookmarks.length === 0) ? (
                        <div className="text-center py-12 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl border border-cream/5">
                            <FiBookmark className="text-5xl text-gold/30 mb-4 mx-auto block" />
                            <p className="font-display text-cream text-lg">No bookmarks saved</p>
                            <p className="text-sm text-sage mt-2 mb-6">Tap the bookmark icon while reading to save pages.</p>
                            <button 
                                onClick={() => setTab('library')}
                                className="px-6 py-2.5 bg-gold text-forest font-bold text-sm rounded-full hover:bg-cream transition-colors"
                            >
                                Explore Library
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end mb-2 px-1">
                                <button 
                                    onClick={() => clearBookmarks()}
                                    className="text-[10px] text-sage hover:text-rose-400 uppercase tracking-widest font-bold transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                            {bookmarks.map(bm => (
                                <div key={bm.id} className="bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5 rounded-2xl p-5 relative overflow-hidden group">
                                    <div className="absolute top-0 end-0 w-24 h-24 bg-gold/5 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-widest border border-gold/30 mb-2 inline-block">
                                                {bm.type}
                                            </span>
                                            <h4 className="text-cream font-display text-lg group-hover:text-gold transition-colors">{bm.title}</h4>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeBookmark(bm.id); }}
                                            className="text-sage hover:text-rose-400 transition-colors p-1 z-10"
                                        >
                                            <FaTrash className="text-lg" />
                                        </button>
                                    </div>
                                    <p className="text-sage/80 text-sm font-light italic border-l-2 border-gold/30 ps-3 mb-4 line-clamp-3">
                                        "{bm.preview}"
                                    </p>
                                    <div className="flex justify-between items-center mt-2 relative z-10">
                                        <span className="text-[10px] text-sage uppercase tracking-wider">{moment(bm.timestamp).format('MMM D, YYYY')}</span>
                                        <button 
                                            onClick={() => navigateTo(bm.tab, bm.params)}
                                            className="text-xs font-bold text-gold hover:text-cream flex items-center gap-1 transition-colors bg-gold/10 px-3 py-1.5 rounded-full"
                                        >
                                            Jump to Page <FiArrowRight />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
