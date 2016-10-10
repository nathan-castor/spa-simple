// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')
var Stock = require('./Stock.js')

var User = new Schema({
  username: String,
  password: String,
  prtfl: {
    stocks: [{
      type: Schema.ObjectId,
      ref: 'Stock',
      autopopulate: true
    }]
  },
  sudoPrtfl:[
  	// {
  	// 	stock: String,
  	// 	chsnAnlsts: [],
  	// 	notChsnAnlsts: []
  	// }
  ]
})

User.plugin(passportLocalMongoose)


module.exports = mongoose.model('users', User)