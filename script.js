var minBrightness = 1;
var maxBrightness = 5;

var timer;
var colorMap;

var powerIsOn;
var brightness;
var color;

window.onload = function() {
    $.ajax({ url: "data/map", type: "GET", cache: false }).done(function(data){
       colorMap = $.parseJSON(data);
       timer = new Timer();
       sync();
    });
};

function sync() {
    $.when(
        $.ajax({ url: "data/power",      type: "GET", cache: false }), 
        $.ajax({ url: "data/brightness", type: "GET", cache: false }), 
        $.ajax({ url: "data/color",      type: "GET", cache: false })
    ).done(function(a1, a2, a3){
        if((a1[0]=="On")!==powerIsOn||$.parseJSON(a2[0])!=brightness||a3[0]!=color)
            update(a1[0]=="On",$.parseJSON(a2[0]),a3[0]);
    });
}

function update(p,b,c) {
    powerIsOn = p;
    brightness = b;
    color = c;
    
    timer.wait();
    
    if(powerIsOn){
        updateColor(color, colorMap[color]);
        updateBrightness(brightness);
        turnOn();
    } else turnOff();
    
    $('#loading').css("display","none");
    $('#container').css("display","");
}

function setColor(newcolor) {
    timer.wait();
    if(lightOn()){
        $.ajax({ url: "data/setcolor/"+newcolor, type: "GET", cache: false });
        
        color = newcolor;
        updateColor(color, colorMap[color]);
    }
}

function updateColor(color, hex) {
    document.getElementById("colorstatus").innerHTML = '<span style="color:'+hex+';">' + color + '</span>';
    $(".metaColor").attr("content", hex);
    fadeColor(hex);
}

function setBrightness(Button) {
    timer.wait();
    if(lightOn()){
        if(Button == "dim")            brightness = brightness>minBrightness ? brightness-1 : minBrightness;
        else if(Button == "brighter")  brightness = brightness<maxBrightness ? brightness+1 : maxBrightness;
        else if(Button == "brightest") brightness = maxBrightness;
        else if(Button == "darkest")   brightness = minBrightness;
        
        $.ajax({ url: "data/"+Button, type: "GET", cache: false });
        
        updateBrightness(brightness);
    }
}

function updateBrightness(brightness) {
    document.getElementById("brightness").innerHTML = '<span class="Level_' + brightness + '">' + brightness + '</span>';
    fadeColor(colorMap[color]);
}

function toggle(){ 
    $.ajax({
        url: "data/"+(powerIsOn?"off":"on"),
        type: "GET",
        cache: false,
        success: function(returnhtml) {
            timer.wait();
            powerIsOn ? turnOff() : turnOn();
            new Android_Toast({ content: "Demo Mode" });
            sync();
        }
    });
}

function turnOff(){
    powerIsOn = false;
    fadeDark();
    
    var off = '<span class="Off">Off</span>';
    
    document.getElementById("toggle").innerHTML = "On";
    document.getElementById("powerstatus").innerHTML = off;
    
    document.getElementById("brightness").innerHTML = off;
    document.getElementById("colorstatus").innerHTML = off;
    
    $('#toggle').animate({ backgroundColor: 'green' }, { duration: 300, queue: false });
    $('#toggle').animate({ color: 'green' }, { duration: 100, queue: false });
    $('#toggle').animate({ color: '#fff' }, { duration: 100, queue: false });
    
    $(".metaColor").attr("content", "#000");
}

function turnOn(){
    powerIsOn = true;
    fadeColor(colorMap[color]);
    
    document.getElementById("powerstatus").innerHTML = '<span class="On">On</span>';
    document.getElementById("toggle").innerHTML = "Off";
    
    updateBrightness(brightness);
    updateColor(color, colorMap[color]);
    
    $('#toggle').animate({ backgroundColor: 'red' }, { duration: 300, queue: false });
    $('#toggle').animate({ color: 'red' }, { duration: 100, queue: false });
    $('#toggle').animate({ color: '#fff' }, { duration: 100, queue: false });
    
    $(".metaColor").attr("content", colorMap[color]);
}

function fadeDark() {
    $('body').animate({
        backgroundColor: '#1A1A1A'
    }, {
        duration: 2000,
        queue: false,
        complete: timer.start()
    });
    $('body').animate({
        color: '#FFFFFF'
    }, {
        duration: 2000,
        queue: false
    });
}

function fadeColor(hex) {
    var lightColor = blendColors(hex, "#FFFFFF", 0.75);
    var fadeColor = blendColors("#000000", lightColor, 0.5 + (brightness * 0.1));
    $('body').animate({
        backgroundColor: fadeColor
    }, {
        duration: 2000,
        queue: false,
        complete: timer.start()
    });
    $('body').animate({
        color: '#000000'
    }, {
        duration: 2000,
        queue: false
    });
}

function lightOn(){
    if(!powerIsOn){
        turnOff();
        new Android_Toast({ content: "Light Isn't On" });
    }
    return powerIsOn;
}


function Timer() {
    var timerObj = setInterval(sync, 1000);
    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(sync, 1000);
        }
        return this;
    }
    this.wait = function() {
        timer.stop();
        setTimeout(function(){
            sync();
            timer.start();
        }, 3000);
    }
}

/* 
 * Taken from http://stackoverflow.com/posts/13542669/revisions
 */
function blendColors(c0, c1, p) {
    var f = parseInt(c0.slice(1), 16),
        t = parseInt(c1.slice(1), 16),
        R1 = f >> 16,
        G1 = f >> 8 & 0x00FF,
        B1 = f & 0x0000FF,
        R2 = t >> 16,
        G2 = t >> 8 & 0x00FF,
        B2 = t & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
}