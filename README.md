# Weather Dashboard

A beautiful, responsive weather application using the OpenWeatherMap Pro API.

## Features

🌤️ **Real-time Weather Data** - Get current weather information for any city worldwide  
🎨 **Beautiful UI Design** - Modern glass morphism design with smooth animations  
📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices  
🔍 **Smart Search** - Search by city name with quick-access buttons for popular cities  
📊 **Comprehensive Data** - Temperature, humidity, pressure, wind, visibility, and more  
🌅 **Sunrise/Sunset Times** - Complete with local time formatting  
⚡ **Fast Loading** - Optimized for quick data retrieval and display  

## Quick Start

1. **Open the app:**
   ```bash
   # Simply open index.html in your browser
   open index.html
   
   # Or use a local server (recommended):
   python -m http.server 8000
   # Then visit: http://localhost:8000
   ```

2. **Start using:**
   - Enter any city name in the search box
   - Click on quick-access city buttons
   - View detailed weather information instantly

## API Configuration

This app uses the OpenWeatherMap Pro API with the following endpoint:
- **Base URL:** `https://pro.openweathermap.org/data/2.5/weather`
- **API Key:** `81b56c410d08b1d5653d3af091632562`

### Changing the API Key

To use your own API key, edit the `script.js` file:

```javascript
this.API_KEY = 'YOUR_NEW_API_KEY_HERE';
```

## File Structure

```
weather-app/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling and responsive design
├── script.js       # JavaScript functionality and API integration
├── package.json    # Project configuration (optional)
└── README.md       # This file
```

## Browser Support

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Customization

### Adding New Cities
Edit the quick-access buttons in `index.html`:

```html
<button class="quick-city" data-city="YourCity,CountryCode">Your City</button>
```

### Changing Color Scheme
Modify the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #0984e3;
    --secondary-color: #74b9ff;
    --accent-color: #00b894;
}
```

## API Rate Limits

- **Pro API:** 1,000 calls/day included
- **Recommended:** Cache responses for 10 minutes per location
- **Best Practice:** Implement request throttling for production use

## Troubleshooting

### Common Issues

1. **"Failed to fetch" error:**
   - Check your internet connection
   - Verify API key is correct
   - Ensure you're using HTTPS for production

2. **City not found:**
   - Try different city name formats
   - Include country code: "London,UK"
   - Check for typos

3. **Slow loading:**
   - Use a local server instead of file://
   - Check network connection
   - Consider implementing caching

### Security Notes

- Keep your API key secure
- Don't commit API keys to public repositories
- Use environment variables in production
- Consider using a backend proxy for API calls

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Created with vanilla HTML, CSS, and JavaScript

---

**Enjoy your weather dashboard! 🌤️**
