var
	User = require('../models/User.js'),
	Stock = require('../models/Stock.js')

module.exports = {

  //add a stock
	addStock: function(req, res){
		console.log("back end req.body!!!!!!!!!!!!********!!!!!!!!!!!!:",req.params);
			User.findOne({_id: req.params.id}, function(err, user){
				console.log('user', user)
				if(err) return console.log(err)
				//res.json({userPortfolioResult: user.portfolio.indexOf(req.body.stock)})
				//if (user.portfolio.indexOf(req.body.stock) == -1)
					Stock.findOne({_id: req.body.stock}, function(err, newstock){
						if(err) return console.log(err)
						// console.log('newstock',newstock)
						user.prtfl.stocks.push(newstock)
						var anltsList = []
						newstock.analysts.forEach(function(anlst) {
							anltsList.push(anlst._id)
						})
						console.log('newstock',newstock)
						user.sudoPrtfl.push({stock:newstock._id,anlsts:{chsnAnlsts:anltsList, notChsnAnlysts:[]}})
						user.save(function(err, user){
							if(err) return console.log(err)
							console.log("successfully added stock!!!!", user);
							res.json(user)
						})
					})
			})
		//}
		},


	// remove a stock
	removeStock: function(req,res){
		User.findOne({_id: req.params.id}, function(err, user){
			if(err) return console.log("user, error",user,err)
			console.log("user",user);
			user.prtfl.stocks.splice(user.prtfl.stocks.indexOf(req.body.stock),1)

			var stockIndex = -1;
			user.sudoPrtfl.forEach(function(el,idx) {
				if (el.stock == req.body.stock) {
					stockIndex = idx;
				}
			})
			user.sudoPrtfl.splice(stockIndex,1)

			user.save(function(err, user){
				if(err) return console.log(err)
				console.log("REMOVED STOCK FROM USER PORTFOLIO");
				res.json(user)
				})
			})
	},

	// delete a user
	delete: function(req,res){
		User.findOneAndRemove({_id: req.params.id}, function(err){
			if(err) return console.log(err)
			res.json({success: true, message: "User Deleted!"})
		})
	}
}