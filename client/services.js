angular.module('myApp').factory('AuthService',
  ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {

    // create user variable
    var user = null

    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register
    })

    function isLoggedIn() {
      if(user) {
        return true
      } else {
        return false
      }
    }

    function getUserStatus() {
      return $http.get('/user/status')
      // handle success
      .success(function (data) {
        if(data.status){
          user = true
        } else {
          user = false
        }
      })
      // handle error
      .error(function (data) {
        user = false
      })
    }

    function login(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer()

      // send a post request to the server
      $http.post('/user/login',
        {username: username, password: password})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            user = true
            deferred.resolve()
          } else {
            user = false
            deferred.reject()
          }
        })
        // handle error
        .error(function (data) {
          user = false
          deferred.reject()
        })

      // return promise object
      return deferred.promise

    }

    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer()

      // send a get request to the server
      $http.get('/user/logout')
        // handle success
        .success(function (data) {
          user = false
          deferred.resolve()
        })
        // handle error
        .error(function (data) {
          user = false
          deferred.reject()
        })

      // return promise object
      return deferred.promise

    }

    function register(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer()

      // send a post request to the server
      $http.post('/user/register',
        {username: username, password: password})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve()
          } else {
            deferred.reject()
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject()
        })

      // return promise object
      return deferred.promise

    }

}])

(function(){
  angular.module('myApp')
    .factory('stockService', stockService)

  stockService.$inject = ['$http']

  function stockService($http){
    var apiStockUrl = '/api/scrape/stock'
    var apiUserUrl = '/api/users/'
    var service = {
      index: index,
      show: show,
      create: create,
      update: update,
      destroy: destroy
    }
    return service

    // factory functions:
    function index(){
      return $http.get(apiStockUrl + 's')
    }

    function show(id){
      //console.log("stock service show running");
      return $http.get(apiStockUrl + '/' + id)
    }

    function create(data){
      return $http.post(apiUserUrl, data)
    }

    function update(id, data){
      return $http.patch(apiUserUrl + id, data)
    }

    function destroy(id){
      return $http.delete(apiUserUrl + id + '/removestock')
    }
  }
})()
