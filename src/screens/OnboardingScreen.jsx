import React, { useState } from 'react';
import { useStore } from '../store/useStore';

const AVATARS = [
    { id: 'pattern1', icon: 'ph-mosque' },
    { id: 'pattern2', icon: 'ph-moon-stars' },
    { id: 'pattern3', icon: 'ph-star-four' },
    { id: 'pattern4', icon: 'ph-flower-lotus' },
    { id: 'pattern5', icon: 'ph-book-open-text' },
];

export const OnboardingScreen = ({ onComplete }) => {
    const { setUserName, setUserAvatar } = useStore();
    const [nameInput, setNameInput] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);

    const handleContinue = (e) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        
        setUserName(nameInput.trim());
        setUserAvatar(selectedAvatar);
        onComplete();
    };

    return (
        <div className="w-full h-full overflow-y-auto px-6 py-12 flex flex-col justify-center items-center relative z-20">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-full max-w-sm animate-fade-up">
                <div className="text-center mb-10">
                    <span className="text-gold text-sm tracking-[0.3em] uppercase block mb-4 font-display">Bismillah</span>
                    <h1 className="font-display text-4xl text-cream tracking-wide mb-2">Welcome to<br/>Your Journey</h1>
                    <p className="text-sage text-sm">Let's personalize your spiritual companion.</p>
                </div>

                <form onSubmit={handleContinue} className="flex flex-col gap-8">
                    {/* Name Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-sage uppercase tracking-widest ps-2">What should we call you?</label>
                        <input 
                            type="text" 
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-[#071510] border border-cream/10 rounded-2xl p-4 text-cream font-display text-xl focus:outline-none focus:border-gold/50 transition-colors"
                            autoFocus
                        />
                    </div>




                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={!nameInput.trim()}
                        className="w-full bg-gold text-forest font-display font-bold text-xl py-4 rounded-2xl mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream hover:shadow-[0_0_20px_rgba(245,230,200,0.2)]"
                    >
                        Begin Journey
                    </button>
                </form>
            </div>
        </div>
    );
};
