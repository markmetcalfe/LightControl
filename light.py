import subprocess
import urllib
from datetime import datetime
from flask import Flask
from flask import request, redirect, url_for

startTime = 10
endTime = 18
errorMsg = "Only Enabled from "+str(startTime)+"am to "+str(endTime-12)+"pm"

app = Flask(__name__)  

colorRef=["White","Red","Dark_Orange","Orange","Amber","Yellow","Green","Light_Green","Light_Blue","Blue","Indigo","Purple","Pink"]
colorHex=["#FFFFFF","#ED1515","#F75B07","#F79307","#F7D307","#F2EE0A","#2AF72A","#00FA7D","#00DDFA","#0059FF","#8400FF","#BF00FF","#F200FF"]
colors=["white","red","darkorange","orange","amber","yellow","green","lightgreen","lightblue","blue","indigo","purple","pink"]
colorCommand=["WHITE","RED","DARKORANGE","ORANGE","AMBER","YELLOW","GREEN","LIGHTGREEN","LIGHTBLUE","BLUE","INDIGO","PURPLE","PINK"]

def getLineNum(what):
	if what == 'power':
		return 0
	elif what == 'brightness':
		return 1
	elif what == 'color':
		return 2
	else:
		return 0

def get(what):
	with open('/var/www/flask/state.log', 'r') as f:
		lines = f.readlines()
		for line in lines:
			line.strip()
			line.rstrip('\r\n')
		return lines[getLineNum(what)]
		f.close()
			
def write(what, text):
	with open('/var/www/flask/state.log', 'r') as f:
		lines = f.readlines()
		for line in lines:
			line.strip()
			line.rstrip('\r\n')
		f.close()
	print lines[0]
	print lines[1]
	print lines[2]
	with open('/var/www/flask/state.log', 'w') as new:
		new.truncate()	
		i = 0
		lineNum = getLineNum(what)
		for line in lines:
			if i == lineNum:
				new.write(text)
			else:
				new.write(line)
			i+=1
		new.close()

@app.route("/")
def mainpage():
	with open('/var/www/flask/page.html', 'r') as f:
		data = f.read()
		f.close()
		return data
	
@app.route("/rel/<page>")
def localcode(page):
	with open('/var/www/flask/'+page, 'r') as f:
		data = f.read()
		f.close()
		return data

@app.route("/rel/<first>/<second>")
def externalcode(first, second):
	with open('/var/www/flask/'+first+'/'+second, 'r') as f:
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
		color = get('color')
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
		if datetime.now().hour >= startTime and datetime.now().hour <= endTime:
			if get("power") == 'On':
				subprocess.call(["irsend", "SEND_ONCE", "light", "TURN_OFF"])
				write("power","Off")
				return 'Success'
			elif get("power") == 'Off':
				subprocess.call(["irsend", "SEND_ONCE", "light", "TURN_ON"])
				write("power","On")
				return 'Success'
		else:
			return errorMsg
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
				write('color',colorRef[i])
				done = True
				return 'Success'
			i+= 1
		if done == False:
			print 'Invalid Command Entered'
			return '<html><head><title>Failed</title></head><body><font style="font-family: Arial;"><b>Not A Command</b></font></body></html>'
			
if __name__ == "__main__":       											
    app.run(debug=True)