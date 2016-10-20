var
	User = require('../models/User.js'),
	Stock = require('../models/Stock.js')
 
module.exports = {

	portfolio: function(req,res){
		User.findOne({_id: req.params.id}).populate('prtfl.stocks','companyName').exec(function(err, user){
			if(err) return console.log(err)
			console.log('user:',user.prtfl.stocks);
			res.json(user.prtfl.stocks)
		})
	},
	psudoportfolio: function(req,res){
		User.findOne({_id: req.params.id}).populate('psudoPrtfl.anlsts').exec(function(err, user){
			if(err) return console.log(err)
			console.log('user:',user.psudoPrtfl.anlsts);
			res.json(user.psudoPrtfl)
		})
	},  

  //add a stock
	addStock: function(req, res){
		console.log("back end req.body!!!!!!!!!!!!********!!!!!!!!!!!!:",req.params);
			User.findOne({_id: req.params.id}, function(err, user){
				console.log('user', user)
				if(err) return console.log(err)

					Stock.findOne({_id: req.body.stock}, function(err, newstock){
						if(err) return console.log(err)
						// console.log('newstock',newstock)
						user.prtfl.stocks.push(newstock)
						var anltsList = []
						newstock.analysts.forEach(function(anlst) {
							anltsList.push(anlst)
						})

						console.log('newstock',newstock)
						user.psudoPrtfl.push({stock:newstock._id,anlsts:{chsnAnlsts:anltsList, notChsnAnlsts:[]}})
						
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
			user.psudoPrtfl.forEach(function(el,idx) {
				if (el.stock == req.body.stock) {
					stockIndex = idx;
				}
			})
			user.psudoPrtfl.splice(stockIndex,1)

			user.save(function(err, user){
				if(err) return console.log(err)
				console.log("REMOVED STOCK FROM USER PORTFOLIO");
				res.json(user)
				})
			})
	},
	rmAnlst: function(req,res){
		console.log('req.body',req.body);
		var anlstId = req.params.anlstId;
		var userId = req.params.id;
		var psudoPrtflIdx;
		var chosenIdx = req.body.anlstIdx

		User.findOne({_id: userId}, function(err, user){
			if(err) return console.log("user, error",user,err)

			user.psudoPrtfl.forEach(function(el,idx) {
				if (el.stock == req.body.stockId) {
					psudoPrtflIdx = idx;
				}
			}) // END OF fIRST FOR EACH

			// MOVE ANLST FROM CHSN TO NOTCHSN
			var removedAnlsts = user.psudoPrtfl[psudoPrtflIdx].anlsts.chsnAnlsts.splice(chosenIdx,1);
			user.psudoPrtfl[psudoPrtflIdx].anlsts.notChsnAnlsts.push(removedAnlsts[0]);

			user.save(function(err, updatedUser){
				if(err) return console.log(err)
				console.log("updatedUser.psudoPrtfl[0]",updatedUser.psudoPrtfl[0]);
				res.json({
					chsnAnlsts    : updatedUser.psudoPrtfl[psudoPrtflIdx].anlsts.chsnAnlsts,
					notChsnAnlsts : updatedUser.psudoPrtfl[psudoPrtflIdx].anlsts.notChsnAnlsts
				});
			})
		}) // END FIND USER
	},
	addAnlst: function(req,res){
		console.log('req.body',req.body);
		var anlstId = req.params.anlstId;
		var userId = req.params.id;
		var psudoPrtflIdx;
		var chosenIdx = req.body.anlstIdx

		User.findOne({_id: req.params.id}, function(err, user){
			if(err) return console.log("user, error",user,err)

			user.psudoPrtfl.forEach(function(el,idx) {
				if (el.stock == req.body.stockId) {
					psudoPrtflIdx = idx;
				}
			}) // END OF fIRST FOR EACH

			// MOVE ANLST FROM CHSN TO NOTCHSN
			var removedAnlsts = user.psudoPrtfl[psudoPrtflIdx].anlsts.notChsnAnlsts.splice(chosenIdx,1);
			user.psudoPrtfl[psudoPrtflIdx].anlsts.chsnAnlsts.push(removedAnlsts[0]);

			user.save(function(err, updatedUser){
				if(err) return console.log(err)
				console.log("updatedUser.psudoPrtfl[0]",updatedUser.psudoPrtfl[0]);
				res.json({
					chsnAnlsts    : updatedUser.psudoPrtfl[psudoPrtflIdx].anlsts.chsnAnlsts,
					notChsnAnlsts : updatedUser.psudoPrtfl[psudoPrtflIdx].anlsts.notChsnAnlsts
				});
			})
		}) // END FIND USER
	},

	// delete a user
	delete: function(req,res){
		User.findOneAndRemove({_id: req.params.id}, function(err){
			if(err) return console.log(err)
			res.json({success: true, message: "User Deleted!"})
		})
	}
}
