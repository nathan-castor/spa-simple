var myApp = angular.module('myApp', ['ui.router'])

myApp.config(function ($stateProvider, $urlRouterProvider) {
// , AuthService, stockService
  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      restricted: false,
      controller: 'mainController as main'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginController as loginCtrl'
    })
    .state('logout', {
      url: '/logout',
      controller: 'logoutController'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'registerController as registerCtrl'
    })
    .state('portfolio', {
      url: '/portfolio',
      template: '<h1>This is page portfolio!</h1>'
    })
    .state('stock', {
      url: '/stock/:id',
      templateUrl: 'templates/stock.html',
      controller: 'stockController as sc',
      restricted: true,
      resolve: 
      {
        user: function(AuthService){
          AuthService.getUserStatus()
            .then(function(data){
              var currentUser = data.data.user
              console.log('currentUser',currentUser);
              return currentUser
            }) 
        }
        // ,
        // stock: function (stockService) {
        //   stockService.show($stateParams.id).success(function(results){
        //     return results;
        //   })
        // }
      }
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/profile.html',
      restricted: true
    })

})

myApp.run(function ($rootScope, $location, $state, AuthService) {
  $rootScope.$on("$stateChangeError", console.log.bind(console));
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    AuthService.getUserStatus()
    .then(function(){
      // console.log(toState)
      if (toState.restricted && !AuthService.isLoggedIn()){
        // $location.path('/login')
        $state.go('login');
      }
    })
  })
})
