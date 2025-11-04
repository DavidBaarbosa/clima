# 🌦️ Seu Clima - App de Previsão do Tempo Dinâmico

Este é um projeto de aplicação web para visualização de previsão do tempo, apresentando dados atuais, previsão estendida de 7 dias e rankings de cidades (mais quentes, mais frias, e com mais vento), utilizando o design moderno e responsivo do **ClimaTempo**.

---

## ⚙️ Funcionalidades Principais

| Recurso | Descrição |
| :--- | :--- |
| **Previsão Atual** | Exibe temperatura, velocidade do vento e umidade da cidade pesquisada. |
| **Previsão Estendida** | Apresenta a previsão diária (máxima/mínima, precipitação e condição do tempo) para os próximos 7 dias em um formato de cartões visuais e organizados em *grid*. |
| **Ranking de Cidades** | Listagem Top 5 das cidades mais quentes, mais frias e com ventos mais fortes, carregadas na inicialização. |
| **Busca Dinâmica** | Permite buscar qualquer cidade (via API de Geocodificação). |
| **Design Responsivo** | Adapta-se perfeitamente a dispositivos móveis e desktops. |

---

## 💻 Estrutura do Projeto

O projeto é dividido em quatro arquivos principais que gerenciam a estrutura, o estilo, a lógica de negócio e a interação com as APIs.

### `index.html`

**Comentários sobre a Seção:**
> Este é o arquivo principal que define a **estrutura** da aplicação. Ele inclui o *header* (com o logo e a busca), três seções principais (`Previsão Atual`, `Previsão Estendida - 7 dias`, e `Ranking de Cidades`), e o *footer*. O código JavaScript (`app.js`) e os estilos (`style.css`) são linkados aqui. Os elementos de previsão são inicialmente preenchidos com *placeholders* e depois injetados dinamicamente pelo JavaScript.

### `src/css/style.css`

**Comentários sobre a Seção:**
> Contém todos os estilos CSS para a aplicação, utilizando **Variáveis CSS** para padronização de cores (`--primary-blue`, `--hot-color`, etc.) e garantindo um tema moderno e coeso. O arquivo é totalmente **responsivo** (abordagem *Mobile First*).
>
> **Destaque:** Foram adicionados estilos para as classes `.forecast-grid` e `.forecast-card` (cartões de previsão estendida) para transformar a antiga lista em um visual de grade moderno, com *shadows* e transições de *hover*, conforme aprimoramento mais recente.

### `src/js/api.js`

**Comentários sobre a Seção:**
> Este módulo é responsável pela **comunicação com as APIs externas** (Open-Meteo para Clima e Geocodificação). Ele isola toda a lógica de *fetch* e tratamento de URLs, tornando o `app.js` mais limpo.
>
> **Funções Exportadas:**
> 1.  `getCoordinates(cityName)`: Busca latitude e longitude.
> 2.  `getWeather(lat, lon)`: Busca dados climáticos atuais (temperatura, vento, umidade).
> 3.  `get7DayForecast(lat, lon)`: Busca dados diários (máx/mín, precipitação, *weathercode*).
>
> Todos os métodos incluem `try...catch` para tratamento de erros.

### `src/js/app.js`

**Comentários sobre a Seção:**
> O coração da lógica da aplicação. Este módulo importa as funções da `api.js`, gerencia o estado da UI e manipula o DOM.
>
> **Pontos Chave:**
> * **`CITY_CACHE`:** Um cache simples para armazenar dados de cidades buscadas, utilizados para alimentar os rankings.
> * **`mapWeatherCode(code)`:** Função utilitária para converter os códigos numéricos da API em ícones e descrições amigáveis (Emojis ☀️, 🌧️, etc.).
> * **`renderWeather(city, weather)`:** Injeta a previsão atual no `weather-card-container`.
> * **`render7DayForecast(daily)`:** Responsável por criar e injetar a nova grade (`.forecast-grid`) de cartões de previsão estendida, exibindo a data, ícone e temperaturas.
> * **`updateRankings()`:** Processa os dados do cache para gerar e renderizar as listas de Top 5 (Quentes, Frias, Ventania).
> * **`searchAndRenderCity(cityName)`:** Função principal de busca, que coordena as chamadas de API (em paralelo com `Promise.all`), armazena no cache e renderiza todas as seções.
> * **`initApp()`:** Inicializa o app carregando uma lista de cidades pré-definidas (`CITY_LIST`) para popular os rankings na abertura da página.

---

## 🚀 Como Executar

1.  **Clone o repositório:** (Assumindo que este código está em um repositório git)
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd [pasta_do_projeto]
    ```
2.  **Abra o arquivo:** Abra o arquivo `index.html` em seu navegador.
3.  **Use um Servidor Local (Recomendado):** Para evitar problemas de CORS e garantir o funcionamento de módulos JS (`type="module"`), é altamente recomendado usar uma extensão de servidor local (como *Live Server* no VS Code) ou um servidor HTTP simples.
