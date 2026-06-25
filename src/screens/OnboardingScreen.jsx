import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useApp } from '../AppContext';

const AVATARS = [
    { id: 'pattern1', icon: 'ph-mosque' },
    { id: 'pattern2', icon: 'ph-moon-stars' },
    { id: 'pattern3', icon: 'ph-star-four' },
    { id: 'pattern4', icon: 'ph-flower-lotus' },
    { id: 'pattern5', icon: 'ph-book-open-text' },
];

export const OnboardingScreen = ({ onComplete }) => {
    const { setUserName, setUserAvatar } = useStore();
    const { requestLocationAccess } = useApp();
    const [nameInput, setNameInput] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
    const [isLocating, setIsLocating] = useState(false);
    const [locationErrorMsg, setLocationErrorMsg] = useState('');

    const handleContinue = async (e) => {
        e.preventDefault();
        if (!nameInput.trim() || isLocating) return;
        
        setIsLocating(true);
        setLocationErrorMsg('');
        
        try {
            await requestLocationAccess();
            // If location succeeds, complete onboarding
            setUserName(nameInput.trim());
            setUserAvatar(selectedAvatar);
            onComplete();
        } catch (err) {
            console.error("Onboarding GPS Error:", err);
            setIsLocating(false);
            
            let errorMsg = `Failed to get location: ${err?.message || 'Unknown error'}. `;
            if (err && err.code) {
                switch(err.code) {
                    case 1: // PERMISSION_DENIED
                        errorMsg = 'Browser permission denied. Please tap the lock icon in the URL bar and allow location.';
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMsg = 'Device location is turned off. Please pull down your notification shade and turn on "Location" or "GPS".';
                        break;
                    case 3: // TIMEOUT
                        errorMsg = 'Location request timed out. Please make sure you have a clear view of the sky or are connected to Wi-Fi, then try again.';
                        break;
                }
            } else if (err && err.message === 'Geolocation not supported') {
                 errorMsg = 'Your browser does not support geolocation.';
            } else {
                 errorMsg += ' Both GPS and IP-fallback failed. Please check your adblocker or internet connection.';
            }
            setLocationErrorMsg(errorMsg);
        }
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

                    {/* Avatar Selection */}
                    <div className="flex flex-col gap-3">
                        <label className="text-xs text-sage uppercase tracking-widest ps-2">Choose an Icon</label>
                        <div className="flex justify-between items-center bg-[#071510] border border-cream/5 rounded-2xl p-4">
                            {AVATARS.map(avatar => (
                                <button 
                                    key={avatar.id}
                                    type="button"
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedAvatar === avatar.id ? 'bg-gold text-forest shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'bg-emerald-dark text-sage hover:text-cream border border-transparent hover:border-cream/10'}`}
                                >
                                    <i className={`ph-fill ${avatar.icon} text-2xl`}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-2">
                        <button 
                            type="submit"
                            disabled={!nameInput.trim() || isLocating}
                            className="w-full bg-gold text-forest font-display font-bold text-xl py-4 rounded-2xl mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream hover:shadow-[0_0_20px_rgba(245,230,200,0.2)] flex items-center justify-center gap-2"
                        >
                            {isLocating ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin"></span>
                                    Getting Location...
                                </>
                            ) : (
                                "Begin Journey"
                            )}
                        </button>
                        
                        {locationErrorMsg && (
                            <div className="text-rose-400 text-xs text-center mt-2 bg-rose-400/10 p-3 rounded-xl border border-rose-400/20">
                                {locationErrorMsg}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
