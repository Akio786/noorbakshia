import React from 'react';
import { useApp } from '../AppContext';
import { useStore } from '../store/useStore';
import { FiArrowLeft, FiType, FiBookOpen, FiClock, FiCalendar, FiMinus, FiPlus, FiSmartphone, FiMonitor, FiShare, FiMail, FiArrowUpRight } from 'react-icons/fi';
import { FaGear, FaEnvelope, FaHandHoldingDollar, FaBuildingColumns, FaHeart } from 'react-icons/fa6';

export const SettingsScreen = () => {
    const { hijriOffset, updateHijriOffset, goBack, installPrompt, installPwa } = useApp();
    const { quranSettings, updateQuranSettings, prayerSettings, updatePrayerSettings } = useStore();

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col relative z-20">
            {/* Top Header (Sticky Fade Mask) */}
            <div className="sticky top-0 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8">
                <div className="w-full flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3 w-full">
                        <button onClick={goBack} className="w-10 h-10 shrink-0 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all shadow-inner bg-emerald-dark">
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <div className="flex items-center gap-3">
                            <FaGear className="text-gold text-2xl" />
                            <h2 className="font-display text-3xl text-cream tracking-wide">Settings</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Areas */}
            <div className="flex-1 animate-fade-up mt-4">
                <div className="space-y-6">
                    {/* Typography Settings */}
                    <div className="bg-emerald-dark p-6 rounded-3xl border border-cream/5 shadow-inner">
                        <h3 className="font-display text-lg text-cream mb-6 flex items-center gap-2">
                            <FiType className="text-gold" /> Typography
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sage text-xs mb-3">
                                    <span>Arabic Text Size</span>
                                    <span className="text-gold">{quranSettings.arabicFontSize}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="20" max="80" 
                                    value={quranSettings.arabicFontSize}
                                    onChange={(e) => updateQuranSettings({ arabicFontSize: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-cream/10 rounded-lg appearance-none cursor-pointer accent-gold" 
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-sage text-xs mb-3">
                                    <span>Translation Size</span>
                                    <span className="text-gold">{quranSettings.translationFontSize}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="12" max="40" 
                                    value={quranSettings.translationFontSize}
                                    onChange={(e) => updateQuranSettings({ translationFontSize: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-cream/10 rounded-lg appearance-none cursor-pointer accent-gold" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Translation Settings */}
                    <div className="bg-emerald-dark p-6 rounded-3xl border border-cream/5 shadow-inner space-y-4">
                        <h3 className="font-display text-lg text-cream mb-6 flex items-center gap-2">
                            <FiBookOpen className="text-gold" /> Translation
                        </h3>
                        
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sage text-sm">Show Translation</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={quranSettings.showTranslation} 
                                    onChange={(e) => updateQuranSettings({ showTranslation: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-cream/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                            </label>
                        </div>

                        {quranSettings.showTranslation && (
                            <div>
                                <h4 className="text-cream text-sm mb-2">Translation Language</h4>
                                <select 
                                    value={quranSettings.translationLanguage}
                                    onChange={(e) => updateQuranSettings({ translationLanguage: e.target.value })}
                                    className="w-full bg-[#071510] border border-cream/5 rounded-xl px-4 py-3 text-sage text-sm focus:outline-none focus:border-gold/50 appearance-none"
                                >
                                    <option value="en.sahih">English (Sahih International)</option>
                                    <option value="en.yusufali">English (Yusuf Ali)</option>
                                    <option value="ur.jalandhry">Urdu (Jalandhry)</option>
                                    <option value="ur.ahmedali">Urdu (Ahmed Ali)</option>
                                    <option value="ar.muyassar">Arabic (Muyassar)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Prayer Settings */}
                    <div className="bg-emerald-dark p-6 rounded-3xl border border-cream/5 shadow-inner space-y-4">
                        <h3 className="font-display text-lg text-cream mb-6 flex items-center gap-2">
                            <FiClock className="text-gold" /> Prayer Calculations
                        </h3>
                        
                        <div className="mb-4">
                            <h4 className="text-cream text-sm mb-2">Calculation Method</h4>
                            <select 
                                value={prayerSettings.calculationMethod}
                                onChange={(e) => updatePrayerSettings({ calculationMethod: e.target.value })}
                                className="w-full bg-[#071510] border border-cream/5 rounded-xl px-4 py-3 text-sage text-sm focus:outline-none focus:border-gold/50 appearance-none"
                            >
                                <option value="Karachi">University of Islamic Sciences, Karachi</option>
                                <option value="ISNA">Islamic Society of North America (ISNA)</option>
                                <option value="MuslimWorldLeague">Muslim World League (MWL)</option>
                                <option value="UmmAlQura">Umm Al-Qura University, Makkah</option>
                                <option value="Egyptian">Egyptian General Authority</option>
                                <option value="Tehran">Institute of Geophysics, Tehran</option>
                            </select>
                        </div>

                        <div>
                            <h4 className="text-cream text-sm mb-2">Asr Method</h4>
                            <select 
                                value={prayerSettings.madhab}
                                onChange={(e) => updatePrayerSettings({ madhab: e.target.value })}
                                className="w-full bg-[#071510] border border-cream/5 rounded-xl px-4 py-3 text-sage text-sm focus:outline-none focus:border-gold/50 appearance-none"
                            >
                                <option value="Hanafi">Hanafi (Later Time)</option>
                                <option value="Shafi">Standard (Shafi, Maliki, Hanbali)</option>
                            </select>
                        </div>
                    </div>

                    {/* Calendar Settings */}
                    <div className="bg-emerald-dark p-6 rounded-3xl border border-cream/5 shadow-inner space-y-4">
                        <h3 className="font-display text-lg text-cream mb-6 flex items-center gap-2">
                            <FiCalendar className="text-gold" /> Calendar Settings
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-cream text-sm">Moon Sighting Offset</h4>
                                <p className="text-sage text-[10px] uppercase tracking-widest mt-1">Adjust Hijri Date Globally</p>
                            </div>
                            <div className="flex items-center gap-3 bg-[#071510] rounded-full p-1 border border-cream/5">
                                <button onClick={() => updateHijriOffset(hijriOffset - 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-sage hover:text-gold hover:bg-emerald-dark transition-all">
                                    <FiMinus />
                                </button>
                                <span className="text-cream text-sm font-bold min-w-[20px] text-center">{hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}</span>
                                <button onClick={() => updateHijriOffset(hijriOffset + 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-sage hover:text-gold hover:bg-emerald-dark transition-all">
                                    <FiPlus />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* App Installation */}
                    <div className="bg-emerald-dark p-6 rounded-3xl border border-cream/5 shadow-inner space-y-4">
                        <h3 className="font-display text-lg text-cream mb-6 flex items-center gap-2">
                            <FiSmartphone className="text-gold" /> App Installation
                        </h3>
                        
                        <div className="text-center">
                            <FiMonitor className="text-5xl text-gold mb-4 mx-auto block" />
                            <h3 className="font-display text-xl text-cream mb-2">Install Noorbakhshia 365</h3>
                            <p className="text-sage text-sm font-light mb-6">Install this app on your device for quick access, offline reading, and a full-screen native experience.</p>
                            
                            {installPrompt ? (
                                <button 
                                    onClick={installPwa}
                                    className="w-full bg-gold text-[#05110d] font-display text-lg py-3 rounded-xl hover:bg-cream transition-colors shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                                >
                                    Install App
                                </button>
                            ) : (
                                <div className="bg-[#05110d] border border-cream/10 rounded-xl p-4 text-sage text-sm">
                                    <p className="mb-2"><strong>iOS/Apple Users:</strong></p>
                                    <p className="font-light">Tap the <FiShare className="inline text-gold mx-1" /> Share button in your Safari menu and select <strong>"Add to Home Screen"</strong>.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support & Feedback */}
                    <div className="bg-emerald-dark p-6 rounded-3xl border border-cream/5 shadow-inner space-y-4">
                        <h3 className="font-display text-lg text-cream mb-4 flex items-center gap-2">
                            <FiMail className="text-gold" /> Support & Feedback
                        </h3>
                        <p className="text-sage text-sm font-light mb-4">
                            For bug reports, feature requests, or general inquiries, please reach out via email.
                        </p>
                        <a href="mailto:muhammdd.akram@gmail.com" className="flex items-center justify-between bg-[#071510] border border-cream/5 rounded-xl p-4 hover:border-gold/30 transition-all group">
                            <div className="flex items-center gap-3">
                                <FaEnvelope className="text-gold/70 group-hover:text-gold transition-colors" />
                                <span className="text-cream text-sm">muhammdd.akram@gmail.com</span>
                            </div>
                            <FiArrowUpRight className="text-sage group-hover:text-gold transition-colors" />
                        </a>
                    </div>

                    {/* Support the Project */}
                    <div className="bg-emerald-dark p-6 rounded-3xl border border-gold/10 shadow-inner space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 end-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
                        <h3 className="font-display text-lg text-cream mb-4 flex items-center gap-2 relative z-10">
                            <FaHandHoldingDollar className="text-gold" /> Support the Project
                        </h3>
                        <p className="text-sage text-sm font-light relative z-10">
                            Donations are absolutely not required, but they are deeply appreciated and help with ongoing development. <strong className="text-cream font-medium">100% of all donations</strong> will be used exclusively for app development and server costs.
                        </p>
                        <div className="bg-[#071510] border border-gold/20 rounded-xl p-4 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-mid flex items-center justify-center border border-gold/30 shadow-inner shrink-0">
                                    <FaBuildingColumns className="text-gold" />
                                </div>
                                <div>
                                    <h4 className="text-sage text-[10px] uppercase tracking-widest font-bold mb-1">Easypaisa Account</h4>
                                    <span className="text-gold text-lg tracking-wider font-mono">03422291322</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* About Developer */}
                    <div className="mt-8 text-center pb-8">
                        <FaHeart className="text-rose-500 text-2xl mb-2 inline-block animate-pulse-slow" />
                        <h3 className="font-display text-lg text-cream mb-1">Created with Love</h3>
                        <p className="text-sage text-sm font-light">
                            Designed and developed by <span className="text-gold font-medium">Muhammad Akram</span>
                        </p>
                        <p className="text-sage/40 text-[10px] tracking-widest uppercase mt-4">
                            Noorbakhshia 365 v1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
