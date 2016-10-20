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

angular.module('myApp').factory('stockService',
  ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {

    var apiStockUrl = '/user/scrape/stock'
    var apiUserUrl = '/user/'

    return ({
      index: index,
      show: show,
      create: create,
      update: update,
      destroy: destroy,
      getUserPortfolio: getUserPortfolio,
      addAnlst: addAnlst,
      rmAnlst: rmAnlst
    })

    // factory functions:
    function index(){
      return $http.get(apiStockUrl + 's')
      // handle success
      .success(function (data) {
        if(data){
          // console.log('data',data)
        } else {
          console.log('error at get stocks?')
        }
      })
      // handle error
      .error(function (data) {
          console.log('error:',data)
      })
    }

    function show(id){
      //console.log("stock service show running");
      return $http.get(apiStockUrl + '/' + id)
    }
    function getUserPortfolio(id){
      //console.log("stock service show running");
      return $http.get(apiUserUrl + id + '/portfolio')
    }

    function create(data){
      return $http.post(apiUserUrl, data)
    }

    function update(data){
      return $http.patch(apiUserUrl + data.user, data)
    }

    function destroy(data){
      return $http.delete(apiUserUrl + data.user + '/removestock',data)
    }
    function addAnlst(data){
      return $http.patch(apiUserUrl + data.userId+'/addAnlst'+data.anlstId,data)
    }

    function rmAnlst(data){
      // console.log('userId, anlstId',userId, anlstId);
      return $http.patch(apiUserUrl + data.userId +'/rmAnlst/'+ data.anlstId,data)
    }
}])
