import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { FiShare, FiPlusSquare, FiDownload } from 'react-icons/fi';
import { FaMosque } from 'react-icons/fa6';

export const InstallPromptScreen = ({ onComplete }) => {
    const { installPrompt, installPwa } = useApp();
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        setIsIos(ios);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('has_dismissed_install', 'true');
        onComplete();
    };

    return (
        <div className="w-full h-full bg-[#05110d] flex flex-col relative overflow-hidden animate-fade-in z-[100]">
            
            {/* Ambient Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-dark/20 via-[#05110d] to-[#05110d] pointer-events-none opacity-60"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen"></div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 w-full max-w-md mx-auto">
                
                {/* App Icon / Logo Area */}
                <div className="w-32 h-32 rounded-3xl bg-forest border border-gold/20 flex items-center justify-center mb-8 relative shadow-[0_0_40px_rgba(201,168,76,0.15)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"></div>
                    <FaMosque className="text-6xl text-gold relative z-10 drop-shadow-[0_0_15px_rgba(201,168,76,0.5)]" />
                </div>

                {/* Main Text */}
                <h1 className="font-display text-3xl text-cream text-center mb-4 tracking-wide leading-tight">
                    Install <span className="text-gold block mt-1">Noorbakhshia 365</span>
                </h1>
                
                <p className="text-sage text-center text-sm font-light leading-relaxed mb-10 max-w-[280px]">
                    Get the full experience. Install the app to your home screen for instant access, offline reading, and a flawless full-screen view.
                </p>

                {/* Conditional Action Buttons based on Platform */}
                <div className="w-full space-y-4">
                    {isIos ? (
                        <div className="w-full bg-emerald-dark/50 border border-gold/20 rounded-2xl p-6 mb-6">
                            <h3 className="text-gold text-xs font-display uppercase tracking-widest text-center mb-4">How to install on iOS</h3>
                            <div className="flex flex-col gap-4 text-sm text-cream font-light">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center shrink-0 border border-cream/10">
                                        <FiShare className="text-sage" />
                                    </div>
                                    <p>Tap the <strong className="text-white">Share</strong> button in Safari's bottom menu bar.</p>
                                </div>
                                <div className="w-px h-4 bg-gold/20 ms-4"></div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center shrink-0 border border-cream/10">
                                        <FiPlusSquare className="text-sage" />
                                    </div>
                                    <p>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={async () => {
                                const outcome = await installPwa();
                                if (outcome === 'accepted') {
                                    onComplete();
                                }
                            }}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-display text-sm uppercase tracking-widest transition-all duration-300
                                ${installPrompt 
                                    ? 'bg-gold text-[#05110d] hover:bg-gold/90 shadow-[0_0_20px_rgba(201,168,76,0.3)]' 
                                    : 'bg-emerald-dark border border-cream/10 text-sage opacity-50 cursor-not-allowed'
                                }`}
                            disabled={!installPrompt}
                        >
                            <FiDownload className="text-lg" />
                            {installPrompt ? 'Install Application' : 'Installation Not Supported'}
                        </button>
                    )}

                    <button 
                        onClick={handleDismiss}
                        className="w-full py-4 rounded-xl flex items-center justify-center font-display text-xs uppercase tracking-widest text-sage/70 hover:text-cream transition-colors"
                    >
                        Not Now, Continue in Browser
                    </button>
                </div>

            </div>
        </div>
    );
};
