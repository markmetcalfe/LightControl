const path = require('path');
const express = require('express');
const sun = require('sun-time');
const schedule = require('node-schedule');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'client')));

const config = require('./config.json');

const power = ["Off", "On"];

let power_on = false;
let current_brightness = config.max_brightness;
let current_color = config.colors.DEFAULT;

const error_codes = [
    false,
    "Light Isn't On",
    "Outside of Operating Hours",
    "Invalid Color"
];
let error = 0;

const timer_schedule = schedule.scheduleJob('0 * * * *', setPower(timer()) );

function getState(){
    return {
        "power": power[power_on?1:0],
        "brightness": current_brightness,
        "color": current_color,
        "hex": config.colors[current_color],
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

function setPower(state){
    power_on = state === power[1];
}

function setBrightness(state){
    if(power_on){
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
        if(config.colors.hasOwnProperty(state))
            current_color = state;
        else
            error = 3;
    } else
        error = 1;
}

app.get('/set', (req, res) => {
    if(timer()){
        if(req.query.power)      setPower(req.query.power);
        if(req.query.brightness) setBrightness(req.query.brightness);
        if(req.query.color)      setColor(req.query.color);
    }
    res.json(getState());
});

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