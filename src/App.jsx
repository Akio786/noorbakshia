import React, { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useApp } from './AppContext';
import { useStore } from './store/useStore';
import { BottomNav } from './components/BottomNav';
import { DoubleBezelCard } from './components/DoubleBezelCard';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { SurahList } from './screens/SurahList';
import { QuranReader } from './screens/QuranReader';
import { AwradsScreen } from './screens/AwradsScreen';
import { TasbeehScreen } from './screens/TasbeehScreen';
import { CompassScreen } from './screens/CompassScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { BookReaderScreen } from './screens/BookReaderScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { BookTocScreen } from './screens/BookTocScreen';
import { SearchOverlay } from './screens/SearchOverlay';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { InstallPromptScreen } from './screens/InstallPromptScreen';
import { LocationGateScreen } from './screens/LocationGateScreen';

function App() {
  const { currentTab, navigateTo, selectedBook, locationGranted, locationDenied, locationCoords } = useApp();
  const { userName } = useStore();
  
  const hasSeenSplash = localStorage.getItem('has_seen_splash') === 'true';
  const hasDismissedInstall = localStorage.getItem('has_dismissed_install') === 'true';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  const [showSplash, setShowSplash] = useState(!hasSeenSplash);
  const [showInstallPrompt, setShowInstallPrompt] = useState(!isStandalone && !hasDismissedInstall);
  const [showOnboarding, setShowOnboarding] = useState(false);

  React.useEffect(() => {
    window.appNavigateTo = navigateTo;
  }, [navigateTo]);

  React.useEffect(() => {
    // If we skip splash, we need to trigger onboarding if necessary
    if (hasSeenSplash && !showInstallPrompt && !userName) {
        setShowOnboarding(true);
    }
  }, [hasSeenSplash, showInstallPrompt, userName]);

  if (showSplash) {
      return (
          <div className="device-frame">
              <SplashScreen onComplete={() => {
                  localStorage.setItem('has_seen_splash', 'true');
                  setShowSplash(false);
                  if (!showInstallPrompt && !userName) setShowOnboarding(true);
              }} />
          </div>
      );
  }

  if (showInstallPrompt) {
      return (
          <div className="device-frame bg-[#05110d]">
              <InstallPromptScreen onComplete={() => {
                  setShowInstallPrompt(false);
                  if (!userName) setShowOnboarding(true);
              }} />
          </div>
      );
  }

  if (showOnboarding) {
      return (
          <div className="device-frame bg-[#05110d]">
              <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
          </div>
      );
  }

  // Location Gate — block until GPS is available
  if (locationDenied || (!locationGranted && !locationCoords)) {
      return (
          <div className="device-frame bg-[#05110d]">
              <LocationGateScreen />
          </div>
      );
  }

  return (
      <ErrorBoundary>
          <div className="device-frame">
              {/* Main View Area */}
              <div className="w-full h-full relative overflow-hidden bg-[#05110d] animate-fade-in z-10">
                  {currentTab === 'home' && <HomeScreen setTab={navigateTo} />}
                  
                  {currentTab === 'quran' && <SurahList setTab={navigateTo} />}
                  {currentTab === 'quran-reader' && <QuranReader setTab={navigateTo} selectedBook={selectedBook} />}
                  
                  {currentTab === 'awrad' && <AwradsScreen setTab={navigateTo} setSelectedBook={(b) => navigateTo('book-reader', { book: b })} />}
                  {currentTab === 'tasbeeh' && <TasbeehScreen setTab={navigateTo} />}
                  {currentTab === 'compass' && <CompassScreen setTab={navigateTo} />}
                  
                  {currentTab === 'library' && <LibraryScreen setTab={navigateTo} setSelectedBook={(b) => navigateTo('book-toc', { book: b })} />}
                  {currentTab === 'book-toc' && <BookTocScreen setTab={navigateTo} selectedBook={selectedBook} />}
                  {currentTab === 'book-reader' && <BookReaderScreen setTab={navigateTo} selectedBook={selectedBook} />}
                  {currentTab === 'profile' && <ProfileScreen setTab={navigateTo} />}
                  {currentTab === 'settings' && <SettingsScreen setTab={navigateTo} />}
                  {currentTab === 'calendar' && <CalendarScreen setTab={navigateTo} />}
              </div>

              {/* Overlays */}
              <SearchOverlay />

              {/* Bottom Navigation */}
              <div className="absolute bottom-0 left-0 right-0 z-50">
                  <BottomNav currentTab={currentTab} setTab={navigateTo} />
              </div>
          </div>
      </ErrorBoundary>
  );
}

export default App;
