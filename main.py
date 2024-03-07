import lightbulb
from pyscript import document

import RPi.GPIO as GPIO
from time import sleep

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
#can be changed later
LED=16

GPIO.setup(LED,GPIO.OUT)

light_state = GPIO.input(LED)
#this will need to be tested
def light_switch (event):
    if(light_state == GPIO.LOW):
        GPIO.output(LED,GPIO.HIGH)
    else:
        GPIO.output(LED,GPIO.LOW)

