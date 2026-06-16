# 🌙 Noorbakshia WebApp

> A beautiful, feature-rich **Islamic Progressive Web App (PWA)** for the Noorbakhshia community — featuring the complete Holy Quran, Noorbakhshia library books, Awrad & Duas, Prayer Times, Qibla Compass, and much more.

**🔗 Live App:** [noorbakshia.vercel.app](https://noorbakshia.vercel.app)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📖 **Holy Quran** | Full Quran with Arabic text, English & Urdu translation, resume reading |
| 📚 **Noorbakhshia Library** | Digital library of authentic Noorbakhshia books with deep resume reading |
| 📿 **Awrad & Duas** | Daily, occasional and specific Awrad with full text |
| 🕌 **Prayer Times** | Auto-detected prayer times using GPS location |
| 🧭 **Qibla Compass** | Real-time Qibla direction compass |
| 📿 **Tasbeeh Counter** | Digital tasbeeh counter with vibration feedback |
| 📅 **Islamic Calendar** | Hijri calendar with Islamic events and moon sighting adjustment |
| 🔖 **Bookmarks** | Bookmark any ayah or paragraph for quick access |
| 🕐 **Resume Reading** | Automatically saves and resumes reading position at paragraph/ayah level |
| 🔍 **Search** | Search across all content |
| 👤 **Profile** | Personal reading history, bookmarks, and custom profile photo |
| 📱 **PWA** | Installable on Android & iOS, works offline |

---

## 📱 Screenshots

> Install the app at [noorbakshia.vercel.app](https://noorbakshia.vercel.app) for the full experience.

---

## 🛠️ Tech Stack

- **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **PWA:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) + Workbox
- **Prayer Times:** [Adhan.js](https://github.com/batoulapps/adhan-js)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Akio786/noorbakshia.git
cd noorbakshia

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 📂 Project Structure

```
noorbakshia/
├── public/
│   ├── api/
│   │   ├── quran/          # Quran JSON data (Arabic, Urdu, English)
│   │   └── books/          # Noorbakhshia book data
│   └── pwa-*.png           # PWA icons
├── src/
│   ├── components/         # Reusable UI components
│   ├── data/               # Static data (library books, duas, asmaul husna)
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # Full page screen components
│   ├── services/           # Data fetching services
│   ├── store/              # Zustand global state store
│   └── utils/              # Utility functions
├── vercel.json             # Vercel deployment config
└── vite.config.js          # Vite + PWA configuration
```

---

## 📖 Library Books Included

- **Fiqh-e-Ahwat** — Complete Islamic jurisprudence
- **Mawadat Al-Qirbi** — *(مودة القربي)*
- **Dawat Shareef** — Sacred invocations
- **Kitab Al-Aetiqadia** — Book of beliefs

---

## 🤲 Contributing

This is an open-source community project. Contributions, bug reports, and suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgements

- Quran data sourced from open Islamic data APIs
- Built with love for the Noorbakhshia community

---

<p align="center">Made with ❤️ for the Noorbakhshia Community</p>
