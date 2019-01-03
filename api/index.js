const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose');
const mongodbURL = 'mongodb://finalproject2019:final2019@ds247674.mlab.com:47674/appointments'
mongoose.connect(mongodbURL, { useNewUrlParser: true });
const db = mongoose.connection;
const dotenv = require('dotenv');
dotenv.load();
const PORT = 8080
const Nexmo = require("nexmo");
const Slot = require('./schemas/Slot')
const Appointment = require('./schemas/Appointment')
const Feedback = require('./schemas/Feedback')

const API_KEY = process.env.API_KEY
const SECRET_KEY = process.env.SECRET_KEY

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to MongoDb...')
});

app.get("/retrieveSlots", (req, res) => {
  // Returns all Slots
    Slot.find({})
        .exec((err, slots) => res.json(slots))
})

app.get('/appointments', (req, res) => {
  // Returns all appointments
  Appointment.find({}).exec((err, appointments) => res.json(appointments));
})

app.post('/appointmentCreate', (req,res) => {

  console.log(req.body.name)

  var newslot = new Slot({
    slot_time: req.body.slot_time,
    slot_date: req.body.slot_date,
    created_at: Date.now()
  });
  newslot.save();
  // Creates a new record from a submitted form
  var newappointment = new Appointment({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    slots: newslot._id
  });

  const nexmo = new Nexmo({
    apiKey: API_KEY,
    apiSecret: SECRET_KEY
  });

  let msg =
    req.body.name +
    " " +
    "this message is to confirm your appointment at" +
    " " +
    req.body.appointment;

  // and saves the record to
  // the data base
  newappointment.save((err, saved) => {
    // Returns the saved appointment
    // after a successful save
    Appointment.find({ _id: saved._id })
      .populate("slots")
      .exec((err, appointment) => res.json(appointment));

    const VIRTUAL_NUMBER = '18143000679'
    const RECIPIENT_NUMBER = req.body.phone

    const from = VIRTUAL_NUMBER;
    const to = RECIPIENT_NUMBER;

    nexmo.message.sendSms(from, to, msg, (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        console.dir(responseData);
      }
    });
  });
})

app.get('/getFeedback', (req,res) => {
  Feedback.find({}).exec((err, feedback) => res.json(feedback));
})

app.post('/leaveFeedback', (req,res) => {

  body = req.body.body

  var newFeedback = new Feedback()

  if(req.body.name){
    let name = req.body.name
    newFeedback.name = name
  } else {
    newFeedback.name = 'Anonymous'
  }
  newFeedback.body = body

  newFeedback.save(function(err,feedback){
    if(err){
      res.send(JSON.stringify({message: 'Sorry, there was an error'}))
    }else{
      res.send(JSON.stringify({message: 'Thank you for your feedbck!'}))
    }
  })
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`))