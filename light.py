import subprocess
import urllib
from datetime import datetime
from flask import Flask
from flask import request, redirect, url_for

startTime = 12;
endTime = 17;

app = Flask(__name__)  

if __name__ == "__main__":
	app.run()

colorRef=["White","Red","Dark_Orange","Orange","Amber","Yellow","Green","Light_Green","Light_Blue","Blue","Indigo","Purple","Pink"]
colorHex=["#FFFFFF","#ED1515","#F75B07","#F79307","#F7D307","#F2EE0A","#2AF72A","#00FA7D","#00DDFA","#0059FF","#8400FF","#BF00FF","#F200FF"]
colors=["white","red","darkorange","orange","amber","yellow","green","lightgreen","lightblue","blue","indigo","purple","pink"]
colorCommand=["WHITE","RED","DARKORANGE","ORANGE","AMBER","YELLOW","GREEN","LIGHTGREEN","LIGHTBLUE","BLUE","INDIGO","PURPLE","PINK"]

def get(file):
	with open('/var/www/markmetcalfe/light/'+file+'.state', 'r') as f:
		data = f.read()
		f.close()
		return data
		
def write(file, str):
	with open('/var/www/markmetcalfe/light/'+file+'.state', 'w') as f:
		f.truncate()	
		f.write(str)
		f.close()

@app.route("/")
def mainpage():
	with open('/var/www/markmetcalfe/light/page.html', 'r') as f:
		data = f.read()
		f.close()
		return data
	
@app.route("/rel/<page>")
def localcode(page):
	with open('/var/www/markmetcalfe/light/'+page, 'r') as f:
		data = f.read()
		f.close()
		return data

@app.route("/rel/<one>/<two>")
def externalcode(one, two):
	with open('/var/www/markmetcalfe/light/'+one+'/'+two, 'r') as f:
		data = f.read()
		f.close()
		return data		

@app.route("/cmd/<state>")                                                          
def output(state=None):
	if state == 'gethour':
		return str(datetime.now().hour)
	elif state == 'getpower':
		return get('power')
	elif state == 'getbrightness':		
		return get('brightness')
	elif state == 'getcolor':		
		return get('color')
	elif state == 'gethex':
		with open('/var/www/markmetcalfe/light/color.state', 'r') as c:
			color = c.read()
			c.close()
		if get('power')=='Off':
			return '#000000'
		else:
			i = 0
			done = False
			for color in colorRef:
				if color == colorHex[i]:
					done = True
					return colorHex[i]
				i+=1
			if done == False:
				print "Failed"
				return "Failed"
	elif state == 'toggle':
		if get("power") == 'On':
			subprocess.call(["irsend", "SEND_ONCE", "light", "TURN_OFF"])
			write("power","Off")
			return 'Success'
		elif get("power") == 'Off':
			subprocess.call(["irsend", "SEND_ONCE", "light", "TURN_ON"])
			write("power","On")
			return 'Success'
	elif state == 'on':                                                           
		subprocess.call(["irsend", "SEND_ONCE", "light", "TURN_ON"])
		write("power","On")		
		return 'Success'  
	elif state == 'off':                                                          
		subprocess.call(["irsend", "SEND_ONCE", "light", "TURN_OFF"])
		write("power","Off")
		return 'Success'  
	elif state == 'brighter':
		subprocess.call(["irsend", "SEND_ONCE", "light", "BRIGHTNESS_UP"])
		number = int(get("brightness"))
		if number < 5:	
			number += 1
			write("brightness",str(number))
		return 'Success'  
	elif state == 'dim':
		subprocess.call(["irsend", "SEND_ONCE", "light", "BRIGHTNESS_DOWN"])
		number = int(get("brightness"))
		if number > 1:	
			number -= 1
			write("brightness",str(number))
		return 'Success'  
	elif state == 'darkest':
		for i in xrange(5):
			subprocess.call(["irsend", "SEND_ONCE", "light", "BRIGHTNESS_DOWN"])
		write("brightness","1")
		return 'Success'  
	elif state == 'brightest':
		for i in xrange(5):
			subprocess.call(["irsend", "SEND_ONCE", "light", "BRIGHTNESS_UP"])	
		write("brightness","5")
		return 'Success' 
	elif state == 'flashfast':
		subprocess.call(["irsend", "SEND_ONCE", "light", "FLASH_FAST"])	
		write("color","Flash_Fast")
		return 'Success'  
	elif state == 'flashslow':
		subprocess.call(["irsend", "SEND_ONCE", "light", "FLASH_SLOW"])	
		write("color","Flash_Slow")
		return 'Success'  
	elif state == 'smoothfast':
		subprocess.call(["irsend", "SEND_ONCE", "light", "SMOOTH_FAST"])	
		write("color","Smooth_Fast")
		return 'Success'  
	elif state == 'smoothslow':
		subprocess.call(["irsend", "SEND_ONCE", "light", "SMOOTH_SLOW"])
		write("color","Smooth_Slow")
		return 'Success'  		
	else:
		done = False
		i = 0
		for color in colors:
			if state == color:
				subprocess.call(["irsend", "SEND_ONCE", "light", "COLOR_"+colorCommand[i]])
				with open('/var/www/markmetcalfe/light/color.state', 'w') as c:
					c.truncate()	
					c.write(colorRef[i])
					c.close()
				done = True
				return 'Success'
			i+= 1
		if done == False:
			print 'Failed'
			return '<html><head><title>Failed</title></head><body><font style="font-family: Arial;"><b>Not A Command</b></font></body></html>'