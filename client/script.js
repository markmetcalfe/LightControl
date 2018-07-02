let colorMap, minBrightness, maxBrightness, powerIsOn, brightness, color, hex;

let socket = io.connect({path:window.location.pathname+'socket.io'});
socket.on('connect', function(data) {
   socket.emit('join');
});
socket.on('state', function(data) {
    colorMap = data.colors;
    updateColor(data.color, data.hex);
    if(data.power == "On") turnOn();
    else turnOff();
    minBrightness = data.min_brightness;
    maxBrightness = data.max_brightness;
    updateBrightness(data.brightness);
    if(data.error_msg)
        new Android_Toast({ content: data.error_msg });
});

function setColor(newcolor) {
    socket.emit('update', {
        "color": newcolor
    });
}

function updateColor(newcolor, newhex) {
    color = newcolor;
    hex = newhex;
    document.getElementById("colorstatus").innerHTML = '<span style="color:'+hex+';">' + color + '</span>';
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
    if(powerIsOn){
        document.getElementById("brightness").innerHTML = '<span class="Level_' + brightness + '">' + brightness + '</span>';
    } else {
        document.getElementById("brightness").innerHTML = '<span class="Off">Off</span>';
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

    let off = '<span class="Off">Off</span>';
    
    document.getElementById("toggle").innerHTML = "On";
    document.getElementById("toggle").classList.remove("Off");
    document.getElementById("toggle").classList.add("On");
    document.getElementById("powerstatus").innerHTML = off;
    
    document.getElementById("brightness").innerHTML = off;
    document.getElementById("colorstatus").innerHTML = off;
}

function turnOn(){
    powerIsOn = true;
    fadeColor();
    
    document.getElementById("powerstatus").innerHTML = '<span class="On">On</span>';
    document.getElementById("toggle").innerHTML = "Off";
    document.getElementById("toggle").classList.remove("On");
    document.getElementById("toggle").classList.add("Off");
    
    updateBrightness(brightness);
    updateColor(color, colorMap[color]);
}

function fadeColor() {
    if(powerIsOn){
        document.body.classList.remove("dark");
        document.body.style.backgroundColor = blendColors("#000000", blendColors(hex, "#FFFFFF", 0.75), 0.5 + (brightness * 0.1));
    } else {
        document.body.classList.add("dark");
        document.body.style.backgroundColor = null;
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

function resize_viewport(){
    var w = window.innerWidth;
    var h = window.innerHeight;
    var scale = 1.0;
    if(w>h){
        scale = h/587.2;
    } else {
        scale = 1;
    }
    document.getElementById("container").style.transform = 'scale('+scale+')';
}

window.addEventListener('load', resize_viewport, true);
window.addEventListener('resize', resize_viewport, true);