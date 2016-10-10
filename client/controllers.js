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
  var prtflStockIds=[]
  var loStoPrtfl = []

  // GET USER WAS HERE //

  stockService.index().success(function(results){
  vm.stocks = results
  //console.log(results);
  })

  /// ########### CHECK STATE FOR STOCK AND SET SOME STUFF ############
  if ($state.current.name == 'stock') {
    stockService.show($stateParams.id).success(function(results){
      vm.stock = results
      // console.log("stock",vm.stock)
    })
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
        prtflStockIds = vm.currentUser.prtfl.stocks
        console.log('prtflStockIds',prtflStockIds)
        if (localStorage.getItem('userPrtfl') != null) {
          loStoPrtfl = JSON.parse(localStorage.getItem('userPrtfl'))
        }else{
          loStoPrtfl = vm.currentUser.prtfl.stocks.map(function(obj){
            console.log('obj',obj)
            var rObj = {stock:obj._id, chsnAnlsts:obj.analysts, rmvAnlst:[]};
            return rObj;
          })
          localStorage.setItem('userPrtfl',JSON.stringify(loStoPrtfl))
        }
          
          console.log('loStoPrtfl',loStoPrtfl)
        })
  }

  // vm.create = function(){
  //   // run the stockService create method here.
  //   stockService.create(vm.newStock).success(function(response){
  //     $state.go('home', {id: response.stock._id}) // fix the destination
  //   })
  // }

  // vm.destroy = function(id, index){
  //   stockService.destroy(id).success(function(response){
  //     console.log(response)
  //     vm.stocks.splice(index, 1)
  //   })
  // }

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
    // console.log('prtflStockIds',prtflStockIds)
    if (prtflStockIds.indexOf(stock) == -1) {
      return false
    }else{
      return true
    }
  }
  var stocked = vm.isStocked(vm.stock)

  vm.addStock = function(data) {
      stockService.update(vm.currentUser._id,data).success(function(response) {
        console.log("response from mainCtrl update",response);
        // ##### PUSH NEW STOCK TO LOSTOPRTFL #####
        loStoPrtfl.push({stock:response._id, chsnAnlsts:response.analysts, rmvAnlst:[]})
        localStorage.setItem('userPrtfl',JSON.stringify(loStoPrtfl))
        console.log('stocked',stocked)
        // location.reload();
      })
    }

    vm.removeStock = function(data) {
      stockService.destroy(vm.currentUser._id,data).success(function(response) {
        // ##### REMOVE STOCK FROM LOSTO PRTFL ##### //
        var stockId = data.stock
        var filtered = loStoPrtfl.filter(function(el,idx){
          // console.log('Stock ID:',stockId)
          console.log(el.stock,stockId)
          return el.stock != stockId
        })
        loStoPrtfl = filtered
        console.log('filtered',filtered)
        localStorage.setItem('userPrtfl',JSON.stringify(filtered))
        console.log('stocked',stocked)
        
        // location.reload();

      })
    }

    // ### THIS STUFF IS FOR CRUD ON CHSN-ANLSTS ###
    vm.logAnlst = function (anlst) {
      console.log('logAnlst HAPPENED')
      $window.alert(anlst)
      console.log('log anlst:',anlst)
    }
    vm.rmAnlst = function(stock) {
      // loStoPrtfl
    }
    vm.addAnlst = function(stock) {
      
    }
    vm.isChsn = function(anlst) {
      var chsnAnlstIds = []
      // console.log('loStoPrtfl',loStoPrtfl)
      loStoPrtfl.forEach(function(el,idx) {
        // console.log('el',el)
        if(el.stock == vm.stock._id){
          el.chsnAnlsts.forEach(function(elmnt) {
            chsnAnlstIds.push(elmnt._id)
          })
        }
      })
      // console.log('chsnAnlstIds',chsnAnlstIds)
      if (chsnAnlstIds.indexOf(anlst) == -1) {
        return false;
      }else{return true}
    }
    vm.newAveTgt = function(stock) {
      // Ill need to make a new aveTgt variable
    }

}

