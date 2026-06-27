import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../AppContext';
import { GiCompass } from 'react-icons/gi';
import { FaKaaba } from 'react-icons/fa6';
import { FiCheckCircle } from 'react-icons/fi';
import { DoubleBezelCard } from '../components/DoubleBezelCard';

function getCardinalDirection(angle) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(angle / 45) % 8];
}

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
    const { locationCoords, locationError, locationName } = useApp();
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
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 py-12 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative gap-8">
            
            {/* Top Info */}
            <div className="w-full animate-fade-down z-10 mt-4 px-2">
                <h3 className="font-display text-cream text-[1.3rem] md:text-xl mb-1 drop-shadow-md flex items-center">
                    <span className="min-w-[5.5rem] whitespace-nowrap inline-block tabular-nums">{Math.round(heading)}° {getCardinalDirection(heading)}</span>
                    <span className="ml-1">from True North</span>
                </h3>
                <p className="text-sage text-sm truncate opacity-80">
                    {locationName || "Locating..."}
                </p>
            </div>

            {/* Middle Area: Compass */}
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-up anim-delay-100 z-10 my-4 min-h-[350px]">
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
                    <div className="relative flex flex-col items-center justify-center w-full max-w-[300px] aspect-square">
                        
                        {/* Static Top Notch */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[3px] h-8 bg-gold rounded-full z-20 shadow-[0_0_15px_rgba(201,168,76,0.4)]"></div>

                        {/* Dial Container */}
                        <div 
                            className="absolute inset-0 transition-transform duration-100 ease-out"
                            style={{ transform: `rotate(${dialRotation}deg)` }}
                        >
                            {/* Inner Crosshairs */}
                            <div className="absolute inset-12 rounded-full border border-cream/5"></div>
                            <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-px bg-cream/10"></div>
                            <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-px bg-cream/10"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cream/20 rounded-full border-2 border-[#05110d] z-10"></div>
                            
                            {/* Outer Ticks */}
                            {[...Array(36)].map((_, i) => {
                                const deg = i * 10;
                                const isMajor = deg % 20 === 0;
                                return (
                                    <div key={i} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
                                        <div className={`mx-auto w-[1.5px] rounded-full ${isMajor ? 'h-3 bg-cream/30' : 'h-1.5 bg-cream/10'}`}></div>
                                    </div>
                                );
                            })}
                            
                            {/* Numbers (Every 20 degrees, skipping Cardinals) */}
                            {[...Array(18)].map((_, i) => {
                                const deg = i * 20;
                                if (deg % 90 === 0) return null;
                                return (
                                    <div key={`num-${i}`} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
                                        <span className="absolute top-3.5 left-1/2 -translate-x-1/2 text-[9px] text-cream/40 font-mono">
                                            {deg}
                                        </span>
                                    </div>
                                );
                            })}

                            {/* Cardinal Points */}
                            <div className="absolute inset-0" style={{ transform: `rotate(0deg)` }}>
                                <span className="absolute top-7 left-1/2 -translate-x-1/2 font-display text-cream text-3xl font-bold">N</span>
                            </div>
                            <div className="absolute inset-0" style={{ transform: `rotate(90deg)` }}>
                                <span className="absolute top-7 left-1/2 -translate-x-1/2 font-display text-cream text-3xl font-bold">E</span>
                            </div>
                            <div className="absolute inset-0" style={{ transform: `rotate(180deg)` }}>
                                <span className="absolute top-7 left-1/2 -translate-x-1/2 font-display text-cream text-3xl font-bold">S</span>
                            </div>
                            <div className="absolute inset-0" style={{ transform: `rotate(270deg)` }}>
                                <span className="absolute top-7 left-1/2 -translate-x-1/2 font-display text-cream text-3xl font-bold">W</span>
                            </div>

                            {/* Intercardinal Points */}
                            <div className="absolute inset-0" style={{ transform: `rotate(45deg)` }}>
                                <span className="absolute top-10 left-1/2 -translate-x-1/2 font-display text-sage/30 text-[10px] font-bold tracking-widest">NE</span>
                            </div>
                            <div className="absolute inset-0" style={{ transform: `rotate(135deg)` }}>
                                <span className="absolute top-10 left-1/2 -translate-x-1/2 font-display text-sage/30 text-[10px] font-bold tracking-widest">SE</span>
                            </div>
                            <div className="absolute inset-0" style={{ transform: `rotate(225deg)` }}>
                                <span className="absolute top-10 left-1/2 -translate-x-1/2 font-display text-sage/30 text-[10px] font-bold tracking-widest">SW</span>
                            </div>
                            <div className="absolute inset-0" style={{ transform: `rotate(315deg)` }}>
                                <span className="absolute top-10 left-1/2 -translate-x-1/2 font-display text-sage/30 text-[10px] font-bold tracking-widest">NW</span>
                            </div>

                            {/* Kaaba Indicator */}
                            {qiblaAngle !== null && (
                                <div className="absolute inset-0 z-20 pointer-events-none" style={{ transform: `rotate(${qiblaAngle}deg)` }}>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-gold px-2 py-1.5 rounded-md shadow-[0_0_15px_rgba(201,168,76,0.6)]">
                                        <FaKaaba className="text-forest text-sm drop-shadow-md" />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Status / Calibration warning */}
                        {!isAbsolute && (
                            <div className="absolute -bottom-16 w-full text-center">
                                <p className="text-rose-400 text-[10px] font-light bg-rose-500/10 px-3 py-1 rounded-full inline-block border border-rose-500/20">Absolute compass not supported. Calibrate manually.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Info */}
            <div className="w-full animate-fade-up anim-delay-200 z-10 py-6">
                <div className="flex justify-between items-center w-full text-center divide-x divide-cream/10">
                    <div className="flex-1 flex flex-col justify-center px-2">
                        <span className="font-display text-cream text-[1.1rem] md:text-xl mb-1.5">{Math.round(heading)}° {getCardinalDirection(heading)}</span>
                        <span className="text-sage text-[9px] uppercase tracking-widest opacity-70">True north</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-2">
                        <span className="font-display text-cream text-[1.1rem] md:text-xl mb-1.5">{qiblaAngle ? Math.round(qiblaAngle) : '--'}°</span>
                        <span className="text-sage text-[9px] uppercase tracking-widest opacity-70">Kaaba</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
