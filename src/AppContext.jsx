import React, { createContext, useContext, useState, useEffect, useCallback, startTransition } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currentTab, setCurrentTab] = useState('home');
    const [tabHistory, setTabHistory] = useState(['home']);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSearchOpen, setSearchOpen] = useState(false);
    
    // Moon sighting adjustment
    const [hijriOffset, setHijriOffset] = useState(() => {
        const saved = localStorage.getItem('hijri_offset');
        if (!saved) return 0;
        const parsed = parseInt(saved, 10);
        return isNaN(parsed) ? 0 : parsed;
    });

    const updateHijriOffset = (newOffset) => {
        setHijriOffset(newOffset);
        localStorage.setItem('hijri_offset', newOffset.toString());
    };

    // Geolocation Global State
    const [locationName, setLocationName] = useState(() => localStorage.getItem('location_name') || 'Locating...');
    const [locationCoords, setLocationCoords] = useState(() => {
        const saved = localStorage.getItem('location_coords');
        return saved ? JSON.parse(saved) : null;
    });
    const [locationError, setLocationError] = useState(false);
    const [locationGranted, setLocationGranted] = useState(false);
    const [locationDenied, setLocationDenied] = useState(false);

    // Ref to track last geocoded coords (avoids stale closure in watchPosition callback)
    const lastGeocodedRef = React.useRef(null);
    const watchIdRef = React.useRef(null);

    const startWatching = useCallback(() => {
        if (!('geolocation' in navigator)) {
            setLocationName('LOCATION OFF');
            setLocationError(true);
            setLocationDenied(true);
            return;
        }

        // Clear any existing watcher before starting a new one
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                setLocationGranted(true);
                setLocationDenied(false);
                setLocationError(false);

                // Check if moved significantly (~1km) to avoid spamming geocoding API
                const last = lastGeocodedRef.current;
                const latDiff = last ? Math.abs(last.lat - latitude) : 1;
                const lngDiff = last ? Math.abs(last.lng - longitude) : 1;
                const currentName = localStorage.getItem('location_name') || 'Locating...';

                if (latDiff > 0.01 || lngDiff > 0.01 || currentName === 'Locating...' || currentName === 'LOCATION OFF') {
                    // Update coords immediately (prayer times don't need city name)
                    setLocationCoords({ lat: latitude, lng: longitude });
                    localStorage.setItem('location_coords', JSON.stringify({ lat: latitude, lng: longitude }));
                    lastGeocodedRef.current = { lat: latitude, lng: longitude };

                    try {
                        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                        if (!res.ok) throw new Error('Geocoding failed');
                        const data = await res.json();
                        
                        const newLocationName = `${data.city || data.locality || 'Unknown'}, ${data.countryCode || 'XX'}`;
                        
                        setLocationName(newLocationName.toUpperCase());
                        localStorage.setItem('location_name', newLocationName.toUpperCase());
                    } catch (err) {
                        console.error("Geocoding API error:", err);
                        if (currentName === 'Locating...') {
                            setLocationName('LOCATION ERROR');
                        }
                    }
                } else {
                    // Minor movement — just update raw coords for prayer accuracy
                    setLocationCoords({ lat: latitude, lng: longitude });
                    localStorage.setItem('location_coords', JSON.stringify({ lat: latitude, lng: longitude }));
                }
            },
            (error) => {
                console.error("GPS Error:", error);
                if (error.code === 1) {
                    // PERMISSION_DENIED
                    setLocationDenied(true);
                    setLocationGranted(false);
                    setLocationName('LOCATION OFF');
                    setLocationError(true);
                } else if (error.code === 2) {
                    // POSITION_UNAVAILABLE
                    setLocationDenied(true);
                    setLocationGranted(false);
                    setLocationName('LOCATION OFF');
                    setLocationError(true);
                } else {
                    // TIMEOUT — don't mark as denied, just error
                    setLocationError(true);
                    setLocationName('LOCATION OFF');
                }
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
    }, []);

    // Callable from gate screen or settings to re-trigger permission
    const requestLocation = useCallback(() => {
        startWatching();
    }, [startWatching]);

    useEffect(() => {
        startWatching();

        // Listen for permission changes via Permissions API (mid-session revocation)
        let permissionStatus = null;
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((status) => {
                permissionStatus = status;
                const handleChange = () => {
                    if (status.state === 'denied') {
                        setLocationDenied(true);
                        setLocationGranted(false);
                        setLocationName('LOCATION OFF');
                        setLocationError(true);
                    } else if (status.state === 'granted') {
                        setLocationDenied(false);
                        startWatching();
                    }
                };
                status.addEventListener('change', handleChange);
            }).catch(() => {
                // Permissions API not supported — watchPosition alone handles it
            });
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [startWatching]);

    const MAIN_TABS = ['home', 'calendar', 'library', 'compass', 'tasbeeh', 'profile'];
    
    // Setup initial history state
    useEffect(() => {
        if (!window.history.state) {
            window.history.replaceState({ tab: 'home' }, '', window.location.pathname);
        }
        // Prevent the browser from auto-restoring scroll position on history navigation
        // This eliminates the "flash to top" when pressing the back button inside a reader
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }, []);

    // Listen to Hardware Back Button / Browser Back
    useEffect(() => {
        const handlePopState = (event) => {
            startTransition(() => {
                const poppedTab = event.state?.tab || 'home';
                
                setTabHistory(prev => {
                    if (prev.length > 1) {
                        const newHistory = [...prev];
                        newHistory.pop(); // Remove the current one
                        setCurrentTab(newHistory[newHistory.length - 1]);
                        return newHistory;
                    }
                    setCurrentTab('home');
                    return ['home'];
                });
                
                // If the search was open, close it on back
                setSearchOpen(false);
            });
        };
        
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Global navigation function
    const navigateTo = useCallback((tab, params = {}) => {
        if (params.book) {
            setSelectedBook(params.book);
        }
        
        if (MAIN_TABS.includes(tab)) {
            setTabHistory([tab]);
            window.history.pushState({ tab }, '', window.location.pathname);
        } else {
            setTabHistory(prev => [...prev, tab]);
            window.history.pushState({ tab }, '', window.location.pathname);
        }
        
        startTransition(() => {
            setCurrentTab(tab);
        });
    }, [MAIN_TABS]);

    // Global go back function
    const goBack = useCallback(() => {
        // If search is open, just close it
        if (isSearchOpen) {
            setSearchOpen(false);
            return;
        }

        // Trigger native browser back, which will fire popstate
        if (tabHistory.length > 1) {
            window.history.back();
        } else {
            setCurrentTab('home');
            setTabHistory(['home']);
        }
    }, [isSearchOpen, tabHistory.length]);

    // PWA Installation state
    const [installPrompt, setInstallPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const installPwa = async () => {
        if (!installPrompt) return null;
        // Show the install prompt
        installPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
        return outcome;
    };

    const value = {
        currentTab,
        selectedBook,
        isSearchOpen,
        setSearchOpen,
        hijriOffset,
        updateHijriOffset,
        navigateTo,
        goBack,
        locationName,
        locationError,
        locationCoords,
        locationGranted,
        locationDenied,
        requestLocation,
        installPrompt,
        installPwa
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
