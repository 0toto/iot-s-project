// Dummy function to simulate updating the gauge based on a percentage value
function updateGauge(percentage) {
    const gaugeC = document.querySelector('.gauge-c');
    const percentDisplay = document.getElementById('percent');

    percentDisplay.textContent = percentage + '%';

    const rotationAngle = percentage / 100 * 180;

    gaugeC.style.transform = `rotate(${rotationAngle}deg)`;
}

const percentageValueFromNode = 50; // Example percentage value obtained from Node.js
updateGauge(percentageValueFromNode);

function toggleAnimation() {
    var element = document.querySelector(".ceiling-container");
        //element.style.animation = 'spin 6ms linear infinite'; // this is for turn on
        element.style.animation = 'none'; // turning off the fan
}



