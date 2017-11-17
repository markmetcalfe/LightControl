import subprocess
import urllib
import os
import pickle
from datetime import datetime
from flask import Flask

app = Flask(__name__)

path = os.path.dirname(os.path.realpath(__file__))

startTime = 12
endTime = 17

power = ("Off", "On")
colors = {
    "White": "#FFFFFF",
    "Red": "#ED1515",
    "Dark Orange": "#F75B07",
    "Orange": "#F79307",
    "Amber": "#F7D307",
    "Yellow": "#F2EE0A",
    "Green": "#2AF72A",
    "Light Green": "#00FA7D",
    "Light Blue": "#00DDFA",
    "Blue": "#0059FF",
    "Indigo": "#8400FF",
    "Purple": "#BF00FF",
    "Pink": "#F200FF"
}
minBrightness = 0
maxBrightness = 5


class State:
    def __init__(self, power, brightness, color):
        self.power = power
        self.brightness = brightness
        self.color = color


def url(string):
    return string.lower().replace(" ", "_")


def read():
    return pickle.load(open(os.path.dirname(os.path.realpath(__file__)) + '/state.data', 'rb'))


def write(power=None, brightness=None, color=None):
    new = read()
    if power is not None:
        new.power = power
    if brightness is not None:
        new.brightness = brightness
    if color is not None:
        new.color = color
    pickle.dump(new, open(os.path.dirname(os.path.realpath(__file__)) + '/state.data', 'wb'))


@app.route("/hour")
def hour():
    return "%s" % datetime.now().hour


@app.route("/power")
def getpower():
    return "%s" % read().power


@app.route("/brightness")
def brightness():
    return "%s" % read().brightness


@app.route("/color")
def color():
    state = read()
    if state.power == power[0]:
        return power[0]
    else:
        return "%s" % read().color


@app.route("/hex")
def hex():
    state = read()
    if state.power == power[0]:
        return "#000000"
    else:
        return "%s" % colors.get(state.color)


@app.route("/on")
def on():
    write(power=power[1])
    return 'Success', 200


@app.route("/off")
def off():
    write(power=power[0])
    return 'Success', 200


@app.route("/brighter")
def brighter():
    state = read()
    if state.brightness < maxBrightness:
        brightness = state.brightness + 1
        write(brightness=brightness)
    return 'Success', 200


@app.route("/dim")
def dim():
    state = read()
    if state.brightness > minBrightness:
        brightness = state.brightness - 1
        write(brightness=brightness)
    return 'Success', 200


@app.route("/darkest")
def darkest():
    write(brightness=minBrightness)
    return 'Success', 200


@app.route("/brightest")
def brightest():
    write(brightness=maxBrightness)
    return 'Success', 200


@app.route("/setcolor/<color>")
def setcolor(color=None):
    for key, value in colors.iteritems():
        if color == key or color == url(key):
            write(color=key)
            return 'Success', 200
    return 'Invalid Color', 400


if __name__ == "__main__":
    app.run(debug=True)