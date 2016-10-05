var express = require('express')
var router = express.Router()
var passport = require('passport')

var User = require('../models/User.js')
var stockCtrl = require('../controllers/stock.server.controller.js')

router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username }),
    req.body.password, function(err, account) {
    if (err) {
      return res.status(500).json({
        err: err
      })
    }
    passport.authenticate('local')(req, res, function () {
      return res.status(200).json({
        status: 'Registration successful!'
      })
    })
  })
})

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(401).json({
        err: info
      })
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        })
      }
      res.status(200).json({
        status: 'Login successful!',
        user: user
      })
    })
  })(req, res, next)
})

router.get('/logout', function(req, res) {
  req.logout()
  res.status(200).json({
    status: 'Bye!'
  })
})

router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    })
  }
  res.status(200).json({
    status: true,
    user: req.user
  })
})

// ////////////////////////////////////////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
// ////////////////////////////////////////////
// routes to use the API to get stock information
// routes to use the API to get stock information
router.route('/scrape/stocks')
  // .get(stockCtrl.indexCompanies)
  .get(stockCtrl.getAll)
  .post(stockCtrl.postAll)
  .patch(stockCtrl.updateAll)

router.route('/scrape/stocks/show')
  .get(stockCtrl.showCompany)
  .post(stockCtrl.postCompany)

router.route('/scrape/stock/:company/:id')
  .patch(stockCtrl.updateCompany)


// are my routes conflicting?????
router.route('/scrape/stock/:id')
  .get(stockCtrl.showStock)
  .delete(stockCtrl.deleteStock)

router.route('/scrape/analysts')
  .get(stockCtrl.indexAnalysts)


module.exports = router