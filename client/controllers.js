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
  stockController.$inject = ['stockService', '$state', '$stateParams', '$scope', '$window']
  

function mainController($rootScope, $state, AuthService) {
  var vm = this
  $rootScope.$on('$stateChangeStart', function (event) {
    // console.log("Changing states")
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
      })
  })
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

function stockController(stockService, $state, $stateParams, $scope, $window){
  var vm = this
  vm.title = "Stock Controller"
  vm.newStock = {}
  vm.stocks = []
  vm.stock = {}

  stockService.index().success(function(results){
    vm.stocks = results
    //console.log(results);
  })

  //console.log("state",$state.current.name);
  if ($state.current.name == 'stockdetail') {
    stockService.show($stateParams.id).success(function(results){
      //console.log("this here is the vm.stock",vm.stock)
      vm.stock = results
    })
  }

  vm.create = function(){
    // run the stockService create method here.
    stockService.create(vm.newStock).success(function(response){
      $state.go('home', {id: response.stock._id}) // fix the destination
    })
  }

  vm.destroy = function(id, index){
    stockService.destroy(id).success(function(response){
      console.log(response)
      vm.stocks.splice(index, 1)
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
  vm.isStocked = function(stock) {
    //console.log("the vm.user in StockCtrl:", vm.user);
    //console.log("the userPortfolio in localStorage:", $window.localStorage['userPortfolio']);
    //$scope.$parent.global.user
    if (stock && $window.localStorage['currentUser']) {
      var portF = $window.localStorage['userPortfolio'].split(',')
      //console.log("portF",portF);
      if ($window.localStorage['userPortfolio'].indexOf(stock) != -1) {
          return true
        }
        return false
    }
  }

}

