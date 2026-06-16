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

    useEffect(() => {
        const fetchLocation = () => {
            if (!('geolocation' in navigator)) {
                setLocationName('LOCATION OFF');
                setLocationError(true);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Simple check if moved significantly (approx ~1km) to avoid spamming API
                    // Or if we don't have a cached string
                    const latDiff = locationCoords ? Math.abs(locationCoords.lat - latitude) : 1;
                    const lngDiff = locationCoords ? Math.abs(locationCoords.lng - longitude) : 1;
                    
                    if (latDiff > 0.01 || lngDiff > 0.01 || locationName === 'Locating...' || locationName === 'LOCATION OFF') {
                        try {
                            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                            if (!res.ok) throw new Error('Geocoding failed');
                            const data = await res.json();
                            
                            const newLocationName = `${data.city || data.locality || 'Unknown'}, ${data.countryCode || 'XX'}`;
                            
                            setLocationName(newLocationName.toUpperCase());
                            setLocationCoords({ lat: latitude, lng: longitude });
                            setLocationError(false);
                            
                            localStorage.setItem('location_name', newLocationName.toUpperCase());
                            localStorage.setItem('location_coords', JSON.stringify({ lat: latitude, lng: longitude }));
                        } catch (err) {
                            console.error("Geocoding API error:", err);
                            // Keep cached locationName if we have one, otherwise error
                            if (locationName === 'Locating...') {
                                setLocationName('LOCATION ERROR');
                                setLocationError(true);
                            }
                        }
                    }
                },
                (error) => {
                    console.error("GPS Error:", error);
                    setLocationName('LOCATION OFF');
                    setLocationError(true);
                },
                { timeout: 10000, maximumAge: 60000 }
            );
        };

        fetchLocation();
    }, []);

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
