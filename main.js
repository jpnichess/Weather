const apiUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=-29.1971&longitude=-51.1875&daily=sunset,sunrise,temperature_2m_max,temperature_2m_min,uv_index_max&hourly=temperature_2m,wind_speed_10m,showers,rain,wind_speed_80m,wind_speed_120m&current_weather=true&timezone=America/Sao_Paulo";

function getTempClass(temp) {
  if (temp >= 30) return "temp-hot";
  if (temp >= 25) return "temp-warm";
  if (temp >= 20) return "temp-mild";
  if (temp >= 15) return "temp-cool";
  return "temp-cold";
}

function getWeatherIcon(rain, isDay) {
  if (rain > 5) return "cloud-rain";
  if (rain > 0.5) return "cloud-sun-rain";
  return isDay ? "sun" : "moon";
}

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    const current = data.current_weather;

    document.getElementById("current-temp").textContent = current.temperature;
    document.getElementById("current-temp").className = getTempClass(
      current.temperature
    );

    const isDay = current.is_day === 1;
    document.getElementById("is-day").textContent = isDay ? "Sim" : "Não";

    const dayNightIcon = document.getElementById("day-night-icon");
    dayNightIcon.className = isDay
      ? "fas fa-sun weather-icon"
      : "fas fa-moon weather-icon";

    const hourly = data.hourly;
    const currentTime = current.time;
    const rainIndex = hourly.time.indexOf(currentTime);
    let currentRain = "0";
    if (rainIndex !== -1 && hourly.rain) {
      currentRain = hourly.rain[rainIndex] ?? "0";
    }
    document.getElementById("rain").textContent = currentRain;

    document.getElementById("wind-speed").textContent = current.wind_speed;

    const daily = data.daily;
    const dailyButtonsContainer = document.getElementById("daily-buttons");
    const dayDetails = document.getElementById("day-details");

    function formatDate(dateStr) {
      const d = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (d.toDateString() === today.toDateString()) return "Hoje";
      if (d.toDateString() === tomorrow.toDateString()) return "Amanhã";

      return d.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
      });
    }

    function formatFullDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
    }

    function showDayDetails(index) {
      document
        .querySelectorAll(".day-btn")
        .forEach((btn) => btn.classList.remove("active"));

      document.querySelectorAll(".day-btn")[index].classList.add("active");

      const date = daily.time[index];
      const tempMax = daily.temperature_2m_max[index];
      const tempMin = daily.temperature_2m_min[index];
      const sunrise = daily.sunrise[index]
        ? daily.sunrise[index].slice(11, 16)
        : "N/D";
      const sunset = daily.sunset[index]
        ? daily.sunset[index].slice(11, 16)
        : "N/D";
      const uvIndex = daily.uv_index_max[index];

      const datePrefix = date + "T";
      const rainIndex = hourly.time.findIndex((time) =>
        time.startsWith(datePrefix)
      );
      const rainValue =
        rainIndex !== -1 && hourly.rain ? hourly.rain[rainIndex] : 0;

      const weatherIcon = getWeatherIcon(rainValue, true);

      dayDetails.innerHTML = `
      <div class="details-grid">
        <div class="detail-card">
          <i class="fas fa-calendar-alt detail-icon"></i>
          <div class="detail-value">${formatFullDate(date)}</div>
          <div class="detail-label">Data</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-temperature-high detail-icon"></i>
          <div class="detail-value ${getTempClass(
            tempMax
          )}">${tempMax}°<span style="font-size: 1rem;">C</span></div>
          <div class="detail-label">Máxima</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-temperature-low detail-icon"></i>
          <div class="detail-value ${getTempClass(
            tempMin
          )}">${tempMin}°<span style="font-size: 1rem;">C</span></div>
          <div class="detail-label">Mínima</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-${weatherIcon} detail-icon"></i>
          <div class="detail-value">${rainValue}mm</div>
          <div class="detail-label">Precipitação</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-sun detail-icon"></i>
          <div class="detail-value">${uvIndex}</div>
          <div class="detail-label">Índice UV</div>
        </div>
      </div>
    `;
    }

    daily.time.forEach((date, index) => {
      const tempMax = daily.temperature_2m_max[index];
      const tempMin = daily.temperature_2m_min[index];

      const btn = document.createElement("button");
      btn.className = "day-btn";

      const datePrefix = date + "T";
      const rainIndex = hourly.time.findIndex((time) =>
        time.startsWith(datePrefix)
      );
      const rainValue =
        rainIndex !== -1 && hourly.rain ? hourly.rain[rainIndex] : 0;

      const weatherIcon = getWeatherIcon(rainValue, true);

      btn.innerHTML = `
      <i class="fas fa-${weatherIcon}"></i>
      <div class="day-name">${formatDate(date)}</div>
      <div class="day-date">${new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })}</div>
      <div class="day-temp ${getTempClass(tempMax)}">${tempMax}°</div>
      <div class="day-temp ${getTempClass(tempMin)}">${tempMin}°</div>
    `;

      btn.addEventListener("click", () => showDayDetails(index));
      dailyButtonsContainer.appendChild(btn);
    });

    if (daily.time.length > 0) {
      showDayDetails(1);
    }
  })
  .catch((err) => {
    console.error("Erro ao buscar dados do tempo:", err);
    alert("Não foi possível carregar os dados do tempo.");
  });
