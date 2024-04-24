//import sqlite
const sqlite3 = require('sqlite3').verbose();


var bulb  = document.querySelector("#bulb");
var switchButton = document.querySelector("button")

var current = 0;

switchButton.addEventListener("click", ()=>{
    if (current == 0){
        switchButton.innerHTML = "OFF",
        switchButton.style.padding = "20px 7.5px"
        bulb.style.backgroundColor = "yellow"
        current = 1;
    }else{
        switchButton.innerHTML = "ON",
        switchButton.style.padding = "20px 12px"
        bulb.style.backgroundColor = "grey"
        current = 0;
    }
})

var slider = document.getElementById("mySlider");
  slider.value = 30;
var output = document.getElementById("output");
// need to have a event listener when the light change
  output.value = slider.value;

//database code
const db = new sqlite3.Database('dataBase.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS data (user_id INTEGER, name TEXT, tempareture INTEGER, humidity INTEGER, light_int INTEGER)');
});


//code of the previous phase
function updateGauge(percentage) {
  const gaugeC = document.querySelector('.gauge-c');
  const percentDisplay = document.getElementById('percent');

  percentDisplay.textContent = percentage + '%';

  const rotationAngle = percentage / 100 * 180;

  gaugeC.style.transform = `rotate(${rotationAngle}deg)`;
}

const percentageValueFromNode = 50; 
updateGauge(percentageValueFromNode);

function toggleAnimation() {
  var element = document.querySelector(".ceiling-container");
      element.style.animation = 'none'; // turning off the fan
}



