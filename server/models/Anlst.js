var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema

var analystSchema = new Schema({
  name: String,
  rating: String,
  target: Number,
  date: String
})


var Anlst = mongoose.model('Anlst', analystSchema);

module.exports = Anlst;
