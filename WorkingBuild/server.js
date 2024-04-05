// some code (http initialization, motor function using socket.io) used from https://maker.pro/raspberry-pi/tutorial/how-to-control-a-raspberry-pi-gpio-pin-with-a-nodejs-web-server with tweaks
//email username: iotproject420@outlook.com
//email password: whatisiot69
var http = require('http');
const nodemailer = require("nodemailer");
const Imap = require('imap');
const { simpleParser } = require('mailparser');
var Gpio = require('onoff').Gpio; //require onoff to control GPIO
var sensor = require("node-dht-sensor");
var fs = require('fs'); //require filesystem to read html files

var motorEnable = new Gpio(22, 'out'); // declare GPIO22 an output for the enable pin
var motorOut1 = new Gpio(27, 'out'); // declare GPIO27 the output for direction 1 (will always be set to ON)
var motorOut2 = new Gpio(17, 'out'); // declare GPIO27 the output for direction 2 (will always be set to OFF)

//boolean meant to keep track of when to run read mail function
var mailSent = false;
var intervalID = null;
var dhtInterval = null;
var declined = false;

//! INITIALIZATION (HTTP)

var http = require('http').createServer(function handler(req, res) { //create server
  fs.readFile(__dirname + '/index.html', function (err, data) { //read html file
    if (err) {
      res.writeHead(500);
      return res.end('Error loading socket.io.html');
    }

    res.writeHead(200);
    res.end(data);
  });
});

var io = require('socket.io')(http) //require socket.io module and pass the http object

io.sockets.on('connection', function (socket) {// WebSocket Connection
  var buttonState = 0; //variable to store button state
  console.log("running the socket connnection");
  socket.on('fanStatRequest', function (data, init) // client has ability to manually change the status of the fan. fan status is returned to client
  { 
    if(init){
      io.emit('fanStatResponse', `${motorEnable.readSync()}`);
    }else{
      motorToggle(data);
      io.emit('fanStatResponse', `${motorEnable.readSync()}`);
    }
  });
});

http.listen(8080, () => {
  console.log("localhost:8080");
  motorOut1.writeSync(1);
  motorOut2.writeSync(0);
}); //listen to port 8080

//! DHT11 FUNCTION
 
dhtInterval = setInterval(dhtCheck, 5*1000);

function dhtCheck(){
  console.log("running dht check");
  sensor.read(11, 20, function(err, temperature, humidity) {
    if (!err) {
      console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
      io.emit('dhtStatResponse', temperature.toString(), humidity.toString()); //sending dht temp to front end
      // Temp set to 24. Change to 20 for testing.
      if(temperature>20 && !mailSent && motorEnable.readSync()==0 && !declined){
        sendReadEmail(temperature);
        //clearInterval(dhtInterval);
      }
    }else{
      console.log(err);
    }
  });
}
	

//! MOTOR FUNCTION

function motorToggle(state = null){
  console.log("in the state function");
  if(state==0 || state){
    if (state != motorEnable.readSync()) { //Change LED state if button state is changed
      motorEnable.writeSync(state); //turn LED on or off
    }
  }else{
    motorEnable.writeSync(motorEnable.readSync()==1 ? 0 : 1);
  }
  io.emit('fanStatResponse', `${motorEnable.readSync()}`);
  console.log(motorEnable.readSync());
}

//! EMAIL FUNCTIONS

//? send

async function sendEmail(temp){
  console.log("attempting to send email");
  const transporter = nodemailer.createTransport({
    host: "outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: "iotproject420@outlook.com",
      pass: "whatisiot69",
    },
  });


  const info = await transporter.sendMail({
    from: '"IOT Dashboard" <iotproject420@outlook.com>',
    to: "poisonedcheeto@gmail.com", 
    subject: "Temperature", 
    text: `Your current temperature is ${temp}°C would you like to turn on the fan?`, 
    
  });
  mailSent = true;
    console.log("Message sent: %s", info.messageId);
}

//? receive
// remember to install required libraries such as Imap
  
const imapConfig = {
  user: 'iotproject420@outlook.com',
  password: 'whatisiot69',
  host: 'outlook.com',
  port: 993,
  tls: true,
};

function getEmails(){
  try {
	  
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
          if(err) throw err;
        
          if(results.length === 0){
            console.log("No new emails");
            imap.end();
            return false;
          }
			  
          const f = imap.fetch(results, {bodies: ''});
          
          f.on('message', msg => {
            msg.on('body', stream => {
              simpleParser(stream, async (err, parsed) => {
                const { subject, text } = parsed; 
                // Get the response data here
                console.log('Subject:', subject);
                console.log('Body:', text);
                //! SUBJECT TO CHANGE
                if(text.toLowerCase().includes('yes') || subject.toLowerCase().includes('yes')){
                  console.log("TURNING THE FAN ON.");
                  motorToggle(1);
                }else{
                  declined = true;
                }
              });
            });
            msg.once('attributes', attrs => {
              const {uid} = attrs;
              imap.addFlags(uid, ['\\Seen'], () => {
                mailSent = false;
                console.log('Marked as read!');
                clearInterval(intervalID);
              });
            });
          });
          f.once('error', ex => {
            return Promise.reject(ex);
          });
          f.once('end', () => {
            console.log('Done fetching all messages!');
            clearInterval
            imap.end();
          });
        });
      });
    });

    imap.once('error', err => {
      console.log(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
      
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred');
  }
};

//? send read email

async function sendReadEmail(temp){
	await sendEmail(temp);
	
	if(mailSent){
		intervalID = setInterval(getEmails, 5 * 1000);
		}
	
}