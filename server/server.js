#!/usr/bin/env node
require('dotenv').config();
var port = process.env.PORT || 3000

// dependencies
var express = require('express')
var logger = require('morgan')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var expressSession = require('express-session')
var mongoose = require('mongoose')
var hash = require('bcrypt-nodejs')
var path = require('path')
var passport = require('passport')
var passportConfig = require('./config/passport.js')
var cors = require('cors');

var DB_URL = process.env.MLAB_LINK || 'mongodb://localhost/portfolioDB'
var DB_LOCAL = 'mongodb://localhost/portfolioDB'
  // console.log("DB_URL:",DB_URL)

// mongoose
mongoose.connect(DB_URL, function(err) {
  if(err) return console.log(err)
  console.log("Connected to database:",DB_URL)
})

// user schema/model
var User = require('./models/User.js')

// create instance of express
var app = express()

// require routes
var routes = require('./routes/api.js')

// define middleware
app.use(cors())
app.use(express.static(path.join(__dirname, '../client')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use('/user/', routes)

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client', 'index.html'))
})

// error hndlers
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function(err, req, res) {
  res.status(err.status || 500)
  res.end(JSON.stringify({
    message: err.message,
    error: {}
  }))
})

app.listen(port, function() {
  console.log("Listening for requests on port:", port)
})
