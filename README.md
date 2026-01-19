# ⚡ Entension - English Learning Extension

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Entension** is a modern browser extension alternative to Ejoy, offering the best UI/UX for learning and remembering English words and sentences.

## ✨ Features

### 1. 🖱️ Right-Click Translation
- Select any text on a webpage
- Right-click and choose "Translate with Entension"
- Get instant translations with a beautiful popup
- Save translations with one click

### 2. 🎨 Best Interface & UX
- **Ultra-smooth animations** - Silky smooth transitions and effects
- **Retro-themed design** - Nostalgic gradient colors and classic styling
- **Easy to use** - Intuitive interface that anyone can master
- **Learning features** - Built-in review system and statistics tracking
- **Responsive design** - Works perfectly on any screen size

### 3. 🌐 Language Support
- **English ↔ Vietnamese** translation
- Automatic language detection
- High-quality translations using MyMemory API
- Support for words, phrases, and sentences

### 4. 📚 Learning Tools
- Save unlimited translations
- Search through your saved words
- Track learning progress with statistics
- Review mode for practicing
- Export your vocabulary as JSON
- Text-to-speech for pronunciation

## 🚀 Installation

### For Chrome/Edge/Brave

1. Clone or download this repository
2. Open Chrome/Edge/Brave browser
3. Navigate to `chrome://extensions/` (or `edge://extensions/`)
4. Enable "Developer mode" in the top right
5. Click "Load unpacked"
6. Select the extension folder

### For Firefox

1. Clone or download this repository
2. Open Firefox browser
3. Navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file

## 📖 How to Use

### Translating Text
1. Select any text on a webpage
2. Right-click on the selected text
3. Click "Translate with Entension"
4. View the translation in the popup bubble
5. Click "💾 Save" to save the translation

### Managing Saved Translations
1. Click the Entension icon in your browser toolbar
2. View all your saved translations
3. Use the search box to find specific words
4. Switch between tabs: All, Recent, Review
5. Click 🔊 to hear pronunciation
6. Click 🗑️ to delete a translation

### Exporting Your Vocabulary
1. Open the extension popup
2. Click "📥 Export" button
3. Save the JSON file to your computer
4. Import it later or share with friends

## 🎨 UI Design

Entension features a beautiful **retro-gradient theme** with:
- Purple-blue gradient backgrounds (#667eea to #764ba2)
- Smooth animations and transitions
- Monospace font (Courier New) for that classic feel
- Card-based layout for easy reading
- Floating animations and pulse effects

## 🛠️ Technical Details

- **Manifest Version**: 3 (latest Chrome extension format)
- **Translation API**: MyMemory Translation API (free, no API key required)
- **Storage**: Chrome Storage API for persistent data
- **Framework**: Vanilla JavaScript (no dependencies)
- **Languages**: JavaScript, HTML, CSS

## 📁 File Structure

```
entension/
├── manifest.json         # Extension configuration
├── background.js         # Background service worker
├── content.js           # Content script for page interaction
├── content.css          # Styles for translation bubble
├── popup.html           # Extension popup interface
├── popup.css            # Popup styles (retro theme)
├── popup.js             # Popup functionality
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## 🔒 Privacy

Entension respects your privacy:
- All translations are stored locally in your browser
- No data is sent to third-party servers except for translation requests
- No tracking or analytics
- No account required
- No ads

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

MIT License - feel free to use and modify as you wish!

## 🌟 Credits

Created as an alternative to Ejoy with focus on:
- Better UI/UX
- Smoother animations
- More intuitive interface
- Enhanced learning features

---

**Enjoy learning English with Entension! ⚡📚**