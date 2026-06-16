import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../AppContext';
import { useStore } from '../store/useStore';
import { hadithService } from '../services/hadithService';
import { noorbakhshiaService } from '../services/noorbakhshiaService';
import { NOORBAKHSHIA_BOOKS, HADITH_BOOKS, AWRADS } from '../data/libraryBooks';
import { FiArrowLeft, FiSettings, FiLoader, FiAlertTriangle, FiX, FiChevronUp, FiChevronDown, FiChevronsUp, FiChevronsDown } from 'react-icons/fi';
import { FaBookmark, FaRegBookmark, FaQuoteLeft, FaCircleCheck } from 'react-icons/fa6';

export const BookReaderScreen = ({ setTab, selectedBook }) => {
    const { goBack } = useApp();
    const { bookmarks, addBookmark, removeBookmark, updateReadHistory, quranSettings, updateQuranSettings } = useStore();

    // Reconstruct metadata if resuming from history (which strips content and flags)
    const baseBook = NOORBAKHSHIA_BOOKS.find(b => b.id === selectedBook?.id) 
                  || HADITH_BOOKS.find(b => b.id === selectedBook?.id)
                  || AWRADS.find(b => b.id === selectedBook?.id);
    
    // Inject dynamic Awrad content if it's an Awrad missing its content array
    let resolvedBook = { ...baseBook, ...selectedBook };
    if (baseBook?.type === 'Daily' || baseBook?.type === 'Occasional' || baseBook?.type === 'Specific' || baseBook?.type === 'Thursday Night') {
        if (!resolvedBook.content) {
            resolvedBook.content = [
                { title: baseBook.title, content: `O Allah, bless Muhammad and the family of Muhammad. This is the sacred text for ${baseBook.title}. It is recited to seek nearness to the Almighty and purify the soul.` }
            ];
        }
    }

    const isHadith = resolvedBook?.isHadith;
    const isNoorbakhshia = resolvedBook?.isNoorbakhshia;

    const [chaptersMeta, setChaptersMeta] = useState([]);
    const [fullBookData, setFullBookData] = useState(null);
    
    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSoftLoading, setIsSoftLoading] = useState(false);
    const [error, setError] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Tracking
    const [nextIndexToFetch, setNextIndexToFetch] = useState(resolvedBook?.chapterIndex || 0);
    const [activeBlockIndex, setActiveBlockIndex] = useState(resolvedBook?.chapterIndex || 0);
    const [activeBlockTitle, setActiveBlockTitle] = useState(resolvedBook?.title || 'Loading...');
    const [activeBlockSection, setActiveBlockSection] = useState(null);
    const [activeParaId, setActiveParaId] = useState(resolvedBook?.lastParaId || null);

    const loaderRef = useRef(null);
    const blockRefs = useRef({});
    const hasScrolled = useRef(false);

    // Pill State
    const [navDirection, setNavDirection] = useState('down');
    const [isNavVisible, setIsNavVisible] = useState(false);
    const scrollTimeoutRef = useRef(null);
    const lastScrollY = useRef(0);

    // 1. Initial Data Load
    useEffect(() => {
        if (!resolvedBook) return;

        const loadStructure = async () => {
            setIsLoading(true);
            try {
                if (isHadith) {
                    const data = await hadithService.getMetadata();
                    const bookMeta = data[resolvedBook.id]?.metadata;
                    if (bookMeta && bookMeta.sections) {
                        const parsedChapters = Object.entries(bookMeta.sections)
                            .filter(([id, title]) => title && title.trim() !== "")
                            .map(([id, title]) => ({ id, title, section: null }));
                        setChaptersMeta(parsedChapters);
                    }
                } else if (isNoorbakhshia) {
                    const bookPayload = await noorbakhshiaService.getBook(resolvedBook.id);
                    if (bookPayload && bookPayload.data) {
                        setFullBookData(bookPayload.data);
                        const parsedChapters = bookPayload.data.map(ch => {
                            let title = ch.chapter_name_ur || ch.chapter_name_en || `Chapter ${ch.chapter_id}`;
                            let section = null;

                            // Apply string splitting strictly for dawat-shareef
                            if (resolvedBook.id === 'dawat-shareef' && title.includes(' - ')) {
                                const parts = title.split(' - ');
                                section = parts[0].trim();
                                title = parts.slice(1).join(' - ').trim();
                            }

                            return {
                                id: ch.chapter_id,
                                title,
                                section
                            };
                        });
                        setChaptersMeta(parsedChapters);
                    }
                } else {
                    // For Awrads and manual content
                    if (resolvedBook.content) {
                        setChaptersMeta(resolvedBook.content.map((c, i) => ({ id: i, title: c.title, section: null })));
                    }
                }
            } catch (err) {
                setError(`Failed to load book structure: ${err.message}`);
            }
        };
        loadStructure();
        hasScrolled.current = false;
    // Use selectedBook?.id (stable primitive) not resolvedBook (new object every render)
    }, [selectedBook?.id, isHadith, isNoorbakhshia]);

    // 2. Fetch Block Logic
    const fetchBlock = useCallback(async (index) => {
        if (chaptersMeta.length === 0 || index >= chaptersMeta.length) return;
        
        setIsSoftLoading(true);
        if (blocks.length === 0) setIsLoading(true);

        try {
            let data = null;
            if (isHadith) {
                const sectionId = chaptersMeta[index].id;
                data = await hadithService.getSection(resolvedBook.id, sectionId);
            } else if (isNoorbakhshia && fullBookData) {
                await new Promise(resolve => setTimeout(resolve, 50));
                data = fullBookData[index];
            } else if (!isHadith && !isNoorbakhshia) {
                await new Promise(resolve => setTimeout(resolve, 50));
                data = resolvedBook.content ? resolvedBook.content[index] : null;
            }

            if (data) {
                // Initial history
                if (blocks.length === 0 && index === (resolvedBook?.chapterIndex || 0)) {
                    updateReadHistory({
                        id: resolvedBook.id,
                        type: 'book',
                        title: resolvedBook.title,
                        subtitle: chaptersMeta[index]?.title,
                        progress: `Chapter ${index + 1}`,
                        chapterIndex: index
                    });
                }

                setBlocks(prev => {
                    if (prev.some(b => b.index === index)) return prev;
                    return [...prev, { index, title: chaptersMeta[index].title, section: chaptersMeta[index].section, data }];
                });
                setNextIndexToFetch(index + 1);
            }
        } catch (err) {
            console.error("Fetch block error", err);
        } finally {
            setIsLoading(false);
            setIsSoftLoading(false);
        }
    }, [chaptersMeta, isHadith, isNoorbakhshia, fullBookData, selectedBook, blocks.length, updateReadHistory]);

    // Handle Pagination
    const handleNextChapter = () => {
        if (activeBlockIndex < chaptersMeta.length - 1) {
            const nextIdx = activeBlockIndex + 1;
            setBlocks([]);
            setActiveBlockIndex(nextIdx);
            setNextIndexToFetch(nextIdx);
            
            updateReadHistory({
                id: resolvedBook.id,
                type: 'book',
                title: resolvedBook.title,
                subtitle: chaptersMeta[nextIdx]?.title,
                progress: `Chapter ${nextIdx + 1}`,
                chapterIndex: nextIdx
            });
            
            fetchBlock(nextIdx);
            document.getElementById('book-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevChapter = () => {
        if (activeBlockIndex > 0) {
            const prevIdx = activeBlockIndex - 1;
            setBlocks([]);
            setActiveBlockIndex(prevIdx);
            setNextIndexToFetch(prevIdx);
            
            updateReadHistory({
                id: resolvedBook.id,
                type: 'book',
                title: resolvedBook.title,
                subtitle: chaptersMeta[prevIdx]?.title,
                progress: `Chapter ${prevIdx + 1}`,
                chapterIndex: prevIdx
            });
            
            fetchBlock(prevIdx);
            document.getElementById('book-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
        document.getElementById('book-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        const container = document.getElementById('book-scroll-container');
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
    };

    // Initial Block Fetch Trigger
    useEffect(() => {
        if (chaptersMeta.length > 0 && blocks.length === 0) {
            fetchBlock(resolvedBook?.chapterIndex || 0);
        }
    }, [chaptersMeta.length, blocks.length, resolvedBook?.chapterIndex, fetchBlock]);

    // Infinite Scroll Observer
    useEffect(() => {
        if (isNoorbakhshia) return; // Disable infinite scroll for paginated Noorbakhshia books
        if (isLoading || isSoftLoading || nextIndexToFetch >= chaptersMeta.length || chaptersMeta.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchBlock(nextIndexToFetch);
            }
        }, { rootMargin: '300px' });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [isLoading, isSoftLoading, nextIndexToFetch, chaptersMeta.length, fetchBlock, isNoorbakhshia]);

    // Active Block Observer
    useEffect(() => {
        const blockObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = parseInt(entry.target.getAttribute('data-index'));
                    const title = entry.target.getAttribute('data-title');
                    const section = entry.target.getAttribute('data-section');
                    setActiveBlockIndex(idx);
                    setActiveBlockTitle(title);
                    setActiveBlockSection(section !== 'null' ? section : null);
                }
            });
        }, { rootMargin: '-10% 0px -60% 0px' });

        Object.values(blockRefs.current).forEach(node => {
            if (node) blockObserver.observe(node);
        });

        return () => blockObserver.disconnect();
    }, [blocks]);

    // Scroll tracker for memory — guarded to not fire during resume-scroll
    useEffect(() => {
        let scrollTimeout;
        const scrollContainer = document.getElementById('book-scroll-container');
        
        const handleScroll = () => {
            // Don't record history if we're still in the middle of auto-scrolling to resume position
            if (!hasScrolled.current && resolvedBook?.lastParaId) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const paraNodes = document.querySelectorAll('.para-container');
                for (let i = 0; i < paraNodes.length; i++) {
                    const rect = paraNodes[i].getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                        const globalParaId = paraNodes[i].getAttribute('data-global-id');
                        setActiveParaId(globalParaId);
                        
                        updateReadHistory({
                            id: resolvedBook.id,
                            type: 'book',
                            title: resolvedBook.title,
                            subtitle: activeBlockTitle,
                            progress: `Chapter ${activeBlockIndex + 1}`,
                            chapterIndex: activeBlockIndex,
                            lastParaId: globalParaId
                        });
                        break;
                    }
                }
            }, 1000);
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [activeBlockIndex, activeBlockTitle, resolvedBook, updateReadHistory]);

    // Pill Scroll Tracking
    useEffect(() => {
        if (!isNoorbakhshia) return;
        
        const scrollContainer = document.getElementById('book-scroll-container');
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
            
            setIsNavVisible(true);
            
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                setIsNavVisible(false);
            }, 2500);
        };

        scrollContainer.addEventListener('scroll', handlePillScroll, { passive: true });
        
        setIsNavVisible(true);
        scrollTimeoutRef.current = setTimeout(() => setIsNavVisible(false), 2500);

        return () => {
            scrollContainer.removeEventListener('scroll', handlePillScroll);
            clearTimeout(scrollTimeoutRef.current);
        };
    }, [isNoorbakhshia, activeBlockIndex]);

    // Handle Deep Linking — explicit scrollTop on container, reliable in nested scrollable divs
    useEffect(() => {
        if (!resolvedBook?.lastParaId || blocks.length === 0 || hasScrolled.current) return;

        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            const element = document.getElementById(`para-global-${resolvedBook.lastParaId}`);
            const container = document.getElementById('book-scroll-container');
            if (element && container) {
                // Double rAF ensures DOM is fully painted before we measure
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const elementRect = element.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        // Calculate offset relative to the container, centering the element
                        const scrollOffset = elementRect.top - containerRect.top + container.scrollTop - (container.clientHeight / 4);
                        container.scrollTop = scrollOffset;
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
    // Use primitive lastParaId string (stable) not resolvedBook object (new ref every render)
    }, [resolvedBook?.lastParaId, blocks]);

    if (!resolvedBook) return null;

    const getBookmarkId = () => `${resolvedBook.id}-ch${activeBlockIndex}`;
    const isBookmarked = bookmarks.some(b => b.bookId === getBookmarkId());

    const handleBookmark = () => {
        if (blocks.length === 0) return;
        if (isBookmarked) {
            const bm = bookmarks.find(b => b.bookId === getBookmarkId());
            if (bm) removeBookmark(bm.id);
        } else {
            addBookmark({
                type: 'Book',
                bookId: getBookmarkId(),
                title: resolvedBook.title,
                preview: activeBlockTitle,
                tab: 'book-reader',
                params: { book: { ...resolvedBook, chapterIndex: activeBlockIndex, lastParaId: activeParaId } }
            });
        }
    };

    const handleBookmarkPara = (blockIndex, globalId, previewText) => {
        const fullId = `${resolvedBook.id}-${globalId}`;
        const isParaBookmarked = bookmarks.some(b => b.bookId === fullId);
        
        if (isParaBookmarked) {
            const bm = bookmarks.find(b => b.bookId === fullId);
            if (bm) removeBookmark(bm.id);
        } else {
            addBookmark({
                type: 'Paragraph',
                bookId: fullId,
                title: selectedBook.title,
                preview: previewText ? (previewText.substring(0, 80) + '...') : 'Bookmarked Paragraph',
                tab: 'book-reader',
                params: { book: { ...selectedBook, chapterIndex: blockIndex, lastParaId: globalId } }
            });
        }
    };

    const handleGoBack = () => {
        goBack();
    };

    return (
        <div id="book-scroll-container" className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative">
            
            {/* Header Sticky (Fade Mask) */}
            <div className="w-full sticky top-0 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8">
                <div className="w-full flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <button onClick={handleGoBack} className="w-10 h-10 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all shadow-inner bg-emerald-dark shrink-0">
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div>
                            <h2 className="font-display text-xl text-cream tracking-wide truncate max-w-[150px] sm:max-w-[200px]">
                                {selectedBook.title} {activeBlockSection ? <span className="text-gold"> • {activeBlockSection}</span> : ''}
                            </h2>
                            <p className="text-sage text-lg py-1 leading-loose truncate max-w-[150px] font-urdu" dir="rtl">{activeBlockTitle || 'Loading...'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSettingsOpen(true)} className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-emerald-dark border border-cream/10 text-sage hover:text-gold transition-colors">
                            <FiSettings className="text-xl" />
                        </button>
                        <button onClick={handleBookmark} className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${isBookmarked ? 'bg-gold/20 text-gold' : 'bg-emerald-dark border border-cream/10 text-sage hover:text-gold'}`}>
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
                    <div className="space-y-16">
                        {blocks.map((block) => (
                            <div 
                                key={`block-${block.index}`}
                                data-index={block.index}
                                data-title={block.title}
                                data-section={block.section}
                                ref={el => blockRefs.current[block.index] = el}
                                className="block-container"
                            >
                                {/* Block Header */}
                                <div className="text-center mb-12 border-b border-cream/5 pb-12 animate-fade-down">
                                    <h3 className="font-urdu text-3xl text-gold leading-[2] mb-2">{block.title}</h3>
                                    <p className="text-sage text-[10px] tracking-widest uppercase">Chapter {block.index + 1}</p>
                                </div>

                                {/* Hadith Render */}
                                {isHadith && block.data?.map((hadith, hIdx) => {
                                    const globalId = `h${block.index}-${hIdx}`;
                                    const isParaBookmarked = bookmarks.some(b => b.bookId === `${selectedBook.id}-${globalId}`);
                                    const previewText = hadith.english || hadith.arabic || 'Hadith';

                                    return (
                                        <div 
                                            key={`h-${hIdx}`}
                                            id={`para-global-${globalId}`}
                                            data-global-id={globalId}
                                            className="para-container bg-emerald-dark p-6 rounded-3xl border border-cream/10 relative shadow-lg mb-8 animate-fade-up"
                                        >
                                            <FaQuoteLeft className="text-4xl text-gold/20 absolute top-4 start-4 pointer-events-none" />
                                            
                                            <button 
                                                onClick={() => handleBookmarkPara(block.index, globalId, previewText)}
                                                className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center text-sage/50 hover:text-gold transition-colors z-20"
                                            >
                                                {isParaBookmarked ? <FaBookmark className="text-xl text-gold" /> : <FaRegBookmark className="text-xl" />}
                                            </button>

                                            <div className="mt-6 mb-6">
                                            {hadith.arabic && (
                                                <p className="font-indopak text-cream leading-[2.5] text-right mb-6" dir="rtl" style={{ fontSize: `${quranSettings.arabicFontSize}px` }}>
                                                    {hadith.arabic}
                                                </p>
                                            )}
                                            {hadith.english && (
                                                <p className="font-body text-sage leading-loose relative z-10" style={{ fontSize: `${quranSettings.translationFontSize}px` }}>
                                                    {hadith.english}
                                                </p>
                                            )}
                                        </div>
                                        <div className="border-t border-cream/5 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center">
                                            <span className="text-gold/80 text-[10px] uppercase tracking-widest font-bold">
                                                Hadith {hadith.number}
                                            </span>
                                        </div>
                                    </div>
                                    );
                                })}

                                {/* Noorbakhshia Render */}
                                {isNoorbakhshia && block.data?.topics?.map((topic, tIdx) => (
                                    <div key={`t-${tIdx}`} className="space-y-8">
                                        {topic.topic_name_ur && topic.topic_name_ur.trim() !== "" && (
                                            <div className="my-16 py-8 border-y border-gold/10 bg-emerald-dark/20 text-center rounded-3xl animate-fade-down">
                                                <h4 className="font-urdu text-2xl text-gold m-0">{topic.topic_name_ur}</h4>
                                            </div>
                                        )}
                                        <div className="space-y-0">
                                            {topic.paragraphs?.map((para, pIdx) => {
                                                const globalId = `n${block.index}-${tIdx}-${pIdx}`;
                                                const isParaBookmarked = bookmarks.some(b => b.bookId === `${selectedBook.id}-${globalId}`);
                                                const hasArabic = para.arabic_text && para.arabic_text.trim() !== "";
                                                const hasUrdu = para.urdu_text && para.urdu_text.trim() !== "";
                                                const hasDesc = para.description && para.description.trim() !== "";
                                                const previewText = para.urdu_text || para.arabic_text || para.description;
                                                
                                                return (
                                                    <div 
                                                        key={`p-${pIdx}`}
                                                        id={`para-global-${globalId}`}
                                                        data-global-id={globalId}
                                                        className="para-container relative animate-fade-up border-b border-cream/5 pb-10 mb-10 last:border-0 last:mb-0"
                                                    >
                                                        <div className="absolute top-0 start-0 w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center text-xs font-display text-gold bg-emerald-dark z-10 shadow-[0_0_10px_rgba(201,168,76,0.1)]">
                                                            {para.paragraph_number || (pIdx + 1)}
                                                        </div>

                                                        <button 
                                                            onClick={() => handleBookmarkPara(block.index, globalId, previewText)}
                                                            className="absolute top-0 end-0 w-8 h-8 flex items-center justify-center text-sage/50 hover:text-gold transition-colors z-20"
                                                        >
                                                            {isParaBookmarked ? <FaBookmark className="text-xl text-gold" /> : <FaRegBookmark className="text-xl" />}
                                                        </button>

                                                        <div className="flex flex-col gap-6 ps-12 pe-10">
                                                            {hasArabic && (
                                                                <div className="w-full text-right" dir="rtl">
                                                                    <p className="font-indopak text-cream" style={{ fontSize: `${quranSettings.arabicFontSize}px`, lineHeight: 2.2 }}>
                                                                        {para.arabic_text}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {hasUrdu && (
                                                                <div className="w-full text-right" dir="rtl">
                                                                    <p className="font-urdu leading-[2.5] font-light text-sage" style={{ fontSize: `${quranSettings.translationFontSize}px` }}>
                                                                        {para.urdu_text}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {hasDesc && (
                                                                <div className={`w-full text-right ${hasArabic || hasUrdu ? 'pt-6 border-t border-cream/5' : ''}`} dir="rtl">
                                                                    <p className="font-urdu leading-[2.5] font-light text-sage" style={{ fontSize: `${quranSettings.translationFontSize}px` }}>
                                                                        {para.description}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {para.original_hadees_no && (
                                                                <div className="border-t border-cream/5 pt-[calc(1rem+env(safe-area-inset-top))] mt-2 flex justify-between items-center">
                                                                    <span className="text-gold/80 text-[10px] uppercase tracking-widest font-bold">
                                                                        {para.original_hadees_no}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Fallback Mock Render */}
                                {!isHadith && !isNoorbakhshia && block.data && (
                                    <div className="prose prose-invert prose-emerald max-w-none text-sage leading-loose text-[17px] font-light" style={{ fontSize: `${quranSettings.translationFontSize}px` }}>
                                        <p>{block.data.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading trigger for next chunk */}
                        {!isNoorbakhshia && nextIndexToFetch < chaptersMeta.length && (
                            <div ref={loaderRef} className="py-20 flex justify-center">
                                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}

                        {!isNoorbakhshia && nextIndexToFetch >= chaptersMeta.length && chaptersMeta.length > 0 && (
                            <div className="py-20 flex flex-col items-center opacity-50">
                                <FaCircleCheck className="text-gold text-3xl mb-2" />
                                <p className="font-display text-sage text-xs uppercase tracking-widest">End of Book</p>
                            </div>
                        )}

                        {isNoorbakhshia && activeBlockIndex === chaptersMeta.length - 1 && chaptersMeta.length > 0 && (
                            <div className="py-20 flex flex-col items-center opacity-50">
                                <FaCircleCheck className="text-gold text-3xl mb-2" />
                                <p className="font-display text-sage text-xs uppercase tracking-widest">End of Book</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Navigation Pill */}
            {isNoorbakhshia && blocks.length > 0 && (
                <div 
                    className={`fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 transition-all duration-500 transform ${isNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                >
                    <div className="bg-[#0a1e16]/90 backdrop-blur-md border border-gold/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-full px-2 py-2 flex items-center gap-2">
                        {navDirection === 'down' ? (
                            <>
                                <button onClick={scrollToBottom} className="w-10 h-10 flex items-center justify-center rounded-full text-sage hover:bg-gold/10 hover:text-gold transition-colors" aria-label="Scroll to End">
                                    <FiChevronsDown className="text-xl" />
                                </button>
                                {activeBlockIndex < chaptersMeta.length - 1 && (
                                    <button onClick={handleNextChapter} className="h-10 px-4 flex items-center justify-center gap-2 rounded-full bg-gold text-emerald-dark hover:bg-cream transition-colors font-bold shadow-[0_0_15px_rgba(201,168,76,0.2)]" aria-label="Next Chapter">
                                        <span className="font-display tracking-widest text-[10px] uppercase">Next</span>
                                        <FiChevronDown className="text-lg" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                {activeBlockIndex > 0 && (
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
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSettingsOpen(false)}></div>
                    <div className="w-full max-w-md bg-forest border border-cream/10 rounded-3xl p-6 relative z-10 animate-fade-up shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-cream/5 pb-4">
                            <h3 className="font-display text-xl text-cream">Reading Settings</h3>
                            <button onClick={() => setSettingsOpen(false)} className="text-sage hover:text-cream">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Arabic Size Slider */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] text-sage uppercase tracking-widest font-semibold">Arabic Size</label>
                                <span className="text-xs text-gold">{quranSettings.arabicFontSize}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="20" max="64" 
                                value={quranSettings.arabicFontSize}
                                onChange={(e) => updateQuranSettings({ arabicFontSize: parseInt(e.target.value) })}
                                className="w-full accent-gold h-1 bg-emerald-dark rounded-full appearance-none outline-none"
                            />
                        </div>

                        {/* Translation Size Slider */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] text-sage uppercase tracking-widest font-semibold">Translation Size</label>
                                <span className="text-xs text-gold">{quranSettings.translationFontSize}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="12" max="32" 
                                value={quranSettings.translationFontSize}
                                onChange={(e) => updateQuranSettings({ translationFontSize: parseInt(e.target.value) })}
                                className="w-full accent-gold h-1 bg-emerald-dark rounded-full appearance-none outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
