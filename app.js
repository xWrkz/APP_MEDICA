document.addEventListener('DOMContentLoaded', () => {
    // Datos iniciales para los gráficos y labels
let oxygenData = [97, 98, 95, 96, 97, 98, 96];
let respirationData = [16, 15, 17, 16, 14, 18, 17];
let heartRateData = [75, 80, 78, 76, 74, 79, 80];
const alarmSound = new Audio('sonido/alarma.mp3');

// Configuración de los gráficos de Chart.js
const oxygenCtx = document.getElementById('oxygenChart').getContext('2d');
const respirationCtx = document.getElementById('respirationChart').getContext('2d');
const heartRateCtx = document.getElementById('heartRateChart').getContext('2d');

// Crear los gráficos con los datos iniciales
const oxygenChart = new Chart(oxygenCtx, {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [{
            label: 'Oxígeno en sangre (%)',
            data: oxygenData,
            borderColor: 'rgba(0, 123, 255, 0.8)',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                min: 90,
                max: 100
            }
        }
    }
});

const respirationChart = new Chart(respirationCtx, {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [{
            label: 'Frecuencia Respiratoria (rpm)',
            data: respirationData,
            borderColor: 'rgba(40, 167, 69, 0.8)',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                min: 12,
                max: 20
            }
        }
    }
});

const heartRateChart = new Chart(heartRateCtx, {
    type: 'line',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [{
            label: 'Ritmo Cardiaco (bpm)',
            data: heartRateData,
            borderColor: 'rgba(220, 53, 69, 0.8)',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                min: 60,
                max: 100
            }
        }
    }
});

// Función para actualizar los valores de los labels
function updateLabels(temperature, oxygen, respiration, heartRate) {
    const tempElem = document.getElementById('temperature');
    const oxygenElem = document.getElementById('oxygen');
    const respirationElem = document.getElementById('respiration');
    const heartRateElem = document.getElementById('heart-rate');

    if (tempElem) tempElem.textContent = `${temperature} °C`;
    if (oxygenElem) oxygenElem.textContent = `${oxygen}%`;
    if (respirationElem) respirationElem.textContent = `${respiration} rpm`;
    if (heartRateElem) heartRateElem.textContent = `${heartRate} bpm`;

    // Actualizar animación del corazón
    const heartNumber = document.getElementById('heart-rate-number');
    if (heartNumber) heartNumber.textContent = heartRate;

    updateHeartAnimation(heartRate);
}


// Botón para silenciar alarma
const muteButton = document.getElementById('mute-button');

muteButton.addEventListener('click', () => {
    alarmSound.pause();
    alarmSound.currentTime = 0; // Reinicia el sonido
    muteButton.style.display = 'none'; // Esconde el botón tras silenciar
});

let alarmMuted = false; // Estado del silencio de la alarma
// Reproducir la alarma
function playAlarm() {
    const alarmSound = document.getElementById('alarm-sound');
    alarmSound.loop = true;
    alarmSound.play();
}


// Detener la alarma
function stopAlarm() {
    const alarmSound = document.getElementById('alarm-sound');
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

// Controlar el botón de silencio
function toggleAlarmMute() {
    alarmMuted = !alarmMuted;
    const muteButton = document.getElementById('mute-button');
    muteButton.textContent = alarmMuted ? "Reactivar Alarma" : "Silenciar Alarma";

    if (alarmMuted) {
        stopAlarm(); // Asegurarse de que la alarma se detenga si está silenciada
    }
}

function checkHealthStatus(temperature, oxygen, respiration, heartRate) {
    let status = "Estable";

    if (temperature < 36.5 || temperature > 37.5 || oxygen < 95 || respiration < 12 || respiration > 20 || heartRate < 60 || heartRate > 100) {
        status = "No Estable";
    }

    const healthStatusElement = document.getElementById('health-status');
    healthStatusElement.textContent = status;

    if (status === "No Estable") {
        healthStatusElement.style.color = "red";
        if (!alarmMuted) playAlarm(); // Asegúrate de que esta función sea llamada
    } else {
        healthStatusElement.style.color = "green";
        stopAlarm();
    }
}


// Función para actualizar los gráficos
function updateCharts(oxygen, respiration, heartRate) {
    oxygenChart.data.datasets[0].data.push(oxygen);
    respirationChart.data.datasets[0].data.push(respiration);
    heartRateChart.data.datasets[0].data.push(heartRate);

    // Mantener solo los últimos 10 datos
    if (oxygenChart.data.datasets[0].data.length > 10) oxygenChart.data.datasets[0].data.shift();
    if (respirationChart.data.datasets[0].data.length > 10) respirationChart.data.datasets[0].data.shift();
    if (heartRateChart.data.datasets[0].data.length > 10) heartRateChart.data.datasets[0].data.shift();

    // Actualizar los gráficos
    oxygenChart.update();
    respirationChart.update();
    heartRateChart.update();
}


// Animar el corazón según el ritmo cardíaco
function updateHeartAnimation(heartRate) {
    const heart = document.getElementById('heart');
    let animationSpeed = 1; // Velocidad normal
    if (heartRate < 60) animationSpeed = 2; // Más lento (bradicardia)
    else if (heartRate > 100) animationSpeed = 0.5; // Más rápido (taquicardia)
    heart.style.animationDuration = `${animationSpeed}s`;
}

// Conexión al servidor MQTT privado de HiveMQ
const brokerUrl = 'wss://5d4df63fd1494e8c915c2501ed374e7e.s1.eu.hivemq.cloud:8884/mqtt'; // Usando WebSocket (wss://)
const username = "Wrkz";
const password = "Wrkz...";

// Crear el cliente MQTT usando MQTT.js
const client = mqtt.connect(brokerUrl, {
    username: username,
    password: password,
    reconnectPeriod: 1000,
    clientId: 'clientId-' + Math.random().toString(36).substr(2, 9) // Generar un clientId único
});

// Estado de la conexión
const connectionText = document.getElementById('connection-text');

// Evento de conexión
client.on('connect', () => {
    console.log('Conectado al servidor MQTT de HiveMQ');
    connectionText.textContent = 'Conectado';
    client.subscribe('snTemp');
    client.subscribe('snSpo2');
    client.subscribe('snPul');
    client.subscribe('snFR');
});

// Manejar errores y desconexión
client.on('error', (err) => {
    console.error('Error en la conexión:', err);
    connectionText.textContent = 'No Conectado';
});

client.on('close', () => {
    connectionText.textContent = 'No Conectado';
});

// Evento de recepción de mensajes
client.on('message', (topic, message) => {
    const payload = parseFloat(message.toString());
    console.log(`Mensaje recibido en el topic ${topic}: ${payload}`);

    let temperature = parseFloat(document.getElementById('temperature').textContent) || 0;
    let oxygen = parseFloat(document.getElementById('oxygen').textContent) || 0;
    let respiration = parseFloat(document.getElementById('respiration').textContent) || 0;
    let heartRate = parseFloat(document.getElementById('heart-rate').textContent) || 0;

    if (topic === "snTemp") {
        temperature = payload;
    } else if (topic === "snSpo2") {
        oxygen = payload;
    } else if (topic === "snFR") {
        respiration = payload;
    } else if (topic === "snPul") {
        heartRate = payload;
    }

    // Actualizar los labels
    updateLabels(temperature, oxygen, respiration, heartRate);

    // Actualizar el estado de salud
    checkHealthStatus(temperature, oxygen, respiration, heartRate);

    // Actualizar gráficos
    updateCharts(oxygen, respiration, heartRate);
});

});
