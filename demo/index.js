'use strict';
var uibTreeApp = angular.module('uibTreeApp', [
	'ngAnimate',
	'ngTouch',
	'ui.router',
	'ui.bootstrap',
	'ui.bootstrap.tree',
	'oc.lazyLoad'
]).run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;
}]).config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/overview');
	$stateProvider
		.state('overview', {
			url: '/overview',
			templateUrl: 'tpl/overview.html',
			resolve: {
				loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load('controller/overview.js');
				}]
			}
		})
		.state('simple', {
			url: '/simple',
			templateUrl: 'tpl/simple.html',
			resolve: {
				loadCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
					return $ocLazyLoad.load('controller/simple.js');
				}]
			}
		});
}]).config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
	$ocLazyLoadProvider.config({
		debug: true
	});
}]).config(['$controllerProvider', '$provide',function($controllerProvider,$provide){
	uibTreeApp.controller = $controllerProvider.register;
	uibTreeApp.service    = $provide.service;
}]);
