import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { FiNavigation } from 'react-icons/fi';
import { FaKaaba } from 'react-icons/fa6';

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

export const MiniQibla = () => {
    const { locationCoords, navigateTo } = useApp();
    const [heading, setHeading] = useState(0);
    const [qiblaAngle, setQiblaAngle] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    
    const needsPermissionButton = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';

    useEffect(() => {
        if (locationCoords) {
            setQiblaAngle(calculateQibla(locationCoords.lat, locationCoords.lng));
        }
    }, [locationCoords]);

    useEffect(() => {
        // If iOS and no permission yet, wait for manual trigger. 
        // For Android or browsers that don't need requestPermission, this will just bind.
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

        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);

        return () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [hasPermission, needsPermissionButton]);

    const handleClick = async () => {
        if (needsPermissionButton && !hasPermission) {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    setHasPermission(true);
                } else {
                    // If denied, fallback to navigating directly to compass screen
                    navigateTo('compass');
                }
            } catch (error) {
                navigateTo('compass');
            }
        } else {
            navigateTo('compass');
        }
    };

    // Calculate how much the needle should rotate
    const needleRotation = qiblaAngle !== null ? (qiblaAngle - heading) : 0;
    
    // Check if the user is pointing close to the Kaaba
    const diff = Math.abs(heading - qiblaAngle);
    const isMatch = qiblaAngle !== null && (diff < 5 || diff > 355);

    return (
        <div 
            onClick={handleClick}
            className="flex flex-col items-center justify-center cursor-pointer group"
        >
            <div className="relative w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                {/* Static Ring */}
                <div className="absolute inset-0 rounded-full border-[1.5px] border-cream/20"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2.5 bg-gold rounded-full shadow-[0_0_8px_rgba(201,168,76,0.6)]"></div>

                {/* Rotating Needle */}
                <div 
                    className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-100 ease-out"
                    style={{ transform: `rotate(${needleRotation}deg)` }}
                >
                    {isMatch && hasPermission ? (
                        <FaKaaba className="text-gold text-[32px] animate-pulse drop-shadow-[0_0_8px_rgba(201,168,76,0.8)]" />
                    ) : (
                        <FiNavigation className="text-cream text-3xl fill-cream/20 -rotate-45" />
                    )}
                </div>
            </div>
        </div>
    );
};
