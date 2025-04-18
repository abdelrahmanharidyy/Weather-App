async function getWeather() {
    const city = document.getElementById('cityInput').value;
    const apiKey = 'YOUR_API_KEY'; // Replace with your real API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();

        const weatherInfo = `
            <h2>${data.name}</h2>
            <p>${data.weather[0].main}</p>
            <p>${data.main.temp}°C</p>
        `;
        document.getElementById('weatherInfo').innerHTML = weatherInfo;
    } catch (error) {
        document.getElementById('weatherInfo').innerHTML = `<p>City not found</p>`;
    }
}
