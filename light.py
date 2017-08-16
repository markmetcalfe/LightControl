import subprocess
import urllib
from datetime import datetime
from flask import Flask, request, redirect, url_for, send_from_directory, render_template

startTime = 12;
endTime = 17;

app = Flask(__name__, static_url_path='/static')  

if __name__ == "__main__":
	app.run(debug=True)

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
	with open('/var/www/markmetcalfe/light/index.html', 'r') as f:
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
			write("power","Off")
			return 'Success'
		elif get("power") == 'Off':
			write("power","On")
			return 'Success'
	elif state == 'on':
		write("power","On")		
		return 'Success'  
	elif state == 'off':
		write("power","Off")
		return 'Success'  
	elif state == 'brighter':
		number = int(get("brightness"))
		if number < 5:	
			number += 1
			write("brightness",str(number))
		return 'Success'  
	elif state == 'dim':
		number = int(get("brightness"))
		if number > 1:	
			number -= 1
			write("brightness",str(number))
		return 'Success'  
	elif state == 'darkest':
		write("brightness","1")
		return 'Success'  
	elif state == 'brightest':
		write("brightness","5")
		return 'Success' 
	elif state == 'flashfast':
		write("color","Flash_Fast")
		return 'Success'  
	elif state == 'flashslow':
		write("color","Flash_Slow")
		return 'Success'  
	elif state == 'smoothfast':	
		write("color","Smooth_Fast")
		return 'Success'  
	elif state == 'smoothslow':
		write("color","Smooth_Slow")
		return 'Success'  		
	else:
		done = False
		i = 0
		for color in colors:
			if state.lower() == color.lower():
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