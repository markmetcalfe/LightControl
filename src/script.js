var io = require('socket.io-client');
window.io = io;

let colorMap, minBrightness, maxBrightness, powerIsOn, brightness, color;
let btnsCreated = false;

let socket = io.connect({path:window.location.pathname+'socket.io'});
socket.on('connect', function(data) {
  socket.emit('join');
});

socket.on('state', function(data) {
  colorMap = data.colors;
  color = data.color;
  btnsCreated ? false : initButtons();

  data.power == "On" ? turnOn() : turnOff();

  updateColor(data.color);

  minBrightness = data.min_brightness;
  maxBrightness = data.max_brightness;
  updateBrightness(data.brightness);

  if(data.error_msg)
    showToast(data.error_msg);
});

function initButtons(){
  let bbox = document.getElementById("colorButtons");
  colorMap.forEach(color => {
    let btn = document.createElement("button");
    btn.style = "background-color:#"+color.hex;
    btn.onclick = () => { setColor(color); }
    bbox.appendChild(btn);
  });

  document.getElementById("powerButton").onclick = () => toggle();
  document.getElementById("showLive").childNodes[0].onclick = () => showLive();

  let upBtn = document.createElement("button");
  upBtn.innerText = "+";
  upBtn.onclick = () => setBrightness("brighter");
  bbox.insertBefore(upBtn, bbox.childNodes[2]);

  let downBtn = document.createElement("button");
  downBtn.innerText = "-";
  downBtn.onclick = () => setBrightness("dim");
  bbox.insertBefore(downBtn, bbox.childNodes[0]);

  btnsCreated = true;
}

function setColor(newcolor) {
  socket.emit('update', {
    "color": newcolor
  });
}

function updateColor(newcolor) {
  let text = document.getElementById("color");
  if(powerIsOn){
    text.style = "color:#"+newcolor.hex;
    text.innerText = newcolor.name;
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#"+newcolor.hex);
  } else {
    text.style = "color:red";
    text.innerText = "Off";
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#000000");
  }
  fadeColor();
}

function setBrightness(Button) {
  if(Button == "dim")            brightness = brightness>minBrightness ? brightness-1 : minBrightness;
  else if(Button == "brighter")  brightness = brightness<maxBrightness ? brightness+1 : maxBrightness;
  else if(Button == "brightest") brightness = maxBrightness;
  else if(Button == "darkest")   brightness = minBrightness;
  socket.emit('update', {
    "brightness": brightness
  });
}

function updateBrightness(newbrightness) {
  brightness = newbrightness;
  let text = document.getElementById("brightness");
  if(powerIsOn){
    let c = blendColors("#000000", "#FFFF33", 0.5+(0.1*brightness));
    text.style = "color:"+c;
    text.innerText = brightness;
  } else {
    text.style = "color:red";
    text.innerText = "Off";
  }
  fadeColor();
}

function toggle(){ 
  socket.emit('update', {
    "power": (powerIsOn ? "Off":"On")
  });
}

function turnOff(){
  powerIsOn = false;
  fadeColor();

  let status = document.getElementById("power");
  status.classList.remove("On");
  status.classList.add("Off");
  status.innerText = "Off";

  let button = document.getElementById("powerButton");
  button.innerText = "On";
  button.classList.remove("Off");
  button.classList.add("On");
}

function turnOn(){
  powerIsOn = true;
  fadeColor();
  
  let status = document.getElementById("power");
  status.classList.remove("Off");
  status.classList.add("On");
  status.innerText = "On";

  let button = document.getElementById("powerButton");
  button.innerText = "Off";
  button.classList.remove("On");
  button.classList.add("Off");
  
  updateBrightness(brightness);
  updateColor(color, colorMap[color]);
}

function fadeColor() {
  if(powerIsOn){
    document.body.classList.remove("dark");
    document.body.style.backgroundColor = blendColors("#000000", blendColors("#"+color.hex, "#FFFFFF", 0.75), 0.5 + (brightness * 0.1));
  } else {
    document.body.classList.add("dark");
    document.body.style.backgroundColor = null;
  }
}

var live = false;
function showLive(){
  if(!live){
    document.body.classList.add("live");
    document.body.style.backgroundColor = null;
    document.body.style.backgroundImage = "url('https://markmetcalfe.io/light/camera/')";
    document.getElementById("showLive").childNodes[0].childNodes[0].innerHTML = 'Stop Stream';
    live = true;
  } else {
    document.body.classList.remove("live");
    document.body.style.backgroundImage = null;
    fadeColor();
    document.getElementById("showLive").childNodes[0].childNodes[0].innerHTML = '<i></i>View Live';
    live = false;
  }
}

/* 
 * Taken from http://stackoverflow.com/posts/13542669/revisions
 */
function blendColors(c0, c1, p) {
  let f = parseInt(c0.slice(1), 16),
      t = parseInt(c1.slice(1), 16),
      R1 = f >> 16,
      G1 = f >> 8 & 0x00FF,
      B1 = f & 0x0000FF,
      R2 = t >> 16,
      G2 = t >> 8 & 0x00FF,
      B2 = t & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
}

function showToast(text){
  let toast = document.createElement("div");
  toast.classList += "toast";
  toast.innerHTML = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.parentNode.removeChild(toast), 2000);
}