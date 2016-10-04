var
	mongoose = require('mongoose'),
	Schema = mongoose.Schema

var analystSchema = new Schema({
  name: String,
  rating: String,
  target: Number,
  date: String
})

var stockSchema = new Schema({
	companyName: String,
	symbol: String,
	analysts: [analystSchema],
  chosenAnalysts: [{
    name: String,
    tgt: Number,
    weight: Number
  }],
  wtdPrice: Number,
  price: Number,
  beta: Number,
	treasuryYield: Number,
	aveTGT: Number
})

var Stock = mongoose.model('Stock', stockSchema)

module.exports = Stock
