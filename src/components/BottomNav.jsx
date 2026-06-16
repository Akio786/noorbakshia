import React from 'react';
import { FiHome, FiUser, FiBookOpen, FiCompass, FiMoreHorizontal } from 'react-icons/fi';

export const BottomNav = ({ currentTab, setTab }) => {
    // Hide BottomNav entirely for all sub-screens
    if (['quran', 'quran-reader', 'book-reader', 'awrad'].includes(currentTab)) return null;

    const rootTabs = [
        { id: 'home', Icon: FiHome },
        { id: 'library', Icon: FiBookOpen },
        { id: 'compass', Icon: FiCompass },
        { id: 'tasbeeh', Icon: FiMoreHorizontal },
        { id: 'profile', Icon: FiUser },
    ];

    const isRoot = rootTabs.some(t => t.id === currentTab);
    
    if (!isRoot) return null;

    return (
        <div className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] start-0 end-0 px-6 z-[60] animate-fade-up anim-delay-500">
            <div className="mx-auto w-max rounded-full backdrop-blur-2xl bg-forest/80 ring-1 ring-cream/10 p-2 flex items-center gap-1 sm:gap-2 shadow-2xl relative">
                
                {/* Root Navigation Mode */}
                {rootTabs.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                        <button 
                            key={item.id}
                            onClick={(e) => {
                                e.preventDefault();
                                setTab(item.id);
                            }}
                            className={`relative z-10 shrink-0 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-700 ease-fluid ${isActive ? 'text-forest' : 'text-sage hover:text-cream'}`}
                        >
                            {/* Active State Background Pill */}
                            <div className={`absolute inset-0 rounded-full bg-gold transition-all duration-700 ease-fluid ${isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>
                            
                            <item.Icon className={`text-xl relative z-10 transition-transform duration-700 ease-fluid ${isActive ? 'scale-110' : 'scale-100'}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
