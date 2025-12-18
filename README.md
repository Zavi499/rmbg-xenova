# Background Remover - Xenova Modnet WordPress Plugin

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![WordPress](https://img.shields.io/badge/WordPress-5.0%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A privacy-focused WordPress plugin that removes image backgrounds using AI, powered by the Xenova/Modnet model. All processing happens directly in the user's browser - no server uploads, no privacy concerns!

## ✨ Features

- **🔒 Privacy First**: All image processing happens client-side in the browser
- **🚀 Smart Caching**: Model is cached using IndexedDB after first download (~40MB)
- **⚡ Fast Processing**: Reuses loaded model for multiple images without reloading
- **📥 Easy Download**: One-click download of processed images in PNG format
- **🎨 Modern UI**: Beautiful, responsive interface with smooth animations
- **📊 Progress Tracking**: Real-time progress bars for model loading and image processing
- **📱 Mobile Friendly**: Fully responsive design works on all devices
- **♿ Accessible**: WCAG compliant with keyboard navigation support
- **🌙 Dark Mode**: Automatic dark mode support based on user preference

## 🎯 Use Cases

- **Photography Websites**: Let visitors remove backgrounds from their photos
- **E-commerce Sites**: Help sellers create clean product images
- **Design Services**: Offer free background removal as a lead magnet
- **Portfolio Sites**: Showcase your AI/ML capabilities
- **Membership Sites**: Add value with premium tools

## 📋 Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Modern browser with JavaScript enabled (Chrome, Firefox, Safari, Edge)
- User's browser must support WebAssembly and IndexedDB

## 🚀 Installation

### Method 1: Manual Installation

1. Download the plugin files or clone this repository:
   ```bash
   git clone https://github.com/Zavi499/rmbg-xenova.git
   ```

2. Upload the `rmbg-xenova` folder to your WordPress `/wp-content/plugins/` directory

3. Activate the plugin through the 'Plugins' menu in WordPress

4. Add the shortcode `[rmbg_xenova]` to any page or post where you want the background remover to appear

### Method 2: Upload via WordPress Admin

1. Download the plugin as a ZIP file
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin" and choose the ZIP file
4. Click "Install Now" and then "Activate"

## 📖 Usage

### Basic Usage

Simply add the shortcode to any page or post:

```
[rmbg_xenova]
```

### Shortcode Parameters

Customize the appearance with optional parameters:

```
[rmbg_xenova title="Remove Background" max_width="800px"]
```

**Available Parameters:**

- `title` (string): Custom title for the tool (default: "AI Background Remover")
- `max_width` (string): Maximum width of the container (default: "800px")

### Example Implementations

**Full Width Page:**
```
[rmbg_xenova max_width="100%"]
```

**Custom Title:**
```
[rmbg_xenova title="Free Background Removal Tool"]
```

**Landing Page:**
```
[rmbg_xenova title="Professional Background Remover" max_width="1200px"]
```

## 🎨 How It Works

1. **First Visit**: User clicks to upload an image
2. **Model Download**: AI model downloads to browser (~40MB, cached for future visits)
3. **Image Upload**: User selects or drags & drops an image
4. **Processing**: AI processes the image entirely in the browser
5. **Results**: Side-by-side comparison of original and processed image
6. **Download**: User can download the result as PNG with transparent background

### Technical Details

- **Model**: Xenova/Modnet (MODNet architecture)
- **Processing**: Client-side using Transformers.js
- **Caching**: Model files cached in IndexedDB
- **Output**: PNG with alpha channel (transparent background)
- **Supported Formats**: JPG, PNG, WebP input

## 🔧 Customization

### Styling

All styles are contained in `/assets/css/rmbg-style.css`. You can customize:

- Colors (CSS variables in `:root`)
- Layout and spacing
- Animation speeds
- Responsive breakpoints

Example of customizing colors in your theme:

```css
.rmbg-xenova-container {
    --rmbg-primary: #your-color;
    --rmbg-secondary: #your-color;
}
```

### Translations

The plugin is translation-ready. Text domain: `rmbg-xenova`

To translate:
1. Use tools like Poedit or Loco Translate
2. Look for strings wrapped in translation functions
3. Create `.po` and `.mo` files for your language

## 🎯 Performance

### First-Time Load
- Model download: ~40MB (one-time)
- Download time: 5-30 seconds (depending on connection)
- Processing time: 2-5 seconds per image

### Subsequent Visits
- Model load: Instant (from IndexedDB cache)
- Processing time: 2-5 seconds per image

### Optimization Tips
- Use on dedicated landing pages to avoid loading on every page
- Consider adding the shortcode only where needed
- The plugin automatically enqueues scripts only on pages with the shortcode

## 🔒 Privacy & Security

- **No Server Uploads**: Images never leave the user's browser
- **No Data Collection**: Plugin doesn't track or store any user data
- **No External API Calls**: After initial model download, works completely offline
- **GDPR Compliant**: No personal data processing
- **Model Source**: Uses official Xenova/Modnet model from Hugging Face

## 🐛 Troubleshooting

### Model Won't Load

**Problem**: Model fails to download or load
**Solutions**:
- Check browser console for errors
- Ensure browser supports WebAssembly
- Clear IndexedDB cache and try again
- Check internet connection for first-time download

### Image Processing Fails

**Problem**: Image uploads but processing fails
**Solutions**:
- Try a smaller image (< 5MB recommended)
- Ensure image format is supported (JPG, PNG, WebP)
- Check browser console for memory errors
- Try in a different browser

### Performance Issues

**Problem**: Slow processing or browser lag
**Solutions**:
- Close other browser tabs to free up memory
- Use smaller images (resize before upload)
- Clear browser cache and reload
- Update to latest browser version

### Shortcode Not Working

**Problem**: Shortcode displays as text
**Solutions**:
- Ensure plugin is activated
- Check for JavaScript errors in console
- Verify WordPress version compatibility
- Try disabling other plugins for conflicts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 1.0.0 (2024)
- Initial release
- Client-side background removal using Xenova/Modnet
- IndexedDB caching for model persistence
- Modern responsive UI
- Progress tracking for model loading and processing
- Download functionality
- Drag & drop support
- Mobile-friendly design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Xenova/Transformers.js](https://github.com/xenova/transformers.js) - For making ML models accessible in the browser
- [MODNet](https://github.com/ZHKKKe/MODNet) - For the original model architecture
- [Hugging Face](https://huggingface.co/Xenova/modnet) - For hosting the model

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Zavi499/rmbg-xenova/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zavi499/rmbg-xenova/discussions)

## 🌟 Show Your Support

If you find this plugin helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with others

---

Made with ❤️ for the WordPress and AI community
