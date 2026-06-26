import { FaScaleBalanced, FaBookOpen, FaScroll, FaBookQuran, FaHandsPraying } from 'react-icons/fa6';
import { GiOpenBook, GiPrayerBeads } from 'react-icons/gi';
import { BsFillMoonStarsFill } from 'react-icons/bs';
import { RiPlantFill } from 'react-icons/ri';

export const NOORBAKHSHIA_BOOKS = [
    { id: 'fiqh-e-ahwat', title: "Fiqh e Ahwat", urduTitle: "فقہ احوط", subtitle: "Jurisprudence", author: "Shah Syed Muhammad Nurbakhsh", isNoorbakhshia: true, Icon: FaScaleBalanced },
    { id: 'chehl-hadees', title: "Mawadat Al Qirbi", urduTitle: "مودة القربي", subtitle: "Forty Hadiths", author: "Mir Sayyid Ali Hamadani", isNoorbakhshia: true, Icon: FaBookOpen },
    { id: 'kitab-al-aetiqadia', title: "Al Aetiqadia", urduTitle: "الاعتقادیہ", subtitle: "Theology & Beliefs", author: "Shah Syed Muhammad Nurbakhsh", isNoorbakhshia: true, Icon: GiOpenBook },
    { id: 'dawat-shareef', title: "Dawat Shareef", urduTitle: "دعوات", subtitle: "Spiritual Invitations", author: "Various Authors", isNoorbakhshia: true, Icon: FaScroll },
    { id: 'awrad', title: "Awrad", urduTitle: "اوراد", subtitle: "Daily Supplications", author: "Various Authors", isNoorbakhshia: true, Icon: FaHandsPraying }
];

export const HADITH_BOOKS = [
    { id: 'bukhari', title: "Sahih al-Bukhari", subtitle: "Imam Bukhari", isHadith: true, Icon: FaBookQuran },
    { id: 'muslim', title: "Sahih Muslim", subtitle: "Imam Muslim", isHadith: true, Icon: FaBookQuran }
];

export const AWRADS = [
    { id: 'awrad-daily', title: "Noorbakhshi Awrad", type: "Daily", Icon: FaScroll },
    { id: 'awrad-ayaat', title: "Namaz-e-Ayaat", type: "Occasional", Icon: BsFillMoonStarsFill },
    { id: 'awrad-kumayl', title: "Dua-e-Kumayl", type: "Thursday Night", Icon: FaHandsPraying },
    { id: 'awrad-rizq', title: "Wazifa for Rizq", type: "Specific", Icon: RiPlantFill }
];
