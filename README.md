# My Wishlist Application

A clean, efficient wishlist management application with Dropbox integration.

## Performance Improvements

This application has been completely rewritten from an obfuscated version to improve performance and maintainability.

### File Size Reduction
- **Before**: 448 KB (single obfuscated file)
- **After**: 31 KB total (18 KB HTML + 13 KB JavaScript)
- **Reduction**: 93% smaller

### Key Improvements

1. **Removed JavaScript Obfuscation**
   - Original code was heavily obfuscated making it slow to parse
   - Browsers couldn't optimize the code
   - Impossible to debug or maintain

2. **Separated Concerns**
   - HTML, CSS, and JavaScript are now properly separated
   - `index.html` - Structure and styles
   - `app.js` - Application logic

3. **Clean, Readable Code**
   - Well-commented and organized
   - Easy to understand and maintain
   - Follows modern JavaScript best practices

4. **Performance Benefits**
   - Faster page load times (93% less data to download)
   - Faster JavaScript parsing
   - Better browser optimization
   - Improved runtime performance

## Features

- 📝 Wishlist item management (add, delete, view)
- 🔐 Admin authentication with PIN
- 🎨 Dark/Light theme toggle
- 🔍 Search and filter functionality
- 📱 Responsive design
- ☁️ Dropbox integration for data storage
- 📦 Category organization
- 💰 Price tracking

## Setup

### Security Configuration (IMPORTANT!)

Before deploying, you MUST configure security settings:

1. **Set your Dropbox credentials** in `app.js`:
   ```javascript
   const DROPBOX_CONFIG = {
       CLIENT_ID: 'your_actual_client_id_here',
       REDIRECT_URI: window.location.origin + window.location.pathname,
       FILE_PATH: '/wishlist.json'
   };
   ```

2. **Set a secure admin PIN** in `app.js`:
   ```javascript
   const SECRET_PIN = 'your_secure_pin_here'; // Use a strong PIN
   ```
   
   ⚠️ **WARNING**: The default values are empty for security. Do not commit your actual credentials to a public repository.

3. Open `index.html` in a web browser

### Known Limitations

- File upload feature requires additional Dropbox API implementation (currently URL-based images only)
- PIN-based authentication is basic; consider implementing OAuth or more robust authentication for production use

## Browser Support

Works in all modern browsers that support ES6+:
- Chrome/Edge 60+
- Firefox 54+
- Safari 11+

## License

Personal use only.
