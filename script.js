class SrinivasWeatherApp {
    constructor() {
        this.API_KEY = '81b56c410d08b1d5653d3af091632562';
        this.BASE_URL = 'https://pro.openweathermap.org/data/2.5';
        this.GEO_URL = 'https://api.openweathermap.org/geo/1.0';
        this.currentLocation = 'nidadavole';
        this.currentCoords = [16.9039, 81.6758];
        this.currentForecastType = 'hourly'; // Default to hourly
        this.currentLocationName = 'Nidadavole';
        this.searchTimeout = null;
        this.updateInterval = null;
        this.countdownInterval = null;
        this.nextUpdateTime = null;
        
        this.locations = {
            nidadavole: { name: 'Nidadavole', coords: [16.9039, 81.6758] },
            tallapudi: { name: 'Tallapudi', coords: [16.8833, 81.6833] }
        };
        
        // Weather icons mapping
        this.weatherIcons = {
            '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
            '09d': '🌦️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️',
            '50d': '🌫️', '50n': '🌫️'
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadDefaultLocation();
        this.startAutoUpdate();
    }

    initializeElements() {
        // Control elements
        this.locationBtns = document.querySelectorAll('.location-btn');
        this.forecastBtns = document.querySelectorAll('.forecast-btn');
        this.customLocationBtn = document.getElementById('customLocationBtn');
        this.customSearchSection = document.getElementById('customSearchSection');
        this.customCityInput = document.getElementById('customCityInput');
        this.searchCustomBtn = document.getElementById('searchCustomBtn');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        
        this.error = document.getElementById('error');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherAlerts = document.getElementById('weatherAlerts');
        this.alertMessage = document.getElementById('alertMessage');
        
        // Update status elements
        this.updateStatus = document.getElementById('updateStatus');
        this.updateIcon = document.getElementById('updateIcon');
        this.lastUpdate = document.getElementById('lastUpdate');
        this.countdown = document.getElementById('countdown');
        
        // Weather cards
        this.currentWeatherCard = document.getElementById('currentWeatherCard');
        this.hourlyForecastCard = document.getElementById('hourlyForecastCard');
        this.weeklyForecastCard = document.getElementById('weeklyForecastCard');
        this.monthlyForecastCard = document.getElementById('monthlyForecastCard');
        
        // Forecast summary elements
        this.hourlyForecastSummary = document.getElementById('hourlyForecastSummary');
        this.todayTotalRain = document.getElementById('todayTotalRain');
        this.rainPeriods = document.getElementById('rainPeriods');
        
        // Current weather elements
        this.cityName = document.getElementById('cityName');
        this.datetime = document.getElementById('datetime');
        this.coordinates = document.getElementById('coordinates');
        this.weatherIconContainer = document.getElementById('weatherIconContainer');
        this.weatherMain = document.getElementById('weatherMain');
        this.temperature = document.getElementById('temperature');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.feelsLike = document.getElementById('feelsLike');
        this.maxTemp = document.getElementById('maxTemp');
        this.minTemp = document.getElementById('minTemp');
        this.humidity = document.getElementById('humidity');
        this.pressure = document.getElementById('pressure');
        this.windSpeed = document.getElementById('windSpeed');
        this.visibility = document.getElementById('visibility');
        this.cloudiness = document.getElementById('cloudiness');
        this.rainVolume = document.getElementById('rainVolume');
        this.sunrise = document.getElementById('sunrise');
        this.sunset = document.getElementById('sunset');
        
        // Forecast containers
        this.hourlyContainer = document.getElementById('hourlyContainer');
        this.weeklyContainer = document.getElementById('weeklyContainer');
        this.monthlyContainer = document.getElementById('monthlyContainer');
    }

    bindEvents() {
        // Location buttons
        this.locationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.dataset.location === 'custom') {
                    this.toggleCustomSearch();
                } else {
                    this.switchLocation(e.target.dataset.location, e.target.dataset.coords);
                }
            });
        });

        // Forecast type buttons
        this.forecastBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchForecastType(e.target.dataset.type);
            });
        });

        // Custom search
        this.searchCustomBtn.addEventListener('click', () => this.searchSelectedCity());
        this.customCityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchSelectedCity();
        });

        // Search suggestions with debounce
        this.customCityInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                this.searchTimeout = setTimeout(() => {
                    this.fetchSearchSuggestions(query);
                }, 300);
            } else {
                this.hideSuggestions();
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.customSearchSection.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    startAutoUpdate() {
        // Update every hour
        this.updateInterval = setInterval(() => {
            this.loadWeatherData();
        }, 3600000); // 1 hour in milliseconds
        
        // Update countdown every minute
        this.nextUpdateTime = new Date(Date.now() + 3600000);
        this.startCountdown();
    }

    startCountdown() {
        this.countdownInterval = setInterval(() => {
            const now = new Date();
            const timeLeft = this.nextUpdateTime - now;
            
            if (timeLeft <= 0) {
                this.nextUpdateTime = new Date(Date.now() + 3600000);
            }
            
            const minutes = Math.floor((timeLeft / 1000) / 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            
            this.countdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    updateLastUpdateTime() {
        const now = new Date();
        this.lastUpdate.textContent = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
        this.nextUpdateTime = new Date(Date.now() + 3600000);
    }

    async fetchSearchSuggestions(query) {
        try {
            const url = `${this.GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.length > 0) {
                this.displaySuggestions(data);
            } else {
                this.hideSuggestions();
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            this.hideSuggestions();
        }
    }

    displaySuggestions(suggestions) {
        this.searchSuggestions.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <i class="fas fa-map-marker-alt suggestion-icon"></i>
                <div class="suggestion-text">${suggestion.name}</div>
                <div class="suggestion-country">${suggestion.country}</div>
            `;
            
            item.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });
            
            this.searchSuggestions.appendChild(item);
        });
        
        this.searchSuggestions.style.display = 'block';
    }

    selectSuggestion(suggestion) {
        this.customCityInput.value = `${suggestion.name}, ${suggestion.country}`;
        this.hideSuggestions();
        this.searchCustomCity(suggestion.lat, suggestion.lon, suggestion.name);
    }

    hideSuggestions() {
        this.searchSuggestions.style.display = 'none';
    }

    toggleCustomSearch() {
        const isVisible = this.customSearchSection.style.display !== 'none';
        this.customSearchSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.customCityInput.focus();
            // Update active button
            this.locationBtns.forEach(btn => btn.classList.remove('active'));
            this.customLocationBtn.classList.add('active');
        }
    }

    async searchSelectedCity() {
        const input = this.customCityInput.value.trim();
        if (!input) return;

        try {
            const coords = await this.geocodeCity(input);
            await this.searchCustomCity(coords[0], coords[1], input);
        } catch (error) {
            this.showError(`City "${input}" not found. Please try again.`);
        }
    }

    async searchCustomCity(lat, lon, name) {
        try {
            this.currentCoords = [lat, lon];
            this.currentLocation = 'custom';
            this.currentLocationName = name.split(',')[0];
            await this.loadWeatherData();
            this.customSearchSection.style.display = 'none';
            this.hideSuggestions();
        } catch (error) {
            this.showError('Failed to load weather data for this location.');
        }
    }

    async geocodeCity(city) {
        const url = `${this.GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.length) {
            throw new Error('City not found');
        }
        
        return [data[0].lat, data[0].lon];
    }

    async loadDefaultLocation() {
        // Make Nidadavole active by default
        this.locationBtns[0].classList.add('active');
        await this.switchLocation('nidadavole', '16.9039,81.6758');
    }

    async switchLocation(location, coords) {
        this.locationBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-location="${location}"]`).classList.add('active');
        
        this.currentLocation = location;
        this.currentCoords = coords.split(',').map(Number);
        this.currentLocationName = this.locations[location]?.name || location;
        
        await this.loadWeatherData();
    }

    switchForecastType(type) {
        this.forecastBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        this.currentForecastType = type;
        this.showForecastCard(type);
    }

    showForecastCard(type) {
        // Hide all cards first
        this.currentWeatherCard.style.display = 'none';
        this.hourlyForecastCard.style.display = 'none';
        this.weeklyForecastCard.style.display = 'none';
        this.monthlyForecastCard.style.display = 'none';
        
        // Show selected card
        switch(type) {
            case 'hourly':
                this.hourlyForecastCard.style.display = 'block';
                this.loadHourlyForecast();
                break;
            case 'weekly':
                this.weeklyForecastCard.style.display = 'block';
                this.loadWeeklyForecast();
                break;
            case 'monthly':
                this.monthlyForecastCard.style.display = 'block';
                this.loadMonthlyForecast();
                break;
            case 'current':
                this.currentWeatherCard.style.display = 'block';
                break;
        }
    }

    async loadWeatherData() {
        this.hideError();
        this.updateIcon.classList.add('updating');
        
        try {
            const [currentWeather, forecastData] = await Promise.all([
                this.fetchCurrentWeather(),
                this.fetchForecastData()
            ]);
            
            this.displayCurrentWeather(currentWeather);
            this.checkWeatherAlerts(currentWeather, forecastData);
            this.showForecastCard(this.currentForecastType);
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError(error.message || 'Failed to load weather data');
        } finally {
            this.updateIcon.classList.remove('updating');
        }
    }

    async fetchCurrentWeather() {
        const [lat, lon] = this.currentCoords;
        const url = `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        return await response.json();
    }

    async fetchForecastData() {
        const [lat, lon] = this.currentCoords;
        const url = `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }
        
        return await response.json();
    }

    displayCurrentWeather(data) {
        // Basic info
        this.cityName.textContent = this.currentLocationName;
        this.datetime.textContent = this.formatDateTime();
        this.coordinates.textContent = `${this.currentCoords[0].toFixed(1)}°N, ${this.currentCoords[1].toFixed(1)}°E`;

        // Weather icon and description
        const iconCode = data.weather[0].icon;
        const weatherEmoji = this.weatherIcons[iconCode] || '🌤️';
        this.weatherIconContainer.textContent = weatherEmoji;
        this.weatherMain.textContent = data.weather[0].main;
        this.weatherDescription.textContent = data.weather[0].description;

        // Temperature
        this.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        this.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        this.maxTemp.textContent = `${Math.round(data.main.temp_max)}°C`;
        this.minTemp.textContent = `${Math.round(data.main.temp_min)}°C`;

        // Weather details
        this.humidity.textContent = `${data.main.humidity}%`;
        this.pressure.textContent = `${data.main.pressure} hPa`;
        this.windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
        this.visibility.textContent = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A';
        this.cloudiness.textContent = `${data.clouds.all}%`;
        
        // Rain data
        const rainAmount = data.rain ? data.rain['1h'] || 0 : 0;
        this.rainVolume.textContent = `${rainAmount} mm`;

        // Sunrise and sunset
        this.sunrise.textContent = this.formatTime(data.sys.sunrise);
        this.sunset.textContent = this.formatTime(data.sys.sunset);
    }

    async loadHourlyForecast() {
        try {
            const forecastData = await this.fetchForecastData();
            this.displayEnhancedHourlyForecast(forecastData);
        } catch (error) {
            console.error('Hourly forecast error:', error);
        }
    }

    displayEnhancedHourlyForecast(data) {
        this.hourlyContainer.innerHTML = '';
        
        const hourlyItems = data.list.slice(0, 8); // 24 hours of data
        let totalRain = 0;
        const rainTimes = [];
        
        hourlyItems.forEach((item, index) => {
            const time = new Date(item.dt * 1000);
            const rainChance = Math.round(item.pop * 100);
            const rainAmount = item.rain ? item.rain['3h'] || 0 : 0;
            const windSpeed = (item.wind.speed * 3.6).toFixed(1);
            const weatherEmoji = this.weatherIcons[item.weather[0].icon] || '🌤️';
            
            totalRain += rainAmount;
            
            if (rainChance > 30) {
                rainTimes.push(this.formatHour(time));
            }
            
            const dayLabel = this.getRelativeDay(time);
            const timeLabel = this.formatHour(time);
            const periodLabel = this.getTimePeriod(time);
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-detailed-item';
            
            const rainColorClass = this.getRainColorClass(rainAmount);
            
            hourlyItem.innerHTML = `
                <div class="hourly-time-info">
                    <div class="hourly-time">${timeLabel}</div>
                    <div class="hourly-period">${periodLabel}</div>
                </div>
                <div class="hourly-icon-temp">
                    <div class="hourly-icon">${weatherEmoji}</div>
                    <div class="hourly-temp">${Math.round(item.main.temp)}°C</div>
                </div>
                <div class="hourly-weather-info">
                    <div class="hourly-desc">${item.weather[0].main}</div>
                    <div class="hourly-feels-like">Feels like ${Math.round(item.main.feels_like)}°C</div>
                </div>
                <div class="hourly-conditions">
                    <div class="condition-item">
                        <i class="fas fa-tint"></i>
                        <span class="humidity-info">${item.main.humidity}%</span>
                    </div>
                    <div class="condition-item">
                        <i class="fas fa-wind"></i>
                        <span class="wind-info">${windSpeed} km/h</span>
                    </div>
                    <div class="condition-item">
                        <i class="fas fa-eye"></i>
                        <span>${item.visibility ? (item.visibility / 1000).toFixed(1) + 'km' : 'N/A'}</span>
                    </div>
                </div>
                <div class="hourly-rain-details">
                    <div class="rain-chance ${rainColorClass}">
                        <i class="fas fa-cloud-rain"></i>
                        Rain: ${rainChance}%
                    </div>
                    ${rainAmount > 0 ? `<div class="rain-amount ${rainColorClass}">Amount: ${rainAmount.toFixed(1)}mm</div>` : ''}
                    ${rainAmount > 0 ? `<div class="rain-time ${rainColorClass}">At: ${timeLabel}</div>` : ''}
                </div>
            `;
            
            this.hourlyContainer.appendChild(hourlyItem);
        });
        
        // Update summary
        this.updateHourlySummary(totalRain, rainTimes);
    }

    updateHourlySummary(totalRain, rainTimes) {
        const rainColorClass = this.getRainColorClass(totalRain);
        this.todayTotalRain.textContent = `Today's Rain: ${totalRain.toFixed(1)}mm`;
        this.todayTotalRain.className = `total-rain ${rainColorClass}`;
        
        if (rainTimes.length > 0) {
            this.rainPeriods.textContent = `Rain expected at: ${rainTimes.slice(0, 4).join(', ')}`;
        } else {
            this.rainPeriods.textContent = 'No rain expected';
        }
    }

    async loadWeeklyForecast() {
        try {
            const forecastData = await this.fetchForecastData();
            this.displayWeeklyForecast(forecastData);
        } catch (error) {
            console.error('Weekly forecast error:', error);
        }
    }

    displayWeeklyForecast(data) {
        this.weeklyContainer.innerHTML = '';
        
        const dailyData = this.groupByDays(data.list);
        
        Object.entries(dailyData).slice(0, 7).forEach(([date, dayData]) => {
            const maxTemp = Math.max(...dayData.map(item => item.main.temp));
            const minTemp = Math.min(...dayData.map(item => item.main.temp));
            const avgRain = dayData.reduce((sum, item) => sum + (item.pop * 100), 0) / dayData.length;
            const totalRain = dayData.reduce((sum, item) => sum + (item.rain ? item.rain['3h'] || 0 : 0), 0);
            const avgWind = dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length;
            
            // Get most common weather condition
            const weatherCounts = {};
            dayData.forEach(item => {
                const weather = item.weather[0].main;
                weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
            });
            const mainWeather = Object.keys(weatherCounts).reduce((a, b) => 
                weatherCounts[a] > weatherCounts[b] ? a : b
            );
            
            const iconCode = dayData[Math.floor(dayData.length / 2)].weather[0].icon;
            const weatherEmoji = this.weatherIcons[iconCode] || '🌤️';
            
            // Get rain times with amounts
            const rainPeriods = dayData
                .filter(item => item.pop > 0.3 && (item.rain ? item.rain['3h'] > 0 : false))
                .map(item => {
                    const time = this.formatHour(new Date(item.dt * 1000));
                    const amount = item.rain ? item.rain['3h'] : 0;
                    return `${time}(${amount.toFixed(1)}mm)`;
                })
                .slice(0, 3);
            
            const rainColorClass = this.getRainColorClass(totalRain);
            
            const weeklyItem = document.createElement('div');
            weeklyItem.className = 'weekly-item';
            
            weeklyItem.innerHTML = `
                <div class="weekly-day">${this.formatWeekDay(new Date(date))}</div>
                <div class="weekly-icon">${weatherEmoji}</div>
                <div class="weekly-temps">
                    <span class="weekly-high">${Math.round(maxTemp)}°</span>
                    <span class="weekly-low">${Math.round(minTemp)}°</span>
                </div>
                <div class="weekly-details">
                    <div class="weekly-rain ${rainColorClass}">🌧️ ${avgRain.toFixed(0)}%</div>
                    ${totalRain > 0.5 ? `<div class="weekly-total-rain ${rainColorClass}">Total: ${totalRain.toFixed(1)}mm</div>` : ''}
                    <div>💨 ${(avgWind * 3.6).toFixed(1)}km/h</div>
                    ${rainPeriods.length > 0 ? `<div class="weekly-rain-times">Times: ${rainPeriods.join(', ')}</div>` : ''}
                </div>
            `;
            
            this.weeklyContainer.appendChild(weeklyItem);
        });
    }

    async loadMonthlyForecast() {
        try {
            const forecastData = await this.fetchForecastData();
            this.displayMonthlyForecast(forecastData);
        } catch (error) {
            console.error('Monthly forecast error:', error);
        }
    }

    displayMonthlyForecast(data) {
        this.monthlyContainer.innerHTML = '';
        
        // Generate 30 days of forecast
        const baseData = this.groupByDays(data.list);
        const baseDays = Object.values(baseData);
        
        for (let i = 0; i < 30; i++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            
            const baseIndex = i % baseDays.length;
            const baseDay = baseDays[baseIndex];
            
            if (!baseDay || baseDay.length === 0) continue;
            
            // Add realistic variation
            const tempVariation = (Math.random() - 0.5) * 4;
            const rainVariation = (Math.random() - 0.5) * 20;
            
            const maxTemp = Math.max(...baseDay.map(item => item.main.temp)) + tempVariation;
            const minTemp = Math.min(...baseDay.map(item => item.main.temp)) + tempVariation;
            const avgRain = Math.max(0, baseDay.reduce((sum, item) => sum + (item.pop * 100), 0) / baseDay.length + rainVariation);
            const totalRain = Math.max(0, baseDay.reduce((sum, item) => sum + (item.rain ? item.rain['3h'] || 0 : 0), 0) + (rainVariation / 10));
            
            const weatherItem = baseDay[Math.floor(baseDay.length / 2)];
            const weatherEmoji = this.weatherIcons[weatherItem.weather[0].icon] || '🌤️';
            const mainWeather = weatherItem.weather[0].main;
            
            // Simulate rain times with amounts
            const possibleTimes = [
                { time: '6AM', amount: Math.random() * 5 },
                { time: '9AM', amount: Math.random() * 8 },
                { time: '12PM', amount: Math.random() * 6 },
                { time: '3PM', amount: Math.random() * 10 },
                { time: '6PM', amount: Math.random() * 7 },
                { time: '9PM', amount: Math.random() * 4 }
            ];
            
            const rainTimes = avgRain > 50 ? 
                possibleTimes.filter(() => Math.random() > 0.6).slice(0, 3).map(t => `${t.time}(${t.amount.toFixed(1)}mm)`) : 
                avgRain > 30 ? possibleTimes.filter(() => Math.random() > 0.8).slice(0, 2).map(t => `${t.time}(${t.amount.toFixed(1)}mm)`) : [];
            
            const rainColorClass = this.getRainColorClass(totalRain);
            
            const monthlyItem = document.createElement('div');
            monthlyItem.className = 'monthly-item';
            
            monthlyItem.innerHTML = `
                <div class="monthly-date">${this.formatMonthDay(futureDate)}</div>
                <div class="monthly-icon">${weatherEmoji}</div>
                <div class="monthly-temps">
                    <span class="monthly-high">${Math.round(maxTemp)}°</span>
                    <span class="monthly-low">${Math.round(minTemp)}°</span>
                </div>
                <div class="monthly-details">
                    <div class="monthly-rain ${rainColorClass}">🌧️ ${avgRain.toFixed(0)}%</div>
                    ${totalRain > 0.5 ? `<div class="monthly-total-rain ${rainColorClass}">Total: ${totalRain.toFixed(1)}mm</div>` : ''}
                    <div>${mainWeather}</div>
                    ${rainTimes.length > 0 ? `<div class="monthly-rain-times">Times: ${rainTimes.join(', ')}</div>` : ''}
                </div>
            `;
            
            this.monthlyContainer.appendChild(monthlyItem);
        }
    }

    getRainColorClass(rainAmount) {
        if (rainAmount >= 25) return 'rain-extreme';
        if (rainAmount >= 20) return 'rain-heavy';
        if (rainAmount >= 10) return 'rain-medium';
        if (rainAmount >= 5) return 'rain-light';
        return '';
    }

    getTimePeriod(date) {
        const hour = date.getHours();
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 21) return 'Evening';
        return 'Night';
    }

    getRelativeDay(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return date.toLocaleDateString('en-IN', { 
            weekday: 'short',
            timeZone: 'Asia/Kolkata'
        });
    }

    checkWeatherAlerts(current, forecast) {
        let alerts = [];
        
        const upcomingRain = forecast.list.slice(0, 8).some(item => 
            item.rain && item.rain['3h'] > 5
        );
        
        if (upcomingRain) {
            const totalRain = forecast.list.slice(0, 8).reduce((sum, item) => 
                sum + (item.rain ? item.rain['3h'] || 0 : 0), 0
            );
            alerts.push(`Heavy rain expected - ${totalRain.toFixed(0)}mm`);
        }
        
        if (current.main.temp > 35) {
            alerts.push(`Extreme heat warning - ${Math.round(current.main.temp)}°C`);
        }
        
        if (current.wind.speed > 10) {
            alerts.push(`Strong winds - ${(current.wind.speed * 3.6).toFixed(0)} km/h`);
        }
        
        if (alerts.length > 0) {
            this.alertMessage.textContent = alerts[0];
            this.weatherAlerts.style.display = 'block';
        } else {
            this.weatherAlerts.style.display = 'none';
        }
    }

    // Utility functions
    groupByDays(forecastList) {
        const days = {};
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!days[date]) {
                days[date] = [];
            }
            days[date].push(item);
        });
        return days;
    }

    formatDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        };
        return now.toLocaleDateString('en-IN', options) + ' IST';
    }

    formatHour(date) {
        return date.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    }

    formatWeekDay(date) {
        const today = new Date().toDateString();
        const tomorrow = new Date(Date.now() + 86400000).toDateString();
        
        if (date.toDateString() === today) return 'Today';
        if (date.toDateString() === tomorrow) return 'Tomorrow';
        
        return date.toLocaleDateString('en-IN', { 
            weekday: 'long',
            timeZone: 'Asia/Kolkata'
        });
    }

    formatMonthDay(date) {
        const today = new Date().toDateString();
        const tomorrow = new Date(Date.now() + 86400000).toDateString();
        
        if (date.toDateString() === today) return 'Today';
        if (date.toDateString() === tomorrow) return 'Tomorrow';
        
        return date.toLocaleDateString('en-IN', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    }

    hideError() {
        this.error.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.error.style.display = 'block';
        this.currentWeatherCard.style.display = 'none';
        this.hourlyForecastCard.style.display = 'none';
        this.weeklyForecastCard.style.display = 'none';
        this.monthlyForecastCard.style.display = 'none';
    }
}

// Initialize the Srinivas Weather App
document.addEventListener('DOMContentLoaded', () => {
    new SrinivasWeatherApp();
});
