const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');
const lirc = require('node-lirc');
app.use(bodyParser.json());
lirc.init();
gpio.setup(config.gpio_pin, gpio.DIR_HIGH);

app.post('*', (req, res) => {
    if(req.body.command){
        if(config.commands.hasOwnProperty(req.body.command)){
            lirc.send(config.remote, config.commands[req.body.command]);
            res.sendStatus(200);
        } else {
            res.json("Invalid Command").sendStatus(400);
        }
    }
    if(req.body.users){
        gpio.write(config.gpio_pin, (req.body.users)?true:false);
        res.sendStatus(200);
    }
    res.sendStatus(400);
});

app.get('*', (req, res) => {
    res.sendStatus(200);
});

app.listen(5001, () => console.log("Server running on port 5001"));