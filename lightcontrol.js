/* Taken from http://stackoverflow.com/posts/13542669/revisions
 * Everything after this function I wrote myself, except for the ajax stuff, 
 * but that is pretty standard throughout most stuff anyways.
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
    $("body").css("height", Math.round(fix * 100) + "%");
}

var refreshTimer = 10,
    brightnessJS = ["darkest", "dim", "brighter", "brightest"],
    brightnessButtonText = ["Min", "-", "+", "Max"],
    brightness = 0,
    colorJS = [
        ["white", "red", "darkorange", "orange"],
        ["amber", "yellow", "green", "lightblue"],
        ["blue", "indigo", "purple", "pink"]
    ],
    colorCSS = [
        ["White", "Red", "Dark_Orange", "Orange"],
        ["Amber", "Yellow", "Green", "Light_Blue"],
        ["Blue", "Indigo", "Purple", "Pink"],
    ],
    colorButtonText = [
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
    ],
    colorText = [
        ["White", "Red", "Dark Orange", "Orange"],
        ["Amber", "Yellow", "Green", "Light Blue"],
        ["Blue", "Indigo", "Purple", "Pink"],
    ],
    colorHex = [
        ["#FFFFFF", "#ED1515", "#F75B07", "#F79307"],
        ["#F7D307", "#F2EE0A", "#2AF72A", "#00DDFA"],
        ["#0059FF", "#6C00FF", "#BF00FF", "#F200FF"],
    ];


window.onload = function() {
    changeSize();
    createButtons();
    refresh();
};

function createButtons() {
    for (i = 0; i < brightnessJS.length; i++) {
        document.getElementById("brightnessButtons").innerHTML += '<a onclick="setBrightness(\'' + brightnessJS[i] + '\');return false;"><button class="mainbutton mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--default">' + brightnessButtonText[i] + '</button></a>';
    }
    for (i = 0; i < colorJS.length; i++) {
        for (j = 0; j < colorJS[i].length; j++) {
            document.getElementById("colorButtons").innerHTML += '<a onclick="setColor(' + i + ',' + j + ');return false;"><button class="mainbutton mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--' + colorJS[i][j] + '">' + colorButtonText[i][j] + '</button></a>';
        }
        document.getElementById("colorButtons").innerHTML += '<br/><br/>';
    }
    document.getElementById("colorButtons").innerHTML += '<br/>';
}

function send(action) {
    xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://light.markmetcalfe.xyz/cmd/" + action, true);
    xhttp.send();
    refreshTimer = 10;
}

window.setInterval(function() {
    refreshTimer--;
    if (refreshTimer < 1) {
        refreshTimer = 10;
        refresh();
    }
}, 200);

function refresh() {
    updatePower();
    updateBrightness();
    updateColor();
}

var lastColor, lastBrightness, lastPower, lastHex;

function toggle() {
    var toggle;
    tGet = new XMLHttpRequest();
    tGet.onreadystatechange = function() {
        if (tGet.readyState == 4 && tGet.status == 200) {
            toggle = tGet.responseText;
            refreshTimer = 10;
            var toast2 = new Android_Toast({
                content: "Demo Mode"
            });
            if (lastPower == "On") {
                document.getElementById("powerstatus").innerHTML = '<span class="Off">Off</span>';
                $(".metaColor").attr("content", "#000");
                refresh();
                fadeDark();
            } else {
                document.getElementById("powerstatus").innerHTML = '<span class="On">On</span>';
                $(".metaColor").attr("content", lastHex);
                refresh();
                fadeColor();
            }
            refreshTimer = 10;
        }
    };
    tGet.open("GET", "http://light.markmetcalfe.xyz/cmd/toggle", true);
    tGet.send();
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
    updateToggleButton(lastPower);
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
    updateToggleButton(lastPower);
    if (lastHex === null || lastBrightness === null) {} else {
        var lightColor = blendColors(lastHex, "#FFFFFF", 0.75);
        var fadeColor = blendColors("#000000", lightColor, 0.6 + (lastBrightness * 0.08));
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

function setColor(i, j) {
    refreshTimer = 10;
    if (lastPower == "On") {
        send(colorJS[i][j]);
        document.getElementById("colorstatus").innerHTML = '<span class="' + colorCSS[i][j] + '">' + colorText[i][j] + '</span>';
        $(".metaColor").attr("content", colorHex[i][j]);
        lastHex = colorHex[i][j];
        fadeColor();
    } else {
        document.getElementById("colorstatus").innerHTML = '<span class="Off">Off</span>';
        var toast1 = new Android_Toast({
            content: "Light Isn't On"
        });
        $(".metaColor").attr("content", "#000");
    }
}

function setBrightness(Button) {
    refreshTimer = 10;
    if (lastPower == "On") {
        if (Button == "dim") {
            if (lastBrightness > 1) {
                lastBrightness--;
            } else {
                lastBrightness = 1;
            }
        } else if (Button == "brighter") {
            if (lastBrightness < 5) {
                lastBrightness++;
            } else {
                lastBrightness = 5;
            }
        } else if (Button == "brightest") {
            lastBrightness = 5;
        } else if (Button == "darkest") {
            lastBrightness = 1;
        }
        send(Button);
        fadeColor();
        document.getElementById("brightness").innerHTML = '<span class="Level_' + lastBrightness + '">' + lastBrightness + '</span>';
    } else {
        document.getElementById("brightness").innerHTML = '<span class="Off">Off</span>';
        var toast1 = new Android_Toast({
            content: "Light Isn't On"
        });
        $(".metaColor").attr("content", "#000");
    }
}

function updateColor() {
    var color;
    cGet = new XMLHttpRequest();
    cGet.onreadystatechange = function() {
        if (cGet.readyState == 4 && cGet.status == 200) {
            color = cGet.responseText;
            for (i = 0; i < colorCSS.length; i++) {
                for (j = 0; j < colorCSS[i].length; j++) {
                    if (color == colorCSS[i][j]) {
                        if (lastColor != color) {
                            lastColor = color;
                            lastHex = colorHex[i][j];
                            refreshTimer = 10;
                        }
                        if (lastPower == "On") {
                            fadeColor();
                            document.getElementById("colorstatus").innerHTML = '<span class="' + colorCSS[i][j] + '">' + colorText[i][j] + '</span>';
                            $(".metaColor").attr("content", colorHex[i][j]);
                        } else {
                            fadeDark();
                            document.getElementById("colorstatus").innerHTML = '<span class="Off">Off</span>';
                            $(".metaColor").attr("content", "#000");
                        }
                    }
                }
            }
        }
    };
    cGet.open("GET", "http://light.markmetcalfe.xyz/cmd/getcolor", true);
    cGet.send();
}

function updateBrightness() {
    var brightness;
    bGet = new XMLHttpRequest();
    bGet.onreadystatechange = function() {
        if (bGet.readyState == 4 && bGet.status == 200) {
            brightness = bGet.responseText;
            if (brightness > 0 && brightness < 6) {
                lastBrightness = brightness;
            }
            if (lastPower == "On") {
                fadeColor();
                document.getElementById("brightness").innerHTML = '<span class="Level_' + brightness + '">' + brightness + '</span>';
            } else {
                fadeDark();
                document.getElementById("brightness").innerHTML = '<span class="Off">Off</span>';
                $(".metaColor").attr("content", "#000");
            }
            refreshTimer = 10;
        }
    };
    bGet.open("GET", "http://light.markmetcalfe.xyz/cmd/getbrightness", true);
    bGet.send();
}

var powerButtonCreated = false;

function updatePower() {
    var power;
    pGet = new XMLHttpRequest();
    pGet.onreadystatechange = function() {
        if (pGet.readyState == 4 && pGet.status == 200) {
            power = pGet.responseText;
            if (power != lastPower) {
                lastPower = power;
                if (powerButtonCreated === false) {
                    document.getElementById("powerButton").innerHTML = '<a onclick="toggle();return false;" style="padding: -5px 0px 0px 15px;"><button id="toggle" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--toggle"></button></a>';
                    updateToggleButton(power);
                }
                document.getElementById("powerstatus").innerHTML = '<span class="' + power + '">' + power + '</span>';
                updateColor();
                updateBrightness();
                power == "Off" ? fadeDark() : fadeColor();
            }
        }
    };
    pGet.open("GET", "http://light.markmetcalfe.xyz/cmd/getpower", true);
    pGet.send();
}