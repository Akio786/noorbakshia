import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../AppContext';
import { useStore } from '../store/useStore';
import { quranService } from '../services/quranService';
import { FiArrowLeft, FiSettings, FiLoader, FiAlertTriangle, FiX, FiChevronUp, FiChevronDown, FiChevronsUp, FiChevronsDown, FiCopy, FiShare2, FiCheck } from 'react-icons/fi';
import { FaPalette, FaCircleCheck, FaBookmark, FaRegBookmark } from 'react-icons/fa6';

export const QuranReader = ({ setTab, selectedBook }) => {
    const { goBack } = useApp();
    const { bookmarks, addBookmark, removeBookmark, updateReadHistory, quranSettings, updateQuranSettings } = useStore();
    
    const readType = selectedBook?.readType || 'surah'; // 'surah' or 'juz'
    const maxId = readType === 'surah' ? 114 : 30;

    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSoftLoading, setIsSoftLoading] = useState(false);
    const [error, setError] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [legendOpen, setLegendOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    
    // Tracking scroll
    const [nextIdToFetch, setNextIdToFetch] = useState(selectedBook?.id);
    const [activeBlockId, setActiveBlockId] = useState(selectedBook?.id);
    const [activeBlockTitle, setActiveBlockTitle] = useState(selectedBook?.title || 'Loading...');
    const [activeVerseId, setActiveVerseId] = useState(selectedBook?.lastVerseId || null);

    const loaderRef = useRef(null);
    const blockRefs = useRef({}); // Store refs to each block container
    const hasScrolled = useRef(false);

    // Pill State
    const [navDirection, setNavDirection] = useState('down');
    const [isNavVisible, setIsNavVisible] = useState(true);
    const scrollTimeoutRef = useRef(null);
    const lastScrollY = useRef(0);

    // Actions
    const handleCopy = async (id, text, translation) => {
        const cleanText = quranService.stripTajweed(text);
        const content = `${cleanText}\n\n${translation}`;
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleShare = async (title, text, translation) => {
        const cleanText = quranService.stripTajweed(text);
        const content = `${title}\n\n${cleanText}\n\n${translation}\n\n- Noorbakhshia 365`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: content,
                });
            } catch (err) {
                console.log('Error sharing', err);
            }
        }
    };

    // Reset state when selectedBook completely changes (e.g., jump via bookmark)
    useEffect(() => {
        setBlocks([]);
        setNextIdToFetch(selectedBook?.id);
        setActiveBlockId(selectedBook?.id);
        setActiveBlockTitle(selectedBook?.title || 'Loading...');
        hasScrolled.current = false;
        window.scrollTo(0, 0);
    }, [selectedBook?.id, selectedBook?.readType]);

    // Fetch Block Logic
    const fetchBlock = useCallback(async (id, isSoft = false) => {
        if (!id || id > maxId) return;
        
        if (!isSoft && blocks.length === 0) setIsLoading(true);
        if (isSoft) setIsSoftLoading(true);

        try {
            const data = readType === 'juz' 
                ? await quranService.getJuz(id, quranSettings.translationLanguage)
                : await quranService.getSurah(id, quranSettings.translationLanguage);
            
            // Only update history on the initial block load
            if (blocks.length === 0 && id === selectedBook?.id) {
                updateReadHistory({
                    id: id,
                    type: 'quran',
                    readType: readType,
                    title: readType === 'juz' ? `Juz ${id}` : data.englishName,
                    subtitle: readType === 'juz' ? `Juz ${id}` : `Surah ${data.number}`,
                    progress: 'Reading...'
                });
            }

            setBlocks(prev => {
                // If language switch (soft load), replace all blocks with new language.
                // For simplicity, we just clear and reload the active block if language changes.
                if (isSoft) return [{ id, data }]; 
                // Prevent duplicate blocks
                if (prev.some(b => b.id === id)) return prev;
                return [...prev, { id, data }];
            });

            setNextIdToFetch(id + 1);
            setIsLoading(false);
            setIsSoftLoading(false);
        } catch (err) {
            setError(`Failed to load ${readType} ${id}.`);
            setIsLoading(false);
            setIsSoftLoading(false);
        }
    }, [readType, maxId, quranSettings.translationLanguage, blocks.length, selectedBook?.id, updateReadHistory]);

    // Initial Load
    useEffect(() => {
        if (blocks.length === 0 && nextIdToFetch === selectedBook?.id) {
            fetchBlock(selectedBook?.id);
        }
    }, [blocks.length, nextIdToFetch, selectedBook?.id, fetchBlock]);

    // Handle Pagination
    const handleNextChapter = () => {
        if (activeBlockId < maxId) {
            const nextIdx = activeBlockId + 1;
            setBlocks([]);
            setActiveBlockId(nextIdx);
            setNextIdToFetch(nextIdx);
            fetchBlock(nextIdx);
            document.getElementById('quran-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevChapter = () => {
        if (activeBlockId > 1) {
            const prevIdx = activeBlockId - 1;
            setBlocks([]);
            setActiveBlockId(prevIdx);
            setNextIdToFetch(prevIdx);
            fetchBlock(prevIdx);
            document.getElementById('quran-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
        document.getElementById('quran-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        const container = document.getElementById('quran-scroll-container');
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
    };

    // Language Change Hook
    useEffect(() => {
        // If language changes, reload just the currently active block
        if (blocks.length > 0) {
            setNextIdToFetch(activeBlockId); // reset fetcher
            fetchBlock(activeBlockId, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quranSettings.translationLanguage]);

    // Infinite Scroll Intersection Observer - Disabled for Pagination
    useEffect(() => {
        return; // Disabled in favor of Pagination Pill
        /*
        if (isLoading || isSoftLoading || nextIdToFetch > maxId) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchBlock(nextIdToFetch);
            }
        }, { rootMargin: '300px' });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
        */
    }, [isLoading, isSoftLoading, nextIdToFetch, maxId, fetchBlock]);

    // Active Block Observer (Sticky Header Sync)
    useEffect(() => {
        const blockObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If the block is intersecting the top half of the screen, it's active
                if (entry.isIntersecting) {
                    const id = parseInt(entry.target.getAttribute('data-id'));
                    const title = entry.target.getAttribute('data-title');
                    setActiveBlockId(id);
                    setActiveBlockTitle(title);
                }
            });
        }, { 
            // The rootMargin creates a detection window at the top of the screen
            // Top: -10% (ignore very top edge), Bottom: -60% (ignore bottom half)
            rootMargin: '-10% 0px -60% 0px' 
        });

        Object.values(blockRefs.current).forEach(node => {
            if (node) blockObserver.observe(node);
        });

        return () => blockObserver.disconnect();
    }, [blocks]); // Re-bind when blocks change

    // Handle Deep Linking to Ayah — explicit scrollTop on container, reliable in nested scrollable divs
    useEffect(() => {
        if (!selectedBook?.lastVerseId || blocks.length === 0 || hasScrolled.current) return;

        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            const element = document.getElementById(`ayah-global-${selectedBook.lastVerseId}`);
            const container = document.getElementById('quran-scroll-container');
            if (element && container) {
                // Double rAF ensures DOM is fully painted before we measure
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const elementRect = element.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        const scrollOffset = elementRect.top - containerRect.top + container.scrollTop - (container.clientHeight / 4);
                        container.scrollTo({ top: scrollOffset, behavior: 'smooth' });
                        hasScrolled.current = true;
                    });
                });
                clearInterval(interval);
            } else if (attempts >= 30) {
                // Give up after 3 seconds
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [selectedBook, blocks]);

    // Scroll tracker to monitor topmost visible Ayah and save history — guarded during resume-scroll
    useEffect(() => {
        let scrollTimeout;
        const scrollContainer = document.getElementById('quran-scroll-container');
        
        const handleScroll = () => {
            // Don't record history if we're still auto-scrolling to a resume position
            if (!hasScrolled.current && selectedBook?.lastVerseId) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const ayahNodes = document.querySelectorAll('.ayah-container');
                for (let i = 0; i < ayahNodes.length; i++) {
                    const rect = ayahNodes[i].getBoundingClientRect();
                    // Consider it active if it's near the top
                    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                        const globalVerseNumber = ayahNodes[i].getAttribute('data-global-verse');
                        const ayahNumber = ayahNodes[i].getAttribute('data-ayah-number');
                        const surahName = ayahNodes[i].getAttribute('data-surah-name');
                        
                        setActiveVerseId(globalVerseNumber);
                        
                        // Save exact position to history
                        updateReadHistory({
                            id: activeBlockId, // Always use activeBlockId to handle natural scrolling into next surah
                            type: 'quran',
                            readType: readType,
                            title: readType === 'juz' ? `Juz ${activeBlockId}` : surahName,
                            subtitle: `Ayah ${ayahNumber}`,
                            progress: 'Reading...',
                            lastVerseId: globalVerseNumber
                        });
                        break; // Stop after finding the topmost visible Ayah
                    }
                }
            }, 1000); // 1s debounce
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [activeBlockId, readType, updateReadHistory, selectedBook?.lastVerseId]);

    // Pill Scroll Tracking
    useEffect(() => {
        const scrollContainer = document.getElementById('quran-scroll-container');
        if (!scrollContainer) return;

        const handlePillScroll = () => {
            const currentScrollY = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;
            
            // Determine direction
            if (currentScrollY === 0) {
                setNavDirection('up'); // Lock to Prev if at very top
            } else if (currentScrollY + clientHeight >= scrollHeight - 50) {
                setNavDirection('down'); // Lock to Next if at bottom
            } else if (currentScrollY > lastScrollY.current) {
                setNavDirection('down');
            } else if (currentScrollY < lastScrollY.current) {
                setNavDirection('up');
            }
            
            lastScrollY.current = currentScrollY;
        };

        scrollContainer.addEventListener('scroll', handlePillScroll, { passive: true });
        
        return () => {
            scrollContainer.removeEventListener('scroll', handlePillScroll);
        };
    }, [activeBlockId]);

    if (!selectedBook?.id) return null;

    const getBookmarkId = () => `quran-${readType}-${activeBlockId}`;
    const isBookmarked = bookmarks.some(b => b.bookId === getBookmarkId());
    
    const handleBookmark = () => {
        if (blocks.length === 0) return;
        if (isBookmarked) {
            const bm = bookmarks.find(b => b.bookId === getBookmarkId());
            if (bm) removeBookmark(bm.id);
        } else {
            addBookmark({
                type: 'Quran',
                bookId: getBookmarkId(),
                title: activeBlockTitle,
                preview: `${readType === 'juz' ? 'Juz' : 'Surah'} ${activeBlockId}`,
                tab: 'quran-reader',
                params: { book: { readType, id: activeBlockId, title: activeBlockTitle, lastVerseId: activeVerseId } }
            });
        }
    };

    const handleBookmarkPara = (blockId, globalId, previewText) => {
        const fullId = `quran-${readType}-${globalId}`;
        const isParaBookmarked = bookmarks.some(b => b.bookId === fullId);
        
        if (isParaBookmarked) {
            const bm = bookmarks.find(b => b.bookId === fullId);
            if (bm) removeBookmark(bm.id);
        } else {
            addBookmark({
                type: 'Quran Verse',
                bookId: fullId,
                title: activeBlockTitle,
                preview: previewText ? (previewText.substring(0, 80) + '...') : 'Bookmarked Verse',
                tab: 'quran-reader',
                params: { book: { readType, id: blockId, title: activeBlockTitle, lastVerseId: globalId } }
            });
        }
    };

    const isUrdu = quranSettings.translationLanguage.startsWith('ur');

    // Handle Back Navigation smoothly
    const handleGoBack = () => {
        // Clear massive block array first to prevent main thread blocking during unmount
        setBlocks([]);
        // Then trigger navigation
        setTimeout(goBack, 10);
    };

    return (
        <div id="quran-scroll-container" className="scroll-smooth w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative">
            
            {/* Header Sticky (Fade Mask) */}
            <div className="sticky top-0 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent self-stretch -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8">
                <div className="w-full flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <button onClick={handleGoBack} className="w-10 h-10 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all shadow-inner bg-emerald-dark">
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <h2 className="font-display text-xl text-cream tracking-wide truncate max-w-[150px] sm:max-w-[200px]">
                                {activeBlockTitle}
                            </h2>
                            <p className="text-sage text-[10px] tracking-widest uppercase">{readType === 'juz' ? 'Juz' : 'Surah'} {activeBlockId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setLegendOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-dark border border-cream/10 text-sage hover:text-gold transition-colors">
                            <FaPalette className="text-xl" />
                        </button>
                        <button onClick={() => setSettingsOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-dark border border-cream/10 text-sage hover:text-gold transition-colors">
                            <FiSettings className="text-xl" />
                        </button>
                        <button onClick={handleBookmark} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isBookmarked ? 'bg-gold/20 text-gold' : 'bg-emerald-dark border border-cream/10 text-sage hover:text-gold'}`}>
                            {isBookmarked ? <FaBookmark className="text-xl" /> : <FaRegBookmark className="text-xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full relative z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
                {isLoading && blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <FiLoader className="text-4xl text-gold animate-spin mb-4" />
                        <p className="font-display text-sage tracking-widest uppercase text-xs">Fetching...</p>
                    </div>
                ) : error && blocks.length === 0 ? (
                    <div className="text-center py-10 text-rose-400">
                        <FiAlertTriangle className="text-4xl mb-3 block mx-auto" />
                        <p className="font-display">{error}</p>
                    </div>
                ) : (
                    <div key={`content-${selectedBook?.id}`} className="space-y-16 animate-fade-up">
                        {blocks.map((block) => {
                            const isJuz = readType === 'juz';
                            const title = isJuz ? `Juz ${block.data.number}` : block.data.englishName;
                            
                            return (
                                <div 
                                    key={`block-${block.id}`} 
                                    data-id={block.id}
                                    data-title={title}
                                    ref={el => blockRefs.current[block.id] = el}
                                    className="block-container"
                                >
                                    {/* Block Main Header (if not injected later) */}
                                    {!isJuz && block.data.number !== 1 && block.data.number !== 9 && (
                                        <div className="text-center mb-12 border-b border-cream/5 pb-12 animate-fade-down">
                                            <img src="/assets/bismillah.svg" alt="Bismillah" className="h-20 md:h-24 mx-auto mb-4 invert opacity-90 drop-shadow-[0_0_15px_rgba(201,168,76,0.2)]" />
                                        </div>
                                    )}

                                    {/* Verses */}
                                    {block.data.ayahs.map((verse, index) => {
                                        // Detect Surah Boundary inside a Juz
                                        const isSurahBoundary = isJuz && (index === 0 || verse.surah.number !== block.data.ayahs[index - 1].surah.number);
                                        const globalId = verse.number;
                                        const isVerseBookmarked = bookmarks.some(b => b.bookId === `quran-${readType}-${globalId}`);
                                        const previewText = verse.translation || verse.text;
                                        
                                        return (
                                            <React.Fragment key={`ayah-${verse.numberInSurah || index}`}>
                                                
                                                {/* Injected Surah Boundary Header */}
                                                {isSurahBoundary && (
                                                    <div className="my-16 py-8 border-y border-gold/10 bg-emerald-dark/20 text-center rounded-3xl animate-fade-down">
                                                        <h3 className="font-display text-2xl text-gold mb-2">{verse.surah.englishName}</h3>
                                                        <p className="text-sage text-[10px] tracking-widest uppercase mb-6">Surah {verse.surah.number}</p>
                                                        {verse.surah.number !== 1 && verse.surah.number !== 9 && (
                                                            <img src="/assets/bismillah.svg" alt="Bismillah" className="h-16 md:h-20 mx-auto mt-4 invert opacity-90 drop-shadow-[0_0_15px_rgba(201,168,76,0.2)]" />
                                                        )}
                                                    </div>
                                                )}

                                                <div 
                                                    id={`ayah-global-${globalId}`}
                                                    data-global-verse={globalId}
                                                    data-ayah-number={verse.numberInSurah}
                                                    data-surah-name={verse.surah?.englishName || title}
                                                    className="ayah-container group mb-8 last:mb-0 transition-all duration-300 bg-[#071510] rounded-[2rem] p-6 md:p-8 shadow-sm border border-cream/5"
                                                >
                                                    {/* Content Area (Full Width) */}
                                                    <div className="flex flex-col gap-6">
                                                        {/* Arabic Text */}
                                                        {quranSettings.showArabic && (
                                                            <div className="w-full text-right" dir="rtl">
                                                                <p 
                                                                    className="font-indopak text-cream" 
                                                                    style={{ fontSize: `${quranSettings.arabicFontSize}px`, lineHeight: 2 }}
                                                                    dangerouslySetInnerHTML={{ __html: quranService.parseTajweed(verse.text) }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Translation Text */}
                                                        {quranSettings.showTranslation && (
                                                            <div 
                                                                className={`w-full ${isUrdu ? 'text-right' : 'text-left'} transition-opacity ${isSoftLoading ? 'opacity-30' : 'opacity-100'}`}
                                                                dir={isUrdu ? 'rtl' : 'ltr'}
                                                            >
                                                                {isSoftLoading && index === 0 && (
                                                                    <span className="text-xs text-gold animate-pulse mb-2 block">Switching language...</span>
                                                                )}
                                                                <p 
                                                                    className={`${isUrdu ? 'font-urdu leading-[2.5]' : 'font-body leading-relaxed'} font-light text-sage`}
                                                                    style={{ fontSize: `${quranSettings.translationFontSize}px` }}
                                                                >
                                                                    {verse.translation}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Footer Toolbar */}
                                                    <div className="mt-6 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {/* Actions Group */}
                                                        <div className="flex items-center gap-2">
                                                            {/* Bookmark */}
                                                            <button 
                                                                onClick={() => handleBookmarkPara(block.id, globalId, previewText)}
                                                                className="p-2 -ml-2 text-sage/40 hover:text-gold transition-colors flex items-center justify-center"
                                                            >
                                                                {isVerseBookmarked ? <FaBookmark className="text-lg text-gold" /> : <FaRegBookmark className="text-lg" />}
                                                            </button>

                                                            {/* Copy */}
                                                            <button 
                                                                onClick={() => handleCopy(globalId, verse.text, verse.translation)}
                                                                className="p-2 text-sage/40 hover:text-gold transition-colors flex items-center justify-center"
                                                                title="Copy text"
                                                            >
                                                                {copiedId === globalId ? <FiCheck className="text-lg text-emerald-400" /> : <FiCopy className="text-lg" />}
                                                            </button>

                                                            {/* Share (only if supported) */}
                                                            {navigator.share && (
                                                                <button 
                                                                    onClick={() => handleShare(title || verse.surah?.englishName, verse.text, verse.translation)}
                                                                    className="p-2 text-sage/40 hover:text-gold transition-colors flex items-center justify-center"
                                                                    title="Share"
                                                                >
                                                                    <FiShare2 className="text-lg" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Ayah/Para Badge */}
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gold/30 text-xs font-display text-gold bg-emerald-dark">
                                                            {verse.numberInSurah}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            );
                        })}

                        {/* Loading trigger for next chunk */}
                        {false && nextIdToFetch <= maxId && (
                            <div ref={loaderRef} className="py-20 flex justify-center">
                                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        
                        {activeBlockId === maxId && (
                            <div className="py-20 flex flex-col items-center opacity-50">
                                <FaCircleCheck className="text-gold text-3xl mb-2" />
                                <p className="font-display text-sage text-xs uppercase tracking-widest">End of Quran</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Navigation Pill */}
            {blocks.length > 0 && (
                <div 
                    className={`fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 transition-all duration-500 transform ${isNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                >
                    <div className="bg-[#0a1e16]/90 backdrop-blur-md border border-gold/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-full px-2 py-2 flex items-center gap-2">
                        {navDirection === 'down' ? (
                            <>
                                <button onClick={scrollToBottom} className="w-10 h-10 flex items-center justify-center rounded-full text-sage hover:bg-gold/10 hover:text-gold transition-colors" aria-label="Scroll to End">
                                    <FiChevronsDown className="text-xl" />
                                </button>
                                {activeBlockId < maxId && (
                                    <button onClick={handleNextChapter} className="h-10 px-4 flex items-center justify-center gap-2 rounded-full bg-gold text-emerald-dark hover:bg-cream transition-colors font-bold shadow-[0_0_15px_rgba(201,168,76,0.2)]" aria-label="Next Chapter">
                                        <span className="font-display tracking-widest text-[10px] uppercase">Next</span>
                                        <FiChevronDown className="text-lg" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                {activeBlockId > 1 && (
                                    <button onClick={handlePrevChapter} className="h-10 px-4 flex items-center justify-center gap-2 rounded-full bg-gold text-emerald-dark hover:bg-cream transition-colors font-bold shadow-[0_0_15px_rgba(201,168,76,0.2)]" aria-label="Previous Chapter">
                                        <FiChevronUp className="text-lg" />
                                        <span className="font-display tracking-widest text-[10px] uppercase">Prev</span>
                                    </button>
                                )}
                                <button onClick={scrollToTop} className="w-10 h-10 flex items-center justify-center rounded-full text-sage hover:bg-gold/10 hover:text-gold transition-colors" aria-label="Scroll to Top">
                                    <FiChevronsUp className="text-xl" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {settingsOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#05110d]/80" onClick={() => setSettingsOpen(false)}></div>
                    <div className="w-full max-w-md bg-[#0a1e16]/90 backdrop-blur-2xl border border-cream/10 rounded-[2rem] p-6 relative z-10 animate-fade-up shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-6 border-b border-cream/5 pb-4">
                            <h3 className="font-display text-xl text-cream">Reading Settings</h3>
                            <button onClick={() => setSettingsOpen(false)} className="text-sage hover:text-cream transition-colors">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Reading Mode Select */}
                        <div className="mb-6">
                            <label className="text-[10px] text-sage uppercase tracking-widest font-semibold mb-3 block">Reading Mode</label>
                            <div className="flex gap-2 p-1.5 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl border border-cream/5">
                                <button 
                                    onClick={() => updateQuranSettings({ showArabic: true, showTranslation: false })}
                                    className={`flex-1 py-2 rounded-xl text-[13px] transition-all duration-300 ${quranSettings.showArabic && !quranSettings.showTranslation ? 'bg-white/10 text-gold border border-gold/20 shadow-md' : 'text-sage hover:text-cream'}`}
                                >
                                    Arabic
                                </button>
                                <button 
                                    onClick={() => updateQuranSettings({ showArabic: true, showTranslation: true })}
                                    className={`flex-1 py-2 rounded-xl text-[13px] transition-all duration-300 ${quranSettings.showArabic && quranSettings.showTranslation ? 'bg-white/10 text-gold border border-gold/20 shadow-md' : 'text-sage hover:text-cream'}`}
                                >
                                    Both
                                </button>
                                <button 
                                    onClick={() => updateQuranSettings({ showArabic: false, showTranslation: true })}
                                    className={`flex-1 py-2 rounded-xl text-[13px] transition-all duration-300 ${!quranSettings.showArabic && quranSettings.showTranslation ? 'bg-white/10 text-gold border border-gold/20 shadow-md' : 'text-sage hover:text-cream'}`}
                                >
                                    Translation
                                </button>
                            </div>
                        </div>

                        {/* Translation Select */}
                        <div className="mb-8">
                            <label className="text-[10px] text-sage uppercase tracking-widest font-semibold mb-3 block">Translation Language</label>
                            <div className="flex gap-2 p-1.5 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl border border-cream/5">
                                <button 
                                    onClick={() => updateQuranSettings({ translationLanguage: 'en.sahih' })}
                                    className={`flex-1 py-2 rounded-xl text-sm transition-all duration-300 ${!isUrdu ? 'bg-white/10 text-gold border border-gold/20 shadow-md' : 'text-sage hover:text-cream'}`}
                                >
                                    English (Sahih)
                                </button>
                                <button 
                                    onClick={() => updateQuranSettings({ translationLanguage: 'ur.junagarhi' })}
                                    className={`flex-1 py-2 rounded-xl text-sm transition-all duration-300 ${isUrdu ? 'bg-white/10 text-gold border border-gold/20 shadow-md' : 'text-sage hover:text-cream'}`}
                                >
                                    Urdu (Junagarhi)
                                </button>
                            </div>
                        </div>

                        {/* Arabic Size Slider */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] text-sage uppercase tracking-widest font-semibold">Arabic Size</label>
                                <span className="text-xs text-gold">{quranSettings.arabicFontSize}px</span>
                            </div>
                            <div className="p-4 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl border border-cream/5">
                                <input 
                                    type="range" 
                                    min="20" max="64" 
                                    value={quranSettings.arabicFontSize}
                                    onChange={(e) => updateQuranSettings({ arabicFontSize: parseInt(e.target.value) })}
                                    className="w-full accent-gold h-1.5 bg-black/20 rounded-full appearance-none outline-none"
                                />
                            </div>
                        </div>

                        {/* Translation Size Slider */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] text-sage uppercase tracking-widest font-semibold">Translation Size</label>
                                <span className="text-xs text-gold">{quranSettings.translationFontSize}px</span>
                            </div>
                            <div className="p-4 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl border border-cream/5">
                                <input 
                                    type="range" 
                                    min="12" max="32" 
                                    value={quranSettings.translationFontSize}
                                    onChange={(e) => updateQuranSettings({ translationFontSize: parseInt(e.target.value) })}
                                    className="w-full accent-gold h-1.5 bg-black/20 rounded-full appearance-none outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tajweed Legend Modal */}
            {legendOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#05110d]/80" onClick={() => setLegendOpen(false)}></div>
                    <div className="w-full max-w-md bg-[#0a1e16]/90 backdrop-blur-2xl border border-cream/10 rounded-[2rem] p-6 relative z-10 animate-fade-up shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-6 border-b border-cream/5 pb-4">
                            <h3 className="font-display text-xl text-cream flex items-center gap-2">
                                <FaPalette className="text-gold" /> Tajweed Rules
                            </h3>
                            <button onClick={() => setLegendOpen(false)} className="text-sage hover:text-cream transition-colors">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 font-display">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5">
                                <span className="text-sage text-sm">Idgham</span>
                                <span className="tajweed-idgham font-indopak text-2xl">ي ر م ل و ن</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5">
                                <span className="text-sage text-sm">Ikhfa</span>
                                <span className="tajweed-ikhfa font-indopak text-2xl">ت ث ج د ذ...</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5">
                                <span className="text-sage text-sm">Ghunnah</span>
                                <span className="tajweed-ghunnah font-indopak text-2xl">نّ مّ</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5">
                                <span className="text-sage text-sm">Qalqalah</span>
                                <span className="tajweed-qalqalah font-indopak text-2xl">ق ط ب ج د</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5">
                                <span className="text-sage text-sm">Madd</span>
                                <span className="tajweed-madd font-indopak text-2xl">ـٓ</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cream/5">
                                <span className="text-sage text-sm">Qalb</span>
                                <span className="tajweed-qalb font-indopak text-2xl">ۢ</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
