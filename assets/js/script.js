/* ./assets/js/script.js */
const apiKey = '64ef5d8094c2e3e0ad74384e0f191188';
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');
const searchHistoryEl = document.getElementById('search-history');

const fetchCoordinates = (city) => {
    return fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) throw new Error('City not found');
            return { lat: data[0].lat, lon: data[0].lon };
        });
};

const fetchWeatherData = (city) => {
    fetchCoordinates(city)
        .then(({ lat, lon }) => {
            return fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        })
        .then(response => response.json())
        .then(data => {
            const current = data.current;
            const icon = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
            currentWeatherEl.innerHTML = `
                <h3>${city} (${new Date(current.dt * 1000).toLocaleDateString()})</h3>
                <img src="${icon}" alt="${current.weather[0].description}">
                <p>Temperature: ${current.temp} °C</p>
                <p>Humidity: ${current.humidity}%</p>
                <p>Wind Speed: ${current.wind_speed} m/s</p>
            `;

            forecastEl.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const forecast = data.daily[i];
                const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
                const forecastCard = document.createElement('div');
                forecastCard.classList.add('weather-card');
                forecastCard.innerHTML = `
                    <h4>${new Date(forecast.dt * 1000).toLocaleDateString()}</h4>
                    <img src="${icon}" alt="${forecast.weather[0].description}">
                    <p>Temp: ${forecast.temp.day} °C</p>
                    <p>Wind: ${forecast.wind_speed} m/s</p>
                    <p>Humidity: ${forecast.humidity}%</p>
                `;
                forecastEl.appendChild(forecastCard);
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
};

cityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        if (!Array.from(searchHistoryEl.children).some(li => li.textContent === city)) {
            const li = document.createElement('li');
            li.textContent = city;
            li.addEventListener('click', () => fetchWeatherData(city));
            searchHistoryEl.appendChild(li);
        }
        fetchWeatherData(city);
        cityInput.value = '';
    }
});

searchHistoryEl.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        fetchWeatherData(event.target.textContent);
    }
});

// Initial load for predefined cities
['Atlanta', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio'].forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => fetchWeatherData(city));
    searchHistoryEl.appendChild(li);
});

// Load Atlanta weather data by default
fetchWeatherData('Atlanta');
