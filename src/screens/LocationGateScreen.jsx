import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FaLocationDot } from 'react-icons/fa6';

export const LocationGateScreen = () => {
    const { requestLocation, locationDenied } = useApp();
    const [tapped, setTapped] = useState(false);

    const handleEnable = () => {
        setTapped(true);
        requestLocation();
        // If the browser permanently blocked, the prompt won't appear.
        // After a short delay, if we're still denied, show the manual instructions.
        setTimeout(() => setTapped(false), 3000);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center px-8 bg-[#05110d] relative overflow-hidden">
            
            {/* Subtle radial glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>

            {/* Animated Location Pin */}
            <div className="relative mb-8 animate-fade-down">
                <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center relative">
                    <FaLocationDot className="text-gold text-4xl animate-float" />
                    {/* Ping ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping opacity-30"></div>
                </div>
            </div>

            {/* Heading */}
            <h1 className="font-display text-3xl text-cream tracking-wide text-center mb-3 animate-fade-up">
                Location Required
            </h1>

            {/* Explanation */}
            <p className="text-sage text-sm text-center leading-relaxed max-w-[280px] mb-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
                Noorbakhshia 365 needs your location to calculate accurate prayer times for your area. Please enable location services to continue.
            </p>

            {/* CTA Button */}
            <button
                onClick={handleEnable}
                disabled={tapped}
                className="group relative rounded-full bg-gold text-[#05110d] font-display text-sm uppercase tracking-[0.2em] px-8 py-4 flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold/90 active:scale-[0.97] disabled:opacity-60 animate-fade-up shadow-[0_0_30px_rgba(201,168,76,0.3)]"
                style={{ animationDelay: '200ms' }}
            >
                <FaLocationDot className="text-lg" />
                <span>{tapped ? 'Requesting...' : 'Enable Location'}</span>
            </button>

            {/* Permanently blocked hint */}
            {locationDenied && !tapped && (
                <div className="mt-8 max-w-[300px] text-center animate-fade-up">
                    <p className="text-sage/70 text-xs leading-relaxed">
                        If the prompt doesn't appear, location may be blocked in your browser settings. 
                        Please go to <span className="text-cream/90 font-bold">Site Settings → Location</span> and 
                        set it to <span className="text-gold font-bold">Allow</span>, then reload the app.
                    </p>
                </div>
            )}
        </div>
    );
};
