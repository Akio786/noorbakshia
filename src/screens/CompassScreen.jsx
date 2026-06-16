import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../AppContext';
import { GiCompass } from 'react-icons/gi';
import { FaKaaba } from 'react-icons/fa6';
import { FiCheckCircle } from 'react-icons/fi';

const MECCA_LAT = 21.422487;
const MECCA_LONG = 39.826206;

function calculateQibla(latitude, longitude) {
    const PI = Math.PI;
    const latk = MECCA_LAT * (PI / 180.0);
    const longk = MECCA_LONG * (PI / 180.0);
    const phi = latitude * (PI / 180.0);
    const lambda = longitude * (PI / 180.0);
    
    const y = Math.sin(longk - lambda);
    const x = Math.cos(phi) * Math.tan(latk) - Math.sin(phi) * Math.cos(longk - lambda);
    let qibla = Math.atan2(y, x) * (180.0 / PI);
    
    return (qibla + 360.0) % 360.0;
}

export const CompassScreen = ({ setTab }) => {
    const { locationCoords, locationError } = useApp();
    const [heading, setHeading] = useState(0);
    const [qiblaAngle, setQiblaAngle] = useState(null);
    const [isPointing, setIsPointing] = useState(false);
    
    const [hasPermission, setHasPermission] = useState(false);
    const [permissionError, setPermissionError] = useState(null);
    
    // Detect if we need an explicit user gesture (iOS 13+)
    const needsPermissionButton = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';

    // 1. Calculate Qibla based on Global Location
    useEffect(() => {
        if (locationCoords) {
            setQiblaAngle(calculateQibla(locationCoords.lat, locationCoords.lng));
        }
    }, [locationCoords]);

    // 2. iOS Manual Permission Request
    const requestCompassPermission = async () => {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                setHasPermission(true);
                setPermissionError(null);
            } else {
                setPermissionError("Compass access denied.");
            }
        } catch (error) {
            setPermissionError("Compass not supported on this device.");
        }
    };

    const [isAbsolute, setIsAbsolute] = useState(true);

    // 3. Compass Tracking Logic
    useEffect(() => {
        // If it requires a button click and we don't have permission yet, wait.
        if (needsPermissionButton && !hasPermission) return;

        let absoluteReceived = false;

        const handleOrientation = (e) => {
            let h;
            
            // iOS uses webkitCompassHeading
            if (e.webkitCompassHeading !== undefined) {
                h = e.webkitCompassHeading;
                absoluteReceived = true;
            } 
            // Android uses alpha
            else if (e.alpha !== null) {
                if (e.type === 'deviceorientationabsolute' || e.absolute === true) {
                    absoluteReceived = true;
                    h = (360 - e.alpha) % 360;
                } else if (!absoluteReceived) {
                    // Only fallback to relative if we haven't seen an absolute event
                    h = (360 - e.alpha) % 360;
                }
            }

            if (h !== undefined) {
                // Adjust for screen orientation
                const orientationOffset = window.screen?.orientation?.angle || window.orientation || 0;
                h = (h + orientationOffset) % 360;
                if (h < 0) h += 360;
                
                setHeading(h);
            }
        };

        window.addEventListener('deviceorientationabsolute', handleOrientation);
        window.addEventListener('deviceorientation', handleOrientation);

        // Check if we didn't receive an absolute event after 3 seconds
        const timeoutId = setTimeout(() => {
            if (!absoluteReceived) {
                setIsAbsolute(false);
            }
        }, 3000);

        return () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation);
            window.removeEventListener('deviceorientation', handleOrientation);
            clearTimeout(timeoutId);
        };
    }, [needsPermissionButton, hasPermission]);

    // 4. Glow / Vibration Effect
    useEffect(() => {
        if (qiblaAngle !== null) {
            const diff = Math.abs(heading - qiblaAngle);
            const isMatch = diff < 5 || diff > 355;
            
            if (isMatch && !isPointing) {
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate([100, 50, 100]);
                }
                setIsPointing(true);
            } else if (!isMatch) {
                setIsPointing(false);
            }
        }
    }, [heading, qiblaAngle, isPointing]);

    const dialRotation = -heading;
    const needleRotation = qiblaAngle !== null ? (qiblaAngle - heading) : 0;

    const isCompassReady = (!needsPermissionButton || hasPermission) && locationCoords !== null;

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 py-12 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative">
            {/* Header Sticky (Fade Mask) */}
            <div className="w-full sticky top-0 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent -mx-6 px-6 pt-0 pb-8 mb-4">
                <div className="w-full flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <GiCompass className="text-gold text-2xl" />
                        <h2 className="font-display text-2xl text-cream tracking-wide">Qibla</h2>
                    </div>
                </div>
            </div>

            {/* Compass Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-up anim-delay-200 z-10">
                {!isCompassReady ? (
                    <div className="text-center p-8 bg-emerald-dark/50 rounded-3xl border border-gold/10 w-full max-w-xs">
                        <GiCompass className="text-6xl text-gold mb-4 animate-pulse mx-auto" />
                        
                        {locationError ? (
                            <p className="text-rose-400 text-sm">Location Access Denied. Cannot calculate Qibla.</p>
                        ) : !locationCoords ? (
                            <p className="text-sage text-sm">Acquiring GPS Signal...</p>
                        ) : permissionError ? (
                            <p className="text-rose-400 text-sm">{permissionError}</p>
                        ) : (
                            <p className="text-sage text-sm mb-6">Calibrate Compass to find Qibla direction.</p>
                        )}

                        {needsPermissionButton && !hasPermission && locationCoords && (
                            <button 
                                onClick={requestCompassPermission} 
                                className="px-6 py-3 rounded-full border border-gold text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-forest transition-colors shadow-[0_0_15px_rgba(201,168,76,0.2)]"
                            >
                                Calibrate Compass
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="relative flex flex-col items-center">
                        
                        {/* Glow effect when aligned */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gold/20 blur-[50px] transition-opacity duration-1000 ${isPointing ? 'opacity-100' : 'opacity-0'}`}></div>

                        <div className="w-72 h-72 rounded-full bg-emerald-dark ring-1 ring-cream/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(201,168,76,0.1)] flex items-center justify-center relative overflow-hidden">
                            
                            {/* Inner Bezel */}
                            <div className="absolute inset-2 rounded-full border border-forest bg-gradient-to-br from-emerald-mid to-[#081711] shadow-inner"></div>

                            {/* Compass Dial (N/S/E/W) */}
                            <div 
                                className="absolute inset-6 rounded-full transition-transform duration-100 ease-out"
                                style={{ transform: `rotate(${dialRotation}deg)` }}
                            >
                                <span className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-gold text-lg">N</span>
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-display text-sage text-sm">S</span>
                                <span className="absolute end-2 top-1/2 -translate-y-1/2 font-display text-sage text-sm">E</span>
                                <span className="absolute start-2 top-1/2 -translate-y-1/2 font-display text-sage text-sm">W</span>
                                {/* Notches */}
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 30}deg)` }}>
                                        <div className="mx-auto w-[1px] h-2 bg-cream/10 mt-6"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Qibla Needle */}
                            {qiblaAngle !== null && (
                                <div 
                                    className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
                                    style={{ transform: `rotate(${needleRotation}deg)` }}
                                >
                                    {/* The Kaaba Icon / Pointer */}
                                    <div className="absolute top-8 flex flex-col items-center">
                                        <FaKaaba className={`text-4xl transition-all duration-500 mb-1 z-10 ${isPointing ? 'text-gold drop-shadow-[0_0_15px_rgba(201,168,76,0.8)] scale-110' : 'text-gold/30'}`} />
                                        <div className={`w-0.5 h-16 bg-gradient-to-b ${isPointing ? 'from-gold' : 'from-gold/50'} to-transparent transition-colors duration-500`}></div>
                                    </div>
                                </div>
                            )}

                            {/* Center Pivot */}
                            <div className={`w-4 h-4 rounded-full bg-forest border-2 ${isPointing ? 'border-gold' : 'border-cream/20'} z-10 shadow-lg transition-colors duration-500`}></div>
                        </div>

                        {/* Status Text */}
                        <div className="mt-12 text-center">
                            <p className="font-display text-4xl text-cream mb-2 transition-colors duration-500" style={{ color: isPointing ? '#C9A84C' : '#F5E6C8' }}>
                                {Math.round(heading)}°
                            </p>
                            <p className="text-cream text-xs tracking-widest uppercase flex items-center justify-center gap-2 mb-6">
                                Qibla is at {qiblaAngle ? Math.round(qiblaAngle) : '--'}°
                                {isPointing && <FiCheckCircle className="text-gold" />}
                            </p>

                            {!isAbsolute && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 max-w-xs mx-auto mb-4">
                                    <p className="text-rose-400 text-[11px] font-light leading-relaxed">Absolute compass not supported by this device. Point device straight ahead to align manually.</p>
                                </div>
                            )}

                            <p className="text-sage/60 text-[10px] uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                                If the compass seems inaccurate, wave your device in a figure-8 motion to calibrate it.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
