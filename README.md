# Page to Markdown - Chrome Extension

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-compatible-brightgreen.svg)
![Edge](https://img.shields.io/badge/edge-compatible-brightgreen.svg)

A powerful browser extension that converts any web page into a well-formatted Markdown file with a single click. Perfect for archiving articles, documentation, blog posts, and any web content for offline reference or note-taking.

## ✨ Features

### 📝 Comprehensive Content Conversion
- **Headings** (H1-H6) → Markdown headers
- **Text Formatting** → Bold, italic, and inline code
- **Links** → Preserved with full URLs
- **Images** → Referenced with alt text and absolute URLs
- **Lists** → Both bulleted and numbered lists
- **Tables** → Full table formatting
- **Code Blocks** → Syntax-preserved code blocks
- **Blockquotes** → Quote formatting

### 🎯 Advanced Media Handling
- **Videos** 📹
  - YouTube embeds (with video ID extraction)
  - Vimeo embeds
  - HTML5 video elements
  - Multiple source formats
  
- **Audio** 🔊
  - Audio player links
  - Multiple audio source formats
  
- **Interactive Maps** 🗺️
  - Google Maps embeds
  - Other map services
  
- **Social Media** 
  - Twitter/X posts 🐦
  - Instagram posts 📷
  
- **SVG Graphics** 📊
  - Links to SVG resources
  - Inline SVG code (collapsible)
  - Preserves titles and descriptions
  
- **Charts & Graphs** 📊
  - Data extraction when possible
  - Fallback to descriptions
  - Links to interactive visualizations
  
- **Canvas Graphics** 🎨
  - Notes presence of dynamic graphics
  - Includes dimensions and identifiers

### 📎 File Downloads
Automatically detects and labels downloadable files with appropriate icons:
- 📄 PDFs
- 📝 Documents (DOC, DOCX, TXT)
- 📊 Spreadsheets (XLS, XLSX, CSV)
- 🗜️ Archives (ZIP, RAR, 7Z)
- 🖼️ Images
- 🎬 Video files
- 🎵 Audio files

### 🛡️ Smart Features
- **Metadata Included**: Source URL and download timestamp
- **Clean Output**: Removes excessive whitespace and formatting
- **Absolute URLs**: All links converted to absolute paths
- **Error Handling**: Comprehensive error messages and validation
- **Save Dialog**: Choose your save location and filename every time
- **Filename Sanitization**: Automatically creates valid filenames

## 🚀 Installation

### Prerequisites
- Google Chrome, Microsoft Edge, or any Chromium-based browser
- Developer mode enabled in your browser

### Step-by-Step Installation

1. **Download or Clone this Repository**
   ```bash
   git clone https://github.com/yourusername/page-to-markdown.git
   cd page-to-markdown
   ```

2. **Create Extension Icons**
   
   You need three PNG icon files. You can:
   - Create them using any image editor (16x16, 48x48, 128x128 pixels)
   - Use an online icon generator like [favicon-generator.org](https://www.favicon-generator.org/)
   - Use placeholder colored squares for testing
   
   Save them as:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

3. **Load the Extension**
   
   **For Chrome/Edge:**
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the extension folder
   - The extension should now appear in your extensions list

4. **Pin the Extension** (Optional but Recommended)
   - Click the puzzle icon (🧩) in your browser toolbar
   - Find "Page to Markdown"
   - Click the pin icon (📌) to keep it visible

## 📖 Usage

### Basic Usage

1. **Navigate** to any web page you want to save
2. **Click** the "Page to Markdown" extension icon in your toolbar
3. **Click** the "Download as Markdown" button in the popup
4. **Choose** where to save the file in the save dialog
5. **Done!** Your markdown file is saved

### What Gets Converted

✅ **Works Great With:**
- Blog posts and articles
- Documentation pages
- News articles
- Wikipedia pages
- Product pages
- Any text-heavy content

⚠️ **Limited Support:**
- Heavily JavaScript-dependent single-page apps
- Dynamically loaded content (scroll through page first)
- Content behind login walls (only visible content is captured)

❌ **Cannot Convert:**
- Browser internal pages (`chrome://`, `edge://`, `about:`)
- Content in cross-domain iframes (security restriction)

### Tips for Best Results

1. **Wait for full page load** - Let all content finish loading
2. **Scroll through the page** - This loads lazy-loaded content
3. **Expand collapsed sections** - Click "Read more" buttons
4. **Close popups** - Dismiss modal windows and overlays
5. **Focus on content** - Extension prioritizes main content areas

## 📁 File Structure

```
page-to-markdown/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js           # Main conversion logic
├── background.js      # Background service worker
├── icon16.png        # Toolbar icon (16x16)
├── icon48.png        # Extension page icon (48x48)
├── icon128.png       # Chrome Web Store icon (128x128)
└── README.md         # This file
```

## 🔧 How It Works

1. **Content Extraction**: When you click the button, the extension injects a content script into the active tab
2. **HTML Parsing**: The script traverses the DOM and identifies different HTML elements
3. **Markdown Conversion**: Each element is converted to its Markdown equivalent
4. **Media Processing**: Videos, images, and other media are linked appropriately
5. **File Generation**: A markdown file is created with metadata and content
6. **Download**: Browser's download API prompts you to save the file

## 🎨 Markdown Output Format

```markdown
# Page Title

**Source:** https://example.com/article
**Downloaded:** 12/11/2025, 10:30:00 AM

---

## Article Content

Regular paragraph text with **bold** and *italic* formatting.

[Links are preserved](https://example.com)

![Images are referenced](https://example.com/image.jpg)

- Bulleted lists
- Are maintained

1. Numbered lists
2. Work too

**[📹 Video]**: [Video Title](https://youtube.com/watch?v=...)

**[📄 Download]**: [Document Name](https://example.com/file.pdf)

| Tables | Are |
| --- | --- |
| Converted | Too |
```

## 🐛 Troubleshooting

### Extension Won't Install
- **Solution**: Ensure all required files are present and Developer mode is enabled
- Validate `manifest.json` syntax using a JSON validator
- Check that all three icon files exist

### Button Doesn't Work
- **Solution**: Refresh the web page you're trying to convert
- Check you're not on a browser internal page (`chrome://`, etc.)
- Open browser console (F12) and check for errors

### Empty or Incomplete Downloads
- **Solution**: Scroll through the entire page before downloading
- Wait for all content to load completely
- Some pages use complex structures that may not convert perfectly

### Can't Access Certain Pages
- **Solution**: Extension cannot access:
  - Browser internal pages
  - Pages requiring authentication (only visible content works)
  - Content in restricted iframes

### Special Characters Look Wrong
- **Solution**: Open the file in a UTF-8 compatible text editor like VS Code or Notepad++

## 🛠️ Development

### Prerequisites
- Basic knowledge of JavaScript
- Understanding of Chrome Extension APIs
- Familiarity with HTML/DOM manipulation

### Modifying the Extension

**To change conversion behavior:**
- Edit the `elementToMarkdown()` function in `popup.js`
- Add new element handlers as needed

**To change the UI:**
- Modify `popup.html` for structure
- Update the `<style>` section for appearance

**To add new features:**
- Update `manifest.json` if new permissions are needed
- Add logic to `popup.js` for new functionality

### Testing Changes
1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test on various web pages

## 📝 Permissions Explained

The extension requires the following permissions:

- **`activeTab`**: Access the current tab's content for conversion
- **`scripting`**: Inject content script to extract page content
- **`downloads`**: Save the generated markdown file to your computer

No data is sent to external servers. All processing happens locally in your browser.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions
- Support for additional media types
- Better table conversion
- Custom styling options
- Settings panel for user preferences
- Batch conversion of multiple tabs
- Export to other formats (HTML, PDF)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- Inspired by the need for better web archiving tools
- Thanks to all contributors and users

## 📮 Support

If you encounter issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Provide details about:
   - Browser version
   - Error messages
   - URL of the page (if not private)
   - Steps to reproduce

## 🗺️ Roadmap

- [ ] Settings page for customization options
- [ ] Multiple export formats
- [ ] Batch processing of tabs
- [ ] Custom filename templates
- [ ] Image download options
- [ ] Better handling of complex layouts
- [ ] Support for more chart libraries
- [ ] Dark mode for popup interface

## 📊 Version History

### v1.0.0 (Current)
- Initial release
- Basic HTML to Markdown conversion
- Advanced media handling
- SVG support with inline code
- Downloadable file detection
- Comprehensive error handling

---

**Made with ❤️ for the web archiving community**

⭐ If you find this extension useful, please star the repository!