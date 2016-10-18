angular.module('myApp')
  .controller('mainController', mainController)
  .controller('loginController', loginController)
  .controller('logoutController', logoutController)
  .controller('registerController', registerController)
  .controller('stockController', stockController)


  mainController.$inject = ['$rootScope', '$state', 'AuthService']
  loginController.$inject = ['$state', 'AuthService']
  logoutController.$inject = ['$state', 'AuthService']
  registerController.$inject = ['$state', 'AuthService']
  stockController.$inject = ['stockService', 'AuthService', '$state', '$stateParams', '$scope', '$window']


function mainController($rootScope, $state, AuthService) {
  var vm = this
  $rootScope.$on('$stateChangeStart', function (event) {
    // console.log("Changing states")
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
      })
  })
  vm.loggedIn = function() {
    if (AuthService.isLoggedIn()) {
      // console.log('user',vm.currentUser)
      return true;
    }else{
      // console.log('loggedIn didnt work or not logged in')
      return false;
    }
  }
  vm.logout = function() {
    AuthService.logout()
  }
}

// LOGIN CONTROLLER:
function loginController($state, AuthService) {
  var vm = this
  vm.login = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call login from service
    AuthService.login(vm.loginForm.username, vm.loginForm.password)
      // handle success
      .then(function () {
        console.log("Successful login...")
        $state.go('profile')
        vm.disabled = false
        vm.loginForm = {}
      })
      // handle error
      .catch(function () {
        console.log("Whoops...")
        vm.error = true
        vm.errorMessage = "Invalid username and/or password"
        vm.disabled = false
        vm.loginForm = {}
      })
  }
}


// LOGOUT CONTROLLER:
function logoutController($state, AuthService) {
  var vm = this
  vm.logout = function () {

    // call logout from service
    AuthService.logout()
      .then(function () {
        $state.go('login')
      })
  }
}

// REGISTER CONTROLLER:
function registerController($state, AuthService) {
  var vm = this
  vm.register = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call register from service
    AuthService.register(vm.registerForm.username, vm.registerForm.password)
      // handle success
      .then(function () {
        $state.go('profile')
        vm.disabled = false
        vm.registerForm = {}
      })
      // handle error
      .catch(function () {
        vm.error = true
        vm.errorMessage = "Something went wrong!"
        vm.disabled = false
        vm.registerForm = {}
      })
  }
}

function stockController(stockService, AuthService, $state, $stateParams, $scope, $window){
  var vm = this
  vm.title = "Stock Controller"
  vm.newStock = {}
  vm.stocks = []
  vm.stock = {}
  vm.prtflStockIds=[]
  // vm.loStoPrtfl = {}

  // GET USER WAS HERE //

  stockService.index().success(function(results){
  vm.stocks = results
  })
  vm.addStock = function(data) {
    stockService.update(data).success(function(response) {
      console.log("response from mainCtrl update",response);
      // ##### PUSH NEW STOCK TO LOSTOPRTFL #####
      vm.prtflStockIds.push(response._id)
      vm.isStocked(data.stock) //data.stock
    })
  }

  vm.removeStock = function(data) {
    stockService.destroy(data).success(function(response) {
      // vm.prtflStockIds.splice(vm.prtflStockIds.indexOf(data.stock),1)
      vm.isStocked(data.stock) //data.stock
    })
  }
  /// ########### CHECK STATE FOR --PROFILE-- AND SET SOME STUFF ############
  if ($state.current.name == 'profile') {
    AuthService.getUserStatus()
      .then(function(data){
        vm.theUser = data.data.user

      stockService.getUserPortfolio(vm.theUser._id).success(function(results){
        vm.userPortfolio = results
        console.log("vm.userPortfolio",vm.userPortfolio)
      })
    })
    vm.removeStock = function(data) {
      stockService.destroy(data).success(function(response) {
        location.reload();
        // vm.isStocked(data.stock) //data.stock
      })
    }
  }

  /// ########### CHECK STATE FOR STOCK AND SET SOME STUFF ############
  if ($state.current.name == 'stock') {
    stockService.show($stateParams.id).success(function(results){
      vm.stock = results
      // console.log("stock@@@@",vm.stock)
    })
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
        vm.prtflStockIds = vm.currentUser.prtfl.stocks
        // console.log('vm.prtflStockIds',vm.prtflStockIds)
        // vm.currentUser.sudoPrtfl.forEach(function(el,idx) {
        //   if (el.stock == vm.stock._id) {
        //     vm.loStoPrtfl = el
        //   }
        // })
        //   console.log('vm.loStoPrtfl',vm.loStoPrtfl)
      })

      vm.addStock = function(data) {
        stockService.update(data).success(function(response) {
          console.log("response from mainCtrl update",response);
          // ##### PUSH NEW STOCK TO LOSTOPRTFL #####
          vm.prtflStockIds.push(response._id)
          vm.isStocked(data.stock) //data.stock
        })
      }

      vm.removeStock = function(data) {
        stockService.destroy(data).success(function(response) {
          // vm.prtflStockIds.splice(vm.prtflStockIds.indexOf(data.stock),1)
          vm.isStocked(data.stock) //data.stock
        })
      }

  vm.buySell = function() {
    //console.log("buySell stock:", vm.stock);
    var price = vm.stock.price
    var safe = vm.stock.treasuryYield
    var beta = vm.stock.beta
    var fiveYearMarket = 9
    var aveTarget = vm.stock.aveTGT
    var shouldReturn = safe + beta * (fiveYearMarket - beta);
    var expectedReturn = (aveTarget-price)/price * 100;
    if (expectedReturn >= shouldReturn) {
      return true
    }else {
      return false
    }
  }

  // find a way to run this after the page loads, it's being called on stockdetails view
  vm.isStocked = function(x) {
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
        vm.prtflStockIds = vm.currentUser.prtfl.stocks
        // console.log('stock in isStocked',stock);
        console.log('vm.prtflStockIds',vm.prtflStockIds);
        console.log('vm.prtflStockIds.indexOf(vm.stock._id)',vm.prtflStockIds.indexOf(vm.stock._id));
      if (vm.prtflStockIds.indexOf(vm.stock._id) != -1 || vm.prtflStockIds.indexOf(x) != -1) {
        vm.stocked = true;
        console.log('vm.stocked',vm.stocked);
        // return false
      }else{
        vm.stocked = false;
        console.log('vm.stocked',vm.stocked);
        // return true
      }
    })
  }
  vm.isStocked(vm.stock._id) //vm.stock._id

    // vm.allChsn = vm.currentUser.sudoPrtfl.anlsts.chsnAnlsts;
    // vm.allNotChsn = vm.currentUser.sudoPrtfl.anlsts.notChsnAnlsts;

    vm.aveTGT = function (thisAnlst) {
      var totalTGT = 0;
      vm.allChsn.forEach(function (el,idx) {
        if (thisAnlst._id == el) {
          vm.totalTGT += thisAnlst.target
        }
      })
    }

    // ### THIS STUFF IS FOR CRUD ON CHSN-ANLSTS ###
    vm.logAnlst = function (anlst) {
      console.log('logAnlst HAPPENED')
      $window.alert(anlst)
      console.log('log anlst:',anlst)
    }
    vm.rmAnlst = function(data) {
      // loStoPrtfl
      stockService.rmAnlst(data).success(function(response) {
        // WHAT ELSE NEEDS TO HAPPEN?
      })
    }
    vm.addAnlst = function(data) {
      data.stock = vm.stock._id
      stockService.addAnlst(data).success(function(response) {
      })
    }
    vm.isChsn = function (anlst) {

    }
    vm.isChsnFirst = function(anlst) {

      return true;
    }
    vm.newAveTgt = function(stock) {
      // Ill need to make a new aveTgt variable
    }

  }// END OF IF STATE IS STOCK

}
