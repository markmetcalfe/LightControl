const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');
const lirc = require('node-lirc');
app.use(bodyParser.json());
lirc.init();

app.post('/', (req, res) => {
    if(req.body.command && config.commands.hasOwnProperty(req.body.command)){
        lirc.send(config.remote, config.commands[req.body.command]);
        console.log("Executed Command");
        res.sendStatus(200);
        return;
    } 
    bad(res);
});

app.get('*', (req, res) => bad(res));
function bad(res){ console.log("Invalid Command"); res.sendStatus(400) };

app.listen(5001, () => console.log("Server running on port 5001"));