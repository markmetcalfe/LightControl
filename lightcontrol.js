const path = require('path');
const express = require('express');
const request = require('request');
const sun = require('sun-time');
const schedule = require('node-schedule');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'build')));

const config = require('./config.json');

const power = ["Off", "On"];

let power_on = true;
let current_brightness = config.max_brightness;
let current_color = config.colors[config.colors.length-1];

const error_codes = [
  false,
  "Light Isn't On",
  "Outside of Operating Hours",
  "Invalid Color"
];
let error = 0;

const timer_schedule = schedule.scheduleJob('0 * * * *', function(){ setPower(timer()?"On":"Off"); } );

function getState(){
  return {
    "power": power[power_on?1:0],
    "brightness": current_brightness,
    "color": current_color,
    "colors": config.colors,
    "min_brightness": config.min_brightness,
    "max_brightness": config.max_brightness,
    "error_msg": error_codes[error]
  };
}

function timer(){
  if(config.timer){
    let current_hour = new Date().getHours();
    if(current_hour < config.earliest_time || current_hour > config.latest_time 
      && config.earliest_time != 0 && config.latest_time != 0 ){
        error = 2;
        return false;
        }

    if(config.location[0] != 0 && config.location[1] != 0){
      let sunrise = sun.rise(config.location[0], config.location[1]);
      let sunset = sun.set(config.location[0], config.location[1]);
      if(current_hour < sunrise || current_hour > sunset){
        error = 2;
        return false;
      }
    }
  }
  error = 0;
  return true;
}

function sendCommand(command){
  request({
    uri: config.command_url,
    body: JSON.stringify({ "command": command }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function setPower(state){
  sendCommand(state);
  power_on = state === power[1];
}

function setBrightness(state){
  if(power_on){
    if(state < config.min_brightness)
      state = config.min_brightness;
    else if(state > config.max_brightness)
      state = config.max_brightness;
    
    let delta = state - current_brightness;
    if(delta>0){
      for(let i=0; i<delta; i++) sendCommand("Up");
    } else if(delta<0){
      for(let i=0; i<(-delta); i++) sendCommand("Down");
    }

    if(state >= config.min_brightness && state <= config.max_brightness)
      current_brightness = state;
    else if(state < config.min_brightness)
      current_brightness = config.min_brightness;
    else if(state > config.max_brightness)
      current_brightness = config.max_brightness;
  } else
    error = 1;
}

function setColor(state){
  if(power_on){
    let found_color = false;
    config.colors.forEach(color => {
      if(state.name === color.name){
        sendCommand(state.name);
        current_color = state;
        found_color = true;
      }
    });
    if(!found_color) error = 3;
  } else
    error = 1;
}

io.on('connection', function(client) { 
  client.on('join', function() {
    error = 0;
    client.emit('state', getState());
  });
  client.on('update', function(data){
    if(timer()){
      if(data.power)      setPower(data.power);
      if(data.brightness) setBrightness(data.brightness);
      if(data.color)      setColor(data.color);
    }
    client.emit('state', getState());
    error = 0;
    client.broadcast.emit('state', getState());
  })
});

server.listen(8002);