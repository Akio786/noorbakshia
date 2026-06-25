import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FiMapPin, FiRefreshCw } from 'react-icons/fi';

export const LocationRequiredOverlay = () => {
    const { requestLocationAccess } = useApp();
    const [isChecking, setIsChecking] = useState(false);
    const [showSettingsHint, setShowSettingsHint] = useState(false);

    const handleRetry = async () => {
        setIsChecking(true);
        try {
            await requestLocationAccess();
        } catch (err) {
            console.error(err);
            // If it fails again, it means the user denied the prompt or GPS is off.
            setShowSettingsHint(true);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="absolute inset-0 z-[999] bg-[#05110d] flex flex-col items-center justify-center p-6 text-center animate-fade-up">
            <div className="w-24 h-24 bg-rose-400/10 rounded-full flex items-center justify-center mb-8 border border-rose-400/20">
                <FiMapPin className="text-4xl text-rose-400" />
            </div>
            
            <h1 className="font-display text-3xl text-cream mb-4">Location Access<br/>Required</h1>
            <p className="text-sage mb-8 max-w-sm">
                Accurate prayer times cannot be calculated without knowing your location. Please grant location permissions to continue.
            </p>

            <button 
                onClick={handleRetry}
                disabled={isChecking}
                className="bg-gold text-forest font-display font-bold text-lg px-8 py-4 rounded-full flex items-center gap-3 transition-all hover:bg-cream hover:shadow-[0_0_20px_rgba(245,230,200,0.2)] disabled:opacity-50"
            >
                {isChecking ? <FiRefreshCw className="animate-spin text-xl" /> : <FiMapPin className="text-xl" />}
                {isChecking ? 'Checking...' : 'Grant Permission'}
            </button>

            {showSettingsHint && (
                <div className="mt-8 p-4 bg-cream/5 border border-cream/10 rounded-2xl max-w-sm animate-fade-up">
                    <p className="text-xs text-sage/80 leading-relaxed text-left">
                        <strong className="text-cream block mb-1">Having trouble?</strong>
                        If you previously blocked location access, you need to manually re-enable it:
                        <br/><br/>
                        • <strong className="text-cream">iOS/Safari:</strong> Tap 'aA' in the URL bar &gt; Website Settings &gt; Allow Location.
                        <br/>
                        • <strong className="text-cream">Android/Chrome:</strong> Tap the lock icon in the URL bar &gt; Permissions &gt; Allow Location.
                    </p>
                </div>
            )}
        </div>
    );
};
