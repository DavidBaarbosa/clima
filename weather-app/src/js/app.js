/**
 * app.js — versão com Previsão Estendida (7 dias)
 */

import { getCoordinates, getWeather, get7DayForecast } from "./api.js";

/* Cache simples */
const CITY_CACHE = {};
const CITY_LIST = ["São Paulo", "Rio de Janeiro", "Curitiba", "Salvador", "Porto Alegre"];

/* Seletors */
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const errorBox = document.querySelector("#error-message");
const weatherContainer = document.querySelector("#weather-card-container");
const forecast7dContainer = document.querySelector("#forecast-7d");
const hotList = document.querySelector("#hot-list");
const coldList = document.querySelector("#cold-list");
const windList = document.querySelector("#rain-list");

/* Util: mapeia weathercode para ícone e descrição simples */
function mapWeatherCode(code) {
  // Simplificado para ícones Font Awesome (não cobre todos os códigos)
  if (code === 0) return { icon: "☀️", text: "Céu limpo" };
  if (code >= 1 && code <= 3) return { icon: "⛅", text: "Parcialmente nublado" };
  if (code >= 45 && code <= 48) return { icon: "🌫️", text: "Nevoeiro" };
  if (code >= 51 && code <= 67) return { icon: "🌧️", text: "Chuva leve" };
  if (code >= 71 && code <= 77) return { icon: "❄️", text: "Neve" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", text: "Chuva" };
  if (code >= 95 && code <= 99) return { icon: "⛈️", text: "Tempestade" };
  return { icon: "☁️", text: "Nublado" };
}

/* UI helpers */
function showError(message) {
  console.warn("ERRO:", message);
  errorBox.textContent = message;
  errorBox.style.display = "block";
  setTimeout(() => (errorBox.style.display = "none"), 5000);
}

function showLoadingMain() {
  weatherContainer.innerHTML = `<p class="placeholder-text">Carregando dados...</p>`;
  forecast7dContainer.innerHTML = `<p class="placeholder-text">Carregando previsão estendida...</p>`;
}

/* renderiza previsão atual (card único) */
function renderWeather(city, weather) {
  weatherContainer.innerHTML = "";

  const card = document.createElement("div");
  card.className = "weather-card";
  card.innerHTML = `
    <div class="weather-header">
      <h3 class="weather-city">${city}</h3>
      <p class="weather-temp">${weather.temperature.toFixed(1)}°C</p>
      <p class="weather-condition">💨 ${weather.wind.toFixed(1)} km/h • 💧 ${weather.humidity.toFixed(1)}%</p>
    </div>
  `;
  weatherContainer.appendChild(card);
}

/* renderiza os 7 cards de forecast */
function render7DayForecast(daily) {
  // daily: { dates[], temp_max[], temp_min[], precipitation[], weathercode[] }
  forecast7dContainer.innerHTML = "";
  if (!daily || !daily.dates || daily.dates.length === 0) {
    forecast7dContainer.innerHTML = `<p class="placeholder-text">Previsão não disponível.</p>`;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "forecast-grid";

  for (let i = 0; i < daily.dates.length && i < 7; i++) {
    const date = daily.dates[i];
    const max = daily.temp_max[i];
    const min = daily.temp_min[i];
    const precip = daily.precipitation[i];
    const code = daily.weathercode[i];

    const map = mapWeatherCode(code);

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="forecast-date">${new Date(date).toLocaleDateString()}</div>
      <div class="forecast-icon" title="${map.text}">${map.icon}</div>
      <div class="forecast-temps">
        <span class="max">↑ ${max.toFixed(1)}°C</span>
        <span class="min">↓ ${min.toFixed(1)}°C</span>
      </div>
      <div class="forecast-precip">☔ ${precip.toFixed(1)} mm</div>
    `;
    grid.appendChild(card);
  }

  forecast7dContainer.appendChild(grid);
}

/* ranking (hot, cold, wind) */
function updateRankings() {
  const entries = Object.entries(CITY_CACHE);
  if (entries.length === 0) return;

  const sortedByTemp = [...entries].sort((a, b) => b[1].temperature - a[1].temperature);
  const sortedByWind = [...entries].sort((a, b) => b[1].wind - a[1].wind);

  hotList.innerHTML = "";
  coldList.innerHTML = "";
  windList.innerHTML = "";

  sortedByTemp.slice(0, 5).forEach(([city, data]) => {
    hotList.innerHTML += `<li>${city}: ${data.temperature.toFixed(1)}°C</li>`;
  });

  sortedByTemp.slice(-5).reverse().forEach(([city, data]) => {
    coldList.innerHTML += `<li>${city}: ${data.temperature.toFixed(1)}°C</li>`;
  });

  const windy = sortedByWind.filter(([_, d]) => d.wind > 15).slice(0, 5);
  if (windy.length === 0) {
    windList.innerHTML = `<li>Nenhuma cidade com ventos fortes no momento.</li>`;
  } else {
    windy.forEach(([city, d]) => {
      windList.innerHTML += `<li>${city}: ${d.wind.toFixed(1)} km/h</li>`;
    });
  }
}

/* busca principal: atual + 7 dias */
async function searchAndRenderCity(cityName) {
  try {
    const sanitized = cityName.trim().replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    if (!sanitized) return showError("Digite o nome de uma cidade válida.");

    showLoadingMain();

    // se já estiver no cache, só renderiza (mas ainda tenta 7d se não houver)
    let coords = null;
    try {
      coords = await getCoordinates(sanitized);
    } catch (err) {
      throw new Error("Cidade não encontrada");
    }

    // fetch atual + 7 dias em paralelo
    const [weather, daily] = await Promise.all([
      getWeather(coords.latitude, coords.longitude),
      get7DayForecast(coords.latitude, coords.longitude)
    ]);

    CITY_CACHE[sanitized] = weather;

    renderWeather(sanitized, weather);
    render7DayForecast(daily);
    updateRankings();
  } catch (err) {
    console.error("searchAndRenderCity:", err);
    showError(err.message || "Erro ao buscar dados do clima.");
    // limpar carregamento visual se falhar
    if (weatherContainer) weatherContainer.innerHTML = `<p class="placeholder-text">Nenhum dado disponível.</p>`;
    if (forecast7dContainer) forecast7dContainer.innerHTML = `<p class="placeholder-text">Previsão indisponível.</p>`;
  }
}

/* inicialização carregando cidades padrão */
async function initApp() {
  hotList.innerHTML = "<li>Carregando...</li>";
  coldList.innerHTML = "<li>Carregando...</li>";
  windList.innerHTML = "<li>Carregando...</li>";
  forecast7dContainer.innerHTML = `<p class="placeholder-text">A previsão estendida aparecerá quando carregar as cidades iniciais.</p>`;

  for (const city of CITY_LIST) {
    try {
      await searchAndRenderCity(city);
      // pequena espera para evitar bombardear a API (educado)
      await new Promise(res => setTimeout(res, 200));
    } catch (err) {
      console.warn(`Falha ao carregar ${city}:`, err);
    }
  }
}

/* eventos */
searchBtn.addEventListener("click", () => {
  const city = cityInput.value;
  searchAndRenderCity(city);
  cityInput.value = "";
});
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchAndRenderCity(cityInput.value);
    cityInput.value = "";
  }
});

/* start */
initApp();
