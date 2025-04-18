const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const currentLocationBtn = document.querySelector('.current-location-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.tem-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-data-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = '414f410134e10bd202c8fa80e708fe3c';

// Search weather by city
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = '';
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = '';
    }
});

// Get weather icon based on the condition
function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.svg';
    if (id >= 300 && id <= 321) return 'drizzle.svg';
    if (id >= 500 && id <= 531) return 'rain.svg';
    if (id >= 600 && id <= 622) return 'snow.svg';
    if (id >= 701 && id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    if (id >= 801 && id <= 804) return 'clouds.svg';
    return 'default.svg';
}

// Get current date formatted
function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return currentDate.toLocaleDateString('en-GB', options);
}

// Update weather info based on city
async function updateWeatherInfo(city) {
    try {
        const weatherData = await getFetchData('weather', city);
        const {
            name: cityName,
            main: { temp, humidity },
            weather: [{ id, main }],
            wind: { speed },
        } = weatherData;

        countryTxt.textContent = cityName;
        tempTxt.textContent = `${Math.round(temp)} °C`;
        conditionTxt.textContent = main;
        humidityValueTxt.textContent = `${humidity}%`;
        windValueTxt.textContent = `${speed} m/s`;
        currentDateTxt.textContent = getCurrentDate();
        weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

        await updateForecastInfo(city);
        showDisplaySection(weatherInfoSection);
    } catch (error) {
        console.error(error);
        showDisplaySection(notFoundSection);
    }
}

// Fetch weather data from API
async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
}

// Update forecast info
async function updateForecastInfo(city) {
    try {
        const forecastData = await getFetchData('forecast', city);
        const today = new Date(); // Get the current date

        // Clear the forecast items container before adding new items
        forecastItemsContainer.innerHTML = '';

        // Loop through each forecast item in the data
        forecastData.list.forEach((forecast) => {
            const forecastDate = new Date(forecast.dt_txt); // Convert forecast date to a Date object

            // Check if the forecast is for 12:00 PM and is for a future date
            if (forecastDate.getHours() === 12 && forecastDate.toDateString() !== today.toDateString()) {
                // Destructure the needed data from the forecast
                const { dt_txt: date, weather: [{ id }], main: { temp } } = forecast;

                // Format the forecast date for display (e.g., "27 Dec")
                const dateFormatted = forecastDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                });

                // Create a forecast item HTML structure
                const forecastItem = `
                    <div class="forecast-item">
                        <h5 class="forecast-item-date regular-txt">${dateFormatted}</h5>
                        <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" />
                        <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
                    </div>
                `;

                // Append the forecast item to the container
                forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
            }
        });
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}


// Show the correct section
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(
        (sec) => (sec.style.display = 'none')
    );
    section.style.display = 'flex';
}

// Get weather by current location
async function getWeatherByLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

        try {
            const response = await fetch(weatherApiUrl);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const weatherData = await response.json();

            // Extract weather data
            const {
                name: cityName,
                main: { temp, humidity },
                weather: [{ id, main }],
                wind: { speed },
            } = weatherData;

            // Update UI with weather data
            countryTxt.textContent = cityName;
            tempTxt.textContent = `${Math.round(temp)} °C`;
            conditionTxt.textContent = main;
            humidityValueTxt.textContent = `${humidity}%`;
            windValueTxt.textContent = `${speed} m/s`;
            currentDateTxt.textContent = getCurrentDate();
            weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

            // Fetch and update the forecast data for the current location
            await updateForecastInfo(cityName);
            showDisplaySection(weatherInfoSection);

        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }, (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check location settings.");
    });
}

// Event listener for current location button
currentLocationBtn.addEventListener('click', getWeatherByLocation);







