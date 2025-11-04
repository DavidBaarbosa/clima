/**
 * api.js — compatível com Open-Meteo (2025)
 * Fornece: getCoordinates, getWeather (atual) e get7DayForecast (diário)
 */

const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Busca coordenadas de uma cidade (nome).
 * @param {string} cityName
 * @returns {Promise<{latitude:number, longitude:number}>}
 */
export async function getCoordinates(cityName) {
  try {
    const sanitized = cityName.trim();
    const url = `${GEO_API_URL}?name=${encodeURIComponent(sanitized)}&count=1&language=pt&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar coordenadas");
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error("Cidade não encontrada");
    const { latitude, longitude } = data.results[0];
    return { latitude, longitude };
  } catch (err) {
    console.error("getCoordinates:", err);
    throw new Error("Falha ao obter coordenadas da cidade");
  }
}

/**
 * Busca dados climáticos atuais (temperature, wind, humidity)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{temperature:number, wind:number, humidity:number}>}
 */
export async function getWeather(latitude, longitude) {
  try {
    const url = `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar dados do clima");
    const data = await res.json();
    if (!data.current) throw new Error("Dados climáticos indisponíveis");
    return {
      temperature: data.current.temperature_2m,
      wind: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m
    };
  } catch (err) {
    console.error("getWeather:", err);
    throw new Error("Falha ao obter clima atual");
  }
}

/**
 * Busca previsão diária (7 dias) — retorna arrays alinhados com datas.
 * Campos retornados: date[], temp_max[], temp_min[], precipitation[], weathercode[]
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{dates:string[], temp_max:number[], temp_min:number[], precipitation:number[], weathercode:number[]}>}
 */
export async function get7DayForecast(latitude, longitude) {
  try {
    // pedimos daily fields e timezone=auto para datas localizadas
    const dailyParams = [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "weathercode"
    ].join(",");

    const url = `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&daily=${dailyParams}&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar previsão estendida");
    const data = await res.json();
    if (!data.daily) throw new Error("Previsão estendida indisponível");

    return {
      dates: data.daily.time || [],
      temp_max: data.daily.temperature_2m_max || [],
      temp_min: data.daily.temperature_2m_min || [],
      precipitation: data.daily.precipitation_sum || [],
      weathercode: data.daily.weathercode || []
    };
  } catch (err) {
    console.error("get7DayForecast:", err);
    throw new Error("Falha ao obter previsão de 7 dias");
  }
}
