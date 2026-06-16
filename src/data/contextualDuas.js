import { FaSun, FaMoon, FaHandsPraying, FaCloudMoon, FaCloudSun } from 'react-icons/fa6';
import { BsFillCloudSunFill } from 'react-icons/bs';

export const CONTEXTUAL_DUAS = [
    {
        id: 'fajr',
        title: 'Morning Supplication (Al-Kahf 18:10)',
        arabic: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
        transliteration: "Rabbana atina min ladunka rahmatan wahayyi' lana min amrina rashada",
        english: 'Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.',
        urdu: 'اے ہمارے رب! ہمیں اپنے پاس سے رحمت عطا فرما اور ہمارے کام میں ہمارے لیے راہِ راست مہیا کر دے۔',
        Icon: FaCloudSun,
        color: 'text-sage'
    },
    {
        id: 'dhuhr',
        title: 'Midday Supplication (Al-Baqarah 2:201)',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        transliteration: "Rabbana atina fid-dunya hasanatan wa fil-'akhirati hasanatan wa qina 'adhaban-nar",
        english: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
        urdu: 'اے ہمارے رب! ہمیں دنیا میں بھی بھلائی دے اور آخرت میں بھی بھلائی دے اور ہمیں آگ کے عذاب سے بچا۔',
        Icon: FaSun,
        color: 'text-gold'
    },
    {
        id: 'asr',
        title: 'Afternoon Remembrance (Al-A\'raf 7:23)',
        arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
        transliteration: 'Rabbana thalamna anfusana wa-in lam taghfir lana watarhamna lanakoonanna mina alkhasireen',
        english: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
        urdu: 'اے ہمارے رب! ہم نے اپنی جانوں پر ظلم کیا اور اگر تو نے ہمیں نہ بخشا اور ہم پر رحم نہ کیا تو ہم یقیناً نقصان اٹھانے والوں میں سے ہو جائیں گے۔',
        Icon: BsFillCloudSunFill,
        color: 'text-orange-300'
    },
    {
        id: 'maghrib',
        title: 'Evening Supplication (Aal-e-Imran 3:8)',
        arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
        transliteration: "Rabbana la tuzigh quloobana ba'da idh hadaytana wahab lana min ladunka rahmah, innaka antal-Wahhab",
        english: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
        urdu: 'اے ہمارے رب! جب تو نے ہمیں ہدایت دے دی ہے تو اس کے بعد ہمارے دلوں کو ٹیڑھا نہ ہونے دے اور ہمیں اپنے پاس سے رحمت عطا فرما، بیشک تو ہی سب کچھ دینے والا ہے۔',
        Icon: FaCloudMoon,
        color: 'text-orange-500'
    },
    {
        id: 'isha',
        title: 'Night Supplication (Al-Baqarah 2:286)',
        arabic: 'رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا',
        transliteration: "Rabbana wala tuhammilna ma la taqata lana bih, wa'fu 'anna waghfir lana warhamna",
        english: 'Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us.',
        urdu: 'اے ہمارے رب! اور ہم پر وہ بوجھ نہ ڈال جس کی ہم میں طاقت نہیں، اور ہمیں معاف فرما، اور ہمیں بخش دے، اور ہم پر رحم فرما۔',
        Icon: FaMoon,
        color: 'text-blue-300'
    },
    {
        id: 'generic',
        title: 'Constant Remembrance (Al-Qasas 28:24)',
        arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
        transliteration: 'Rabbi innee lima anzalta ilayya min khayrin faqeer',
        english: 'My Lord, indeed I am, for whatever good You would send down to me, in need.',
        urdu: 'اے میرے رب! جو بھلائی بھی تو میری طرف اتارے میں اس کا محتاج ہوں۔',
        Icon: FaHandsPraying,
        color: 'text-cream'
    }
];

export const getCurrentDua = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
        return CONTEXTUAL_DUAS.find(d => d.id === 'fajr');
    } else if (hour >= 12 && hour < 17) {
        return CONTEXTUAL_DUAS.find(d => d.id === 'dhuhr');
    } else if (hour >= 17 && hour < 21) {
        return CONTEXTUAL_DUAS.find(d => d.id === 'maghrib');
    } else {
        return CONTEXTUAL_DUAS.find(d => d.id === 'isha');
    }
};
