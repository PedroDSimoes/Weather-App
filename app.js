let map;

const apiKey1 = "YOUR_OPENWEATHERMAP_API_KEY_HERE";

function loadMapScenario() {      //default map loading
  map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
    center: new Microsoft.Maps.Location(47.60357, -122.3295),
    zoom: 10
  });
}     

function showLocationOnMap(latitude, longitude) {
  // Create a pushpin marker at the specified location, to be used in the functions
  const location = new Microsoft.Maps.Location(latitude, longitude);
  const pushpin = new Microsoft.Maps.Pushpin(location);

  // Add the pushpin marker to the map
  map.entities.clear();
  map.entities.push(pushpin);

  // Set the map center and zoom level to the specified location
  map.setView({ center: location, zoom: 9 });
}

// Global variable to keep track of the unit of measurement
let units = 'metric';

function getWeather() {     // First function
  const city = document.getElementById("city").value;
  
  // Construct the API URL with the appropriate unit of measurement
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey1}&units=metric`;

  fetch(apiUrl)           // All the necessary api data
    .then(response => response.json())
    .then(data => {
      const latitude = data.coord.lat;
      const longitude = data.coord.lon;
      const weather = data.weather[0].main;
      const temp = data.main.temp;
      const tempMin = data.main.temp_min;
      const tempMax = data.main.temp_max;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const iconCode = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;
      const iconImg = document.createElement("img");
      iconImg.setAttribute("src", iconUrl);
      
      // Display the weather data with the appropriate unit of measurement
      const unitSymbol = units === 'metric' ? '°C' : '°F';
      const tempDisplay = units === 'metric' ? temp : (temp * (9/5) + 32).toFixed(1);
      const tempMinDisplay = units === 'metric' ? tempMin : (tempMin * (9/5) + 32).toFixed(1);
      const tempMaxDisplay = units === 'metric' ? tempMax : (tempMax * (9/5) + 32).toFixed(1);
      document.getElementById("weather").innerHTML = `Weather: ${weather}<br>Temperature: ${tempDisplay}${unitSymbol}(min ${tempMinDisplay}${unitSymbol}, max ${tempMaxDisplay}${unitSymbol})<br>Humidity: ${humidity}%<br>Wind Speed: ${windSpeed} m/s`;
      document.getElementById("weather").appendChild(iconImg);
      showLocationOnMap(latitude, longitude);   // Call the showLocationOnMap function to display the location on the map
    })
    .catch(error => {   // Error handling
      document.getElementById("weather").innerHTML = "Error: Unable to get weather data.";
    });

}

  function getForecast() {    // Forecast function
    // Get the user's input
    const city = document.getElementById("city").value;
  
    // Construct the API URL
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey1}&units=metric`;
    // Make the API call
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
         // Get the latitude and longitude of the city from the data object
      const latitude = data.city.coord.lat;
      const longitude = data.city.coord.lon;

      // Call the showLocationOnMap function to display the location on the map
      showLocationOnMap(latitude, longitude);
        // Group the forecast data by date
        const forecastsByDate = {};
        data.list.forEach(forecast => {
          const forecastDate = new Date(forecast.dt * 1000);
          const forecastDateString = forecastDate.toDateString();
          if (!forecastsByDate[forecastDateString]) {
            forecastsByDate[forecastDateString] = [];
          }
          forecastsByDate[forecastDateString].push(forecast);
        });
  
        // Display the forecast data, correct units
        let forecastHtml = "";
        Object.entries(forecastsByDate).forEach(([dateString, forecasts]) => {
          const date = new Date(dateString);
          const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
          forecastHtml += `
            <div class="forecast-item">
              <div class="forecast-date">${weekday}</div>
              <div class="forecast-details">
                ${forecasts.map(forecast => {
                  const forecastWeather = forecast.weather[0].main;
                  const forecastTemp = forecast.main.temp;
                  const forecastIconCode = forecast.weather[0].icon;
                  const forecastIconUrl = `https://openweathermap.org/img/w/${forecastIconCode}.png`;
                  const unitSymbol = units === 'metric' ? '°C' : '°F';
                  const forecastTempDisplay = units === 'metric' ? forecastTemp : (forecastTemp * (9/5) + 32).toFixed(1);
                  return `
                  
                    <div class="forecast-time">${new Date(forecast.dt * 1000).toLocaleTimeString()}</div>
                    <div class="forecast-icon"><img src="${forecastIconUrl}" alt="${forecastWeather} icon"></div>
                    <div class="forecast-weather">${forecastWeather}</div>
                    <div class="forecast-temp">${forecastTempDisplay}${unitSymbol}</div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        });
        document.getElementById("forecast").innerHTML = forecastHtml;
      })
      .catch(error => {
        // Display an error message if the API call fails
        document.getElementById("forecast").innerHTML = "Error: Unable to get forecast data.";
      });

  }
  

  function switchUnit() {     // Not how it's supposed to be but I can't figure it out
    units = units === 'metric' ? 'imperial' : 'metric';
    getWeather();
    getForecast();
}

function clearForecast() {    //Clear forecast
  document.getElementById("forecast").innerHTML = "";
}