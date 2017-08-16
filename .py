# Initialise the Lirc config parser  
lircParse = Lirc('/etc/lirc/lircd.conf')  

def last(out):
	with open('/var/www/flask/lastir.log', 'w') as file:
		file.truncate()	
		file.write('success')
		file.close()