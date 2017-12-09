'use strict';

//***************************************

// Main Application

// To get direct links to audio files in Google Drive:
// http://directlink.booogle.net/

//***************************************

angular.module('app', [
  'ui.router',
  'ngAnimate'
])

  .run(
    ['$sce', '$timeout', '$rootScope', '$state', '$stateParams',
      function ($sce, $timeout, $rootScope, $state, $stateParams) {

        // It's very handy to add references to $state and $stateParams to the
        // $rootScope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        var Airtable = require('airtable');
        $rootScope.Airtable = new Airtable({apiKey: 'keyNIbNk17BU31gT8'}).base('appKLD3WxfSgA0ad4');


      }
    ]
  )

  .config(
    ['$locationProvider', '$stateProvider', '$urlRouterProvider',
      function ($locationProvider, $stateProvider, $urlRouterProvider) {



        /////////////////////////////
        // Redirects and Otherwise //
        /////////////////////////////

        // Use $urlRouterProvider to configure any redirects (when) and invalid
        // urls (otherwise).
        $urlRouterProvider
          .when('/admin', '/admin/students');

        //.otherwise(token ? '/sites' : '/start');

        //////////////////////////
        // State Configurations //
        //////////////////////////
        $stateProvider
          .state("students", {
            url: '/admin/students',
            templateUrl: 'views/students.html',
            // auth: true,
            /*resolve: {
                cards: function ($stateParams, $rootScope, $http) {

                }
            },*/
            controller: function ($scope, $rootScope, $state, $filter, $http) {

              var data = [];
              $rootScope.Airtable('Students').select({
                sort: [
                  {field: 'LastName', direction: 'asc'}
                ]
              }).eachPage(function page(records, fetchNextPage) {
                records.forEach(function (record) {
                  record.fields.id = record.id;
                  data.push(record.fields);
                });

                fetchNextPage();
              }, function done(error) {
                $scope.students = data;
                $scope.$apply();
              });

              $scope.query = '';
              $scope.order = 'Last+Name';
              $scope.setSort = function(key, e) {
                e.preventDefault();
                key = key.replace(/ /g, '+');
                $scope.order = $scope.order == key ? '-' + key : key;
              }

              $scope.checkall = false;
              $scope.checkallClick = function() {
                var arr = $filter('filter')($scope.students, $scope.query);
                for (var i=0; i<arr.length; i++) {
                  arr[i].selected = $scope.checkall;
                }
              };
              $scope.print = function() {
                var students = [];
                for (var i=0; i<$scope.students.length; i++) {
                  if ($scope.students[i].selected) {
                    students.push($scope.students[i].id);
                  }
                }
                $state.go('printAssessment', {students: students.join(',')});
              }

            }
          })

          .state("editAssessment", {
            url: '/admin/student/:student/:type',
            template: '<div assessment edit="true" type="type" student="student"></div>',
            controller: function ($scope, $rootScope, $state, $filter, $http) {
              $scope.type = $state.params.type;
              $scope.student = $state.params.student;
            }
          })

          .state("viewAssessment", {
            url: '/student/:student/:type',
            template: '<div assessment type="type" student="student"></div>',
            controller: function ($scope, $rootScope, $state, $filter, $http) {
              $scope.type = $state.params.type;
              $scope.student = $state.params.student;
            }
          })

          .state("printAssessment", {
            url: '/print/:students',
            templateUrl: 'views/print.html',
            controller: function ($scope, $rootScope, $state, $filter, $http) {
              var students = $state.params.students.split(',');
              $scope.total = students.length;
              $scope.students = [];
              $scope.loading = true;
              var timeout = function() {
                if (students.length) {
                  $scope.progress = $scope.total - students.length;
                  $scope.students.push(students.pop());
                  console.log($scope.students);
                  setTimeout(timeout, 3000);
                }
                else {
                  $scope.loading = false;
                  $scope.$apply();
                }
              }
              timeout();
              $scope.words = 'words';
              $scope.letters = 'letters';
            }
          })

      }
    ]
  );



