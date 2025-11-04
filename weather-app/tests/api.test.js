/**
 * api.test.js
 * 
 * Testes automatizados do Seu Clima
 * 
 * 🧪 Executar com: npm test
 */

import { getCoordinates, getWeather } from "../src/js/api.js";

describe("Funções de API", () => {
  test("getCoordinates retorna latitude e longitude válidas para São Paulo", async () => {
    const result = await getCoordinates("São Paulo");
    expect(result).toHaveProperty("latitude");
    expect(result).toHaveProperty("longitude");
    expect(typeof result.latitude).toBe("number");
    expect(typeof result.longitude).toBe("number");
  }, 10000);

  test("getWeather retorna temperatura numérica válida para coordenadas de São Paulo", async () => {
    const temp = await getWeather(-23.55, -46.63);
    expect(typeof temp).toBe("number");
  }, 10000);
});
