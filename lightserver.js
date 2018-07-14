const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');
const lirc = require('node-lirc');
app.use(bodyParser.json());
lirc.init();

app.post('*', (req, res) => {
    if(config.commands.hasOwnProperty(req.body.command)){
        lirc.send(config.remote, config.commands[req.body.command]);
        res.sendStatus(200);
    } else {
        res.json("Invalid Command").sendStatus(400);
    }
});

app.listen(5001, () => console.log("Server running on port 5001"));