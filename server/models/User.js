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
  psudoPrtfl: [
  	{
  		stock  : String,
  		anlsts :{
        chsnAnlsts    : [],
        notChsnAnlsts : []
  	   }
    }
  ]
})

User.plugin(passportLocalMongoose)


module.exports = mongoose.model('users', User)

// UserSchema.pre('find', function(next) {
//     var Stocks = mongoose.model('Stock');
//     var stockid = this.chsnAnlt[0].stockid
//     var analystid = this.chsnAnlt[0].analystid
//     var that = this;
//   Stocks.findOne({_id: stockid, "analyst._id": analystid}).lean().exec(function(err, stocks) {
//       //loop through stocks and return the valid analyst
//       var analyst = _.each(stocks.analytst, function(analyst) {
//           if (analyst._id.toString() === analystid.toString()) {
//               return analyst
//           }
//       })
//       that.chsnAnly[0] = analyst;
//       next()
//   })
// });

// User = {
//     chsnAnalyst: [{
//         stockid:
//         analystid:
//     }]
// }