# we will be using the flask framework for our backend
from flask import Flask,render_template,request

import RPi.GPIO as GPIO

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

# change gpio pin on request
LED=16

GPIO.setup(LED,GPIO.OUT)

app = Flask(__name__)

#defining the index route
@app.route("/")
@app.route("/home", methods=['GET','POST'])
def home():
    #if get http request recieved, toggle light
    if(request.args.get("click")=='1'):
        light_switch()
    elif(request.args.get("click")=='0'):
        GPIO.output(LED,GPIO.LOW)
    return render_template("index.html")

if __name__ == '__main__': 
    app.run(port=5002)

#reverse light (from low to high and from high to love)
def light_switch ():
    if(GPIO.input(LED) == GPIO.LOW):
        GPIO.output(LED,GPIO.HIGH)
    else:
        GPIO.output(LED,GPIO.LOW)
