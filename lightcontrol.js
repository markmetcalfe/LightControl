/* Taken from http://stackoverflow.com/posts/13542669/revisions
 * Everything after this function I wrote myself
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

function changeSize() {
    var fix = ($(window).height() / $(document).height());
    $(".container").css("height", Math.round(fix * 100) + "%");
    $(".container").css("zoom", "0.5");
    $(".container").css("-moz-transform", "scale(0.5)");
    $(".container").css("transform", "scale(0.5)");
}

function format(str) {
    str.split(' ').join('');
    return str.toLowerCase();
}

var refreshTimer = 10;

var colorMap;

var minBrightness = 1;
var maxBrightness = 5;

var power;
var brightness;
var color;
var hex;

function updateColor() {
    fadeColor(hex);
    document.getElementById("colorstatus").innerHTML = '<span class="' + format(color) + '">' + color + '</span>';
    refreshTimer = 10;
}

window.onload = function() {
    $('#loading').show();
    $('#content').hide();
    $.ajax({
        url: "data/map",
        type: "GET",
        cache: false,
        success: function(returnhtml) {
            colorMap = new Map(JSON.parse(returnhtml));
        }
    });
    update();
};

function send(action) {
    $.ajax({
        url: "data/" + action,
        type: "GET",
        cache: false
    });
    refreshTimer = 10;
}

window.setInterval(function() {
    refreshTimer--;
    if (refreshTimer < 1) {
        refreshTimer = 10;
        update();
    }
}, 200);

var powerButtonCreated = false;

function update() {
    $.when(
    $.ajax({
        url: "data/power",
        type: "GET",
        cache: false,
        success: function(returnhtml) {
            if (power != returnhtml) {
                power = returnhtml;
                if (powerButtonCreated === false) {
                    document.getElementById("powerButton").innerHTML = '<a onclick="toggle();return false;" style="padding: -5px 0px 0px 15px;"><button id="toggle" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--toggle"></button></a>';
                    updateToggleButton(power);
                    powerButtonCreated = true;
                }
                document.getElementById("powerstatus").innerHTML = '<span class="' + power + '">' + power + '</span>';
                power == "Off" ? fadeDark() : fadeColor();
            }
        }
    }), 
    $.ajax({
        url: "data/brightness",
        type: "GET",
        cache: false,
        success: function(returnhtml) {
            brightness = JSON.parse(returnhtml);
            if (power == "On") {
                fadeColor();
                document.getElementById("brightness").innerHTML = '<span class="Level_' + brightness + '">' + brightness + '</span>';
            } else {
                fadeDark();
                document.getElementById("brightness").innerHTML = '<span class="Off">Off</span>';
                $(".metaColor").attr("content", "#000");
            }
            refreshTimer = 10;
        }
    }), 
    $.ajax({
        url: "data/color",
        type: "GET",
        cache: false,
        success: function(returnhtml) {
            color = returnhtml;
            updateColor();
        }
    }), 
    $.ajax({
        url: "data/hex",
        type: "GET",
        cache: false,
        success: function(returnhtml) {
            hex = returnhtml;
            updateColor();
        }
    })).done(function(a1, a2, a3, a4){
        $('#loading').hide();
        $('#content').show();
    });
    changeSize();
}

function toggle() {
    $.ajax({
        url: "data/toggle",
        type: "GET",
        cache: false,
        success: function(returnhtml) {
            if (power == "On") {
                document.getElementById("powerstatus").innerHTML = '<span class="Off">Off</span>';
                $(".metaColor").attr("content", "#000");
                fadeDark();
                updateToggleButton("Off");
            } else {
                document.getElementById("powerstatus").innerHTML = '<span class="On">On</span>';
                $(".metaColor").attr("content", hex);
                fadeColor();
                updateToggleButton("On");
            }
            new Android_Toast({
                content: "Demo Mode"
            });
            refreshTimer = 10;
            update();
        }
    });
}

function updateToggleButton(p) {
    if (p == "On") {
        $('#toggle').animate({
            backgroundColor: 'red'
        }, {
            duration: 300,
            queue: false
        });
        $('#toggle').animate({
            color: 'red'
        }, {
            duration: 100,
            queue: false
        });
        document.getElementById("toggle").innerHTML = "Off";
        $('#toggle').animate({
            color: '#fff'
        }, {
            duration: 100,
            queue: false
        });
    } else {
        $('#toggle').animate({
            backgroundColor: 'green'
        }, {
            duration: 300,
            queue: false
        });
        $('#toggle').animate({
            color: 'green'
        }, {
            duration: 100,
            queue: false
        });
        document.getElementById("toggle").innerHTML = "On";
        $('#toggle').animate({
            color: '#fff'
        }, {
            duration: 100,
            queue: false
        });
    }
}

function fadeDark() {
    updateToggleButton(power);
    $('body').animate({
        backgroundColor: '#1A1A1A'
    }, {
        duration: 2000,
        queue: false
    });
    $('body').animate({
        color: '#FFFFFF'
    }, {
        duration: 2000,
        queue: false
    });
}

function fadeColor() {
    updateToggleButton(power);
    if (hex === null || brightness === null) {} else {
        //hex = colorMap.get(color)
        $(".metaColor").attr("content", hex);
        var lightColor = blendColors(hex, "#FFFFFF", 0.75);
        var fadeColor = blendColors("#000000", lightColor, 0.6 + (brightness * 0.08));
        $('body').animate({
            backgroundColor: fadeColor
        }, {
            duration: 2000,
            queue: false
        });
        $('body').animate({
            color: '#000000'
        }, {
            duration: 2000,
            queue: false
        });
    }
}

function setColor(color) {
    refreshTimer = 10;
    if (power == "On") {
        send('setcolor/' + color);
        //hex = colorMap.get(color);
        document.getElementById("colorstatus").innerHTML = '<span class="' + format(color) + '">' + color + '</span>';
        $(".metaColor").attr("content", hex);
        fadeColor();
    } else {
        document.getElementById("colorstatus").innerHTML = '<span class="Off">Off</span>';
        new Android_Toast({
            content: "Light Isn't On"
        });
        $(".metaColor").attr("content", "#000");
    }
}

function setBrightness(Button) {
    refreshTimer = 10;
    if (power == "On") {
        if (Button == "dim") {
            if (brightness > minBrightness) {
                brightness--;
            } else {
                brightness = minBrightness;
            }
        } else if (Button == "brighter") {
            if (brightness < maxBrightness) {
                brightness++;
            } else {
                brightness = maxBrightness;
            }
        } else if (Button == "brightest") {
            brightness = maxBrightness;
        } else if (Button == "darkest") {
            brightness = minBrightness;
        }
        send(Button);
        fadeColor();
        document.getElementById("brightness").innerHTML = '<span class="Level_' + brightness + '">' + brightness + '</span>';
    } else {
        document.getElementById("brightness").innerHTML = '<span class="Off">Off</span>';
        new Android_Toast({
            content: "Light Isn't On"
        });
        $(".metaColor").attr("content", "#000");
    }
}