'Use Strict';
angular.module('App').controller('MyTripsController', function($scope, $state,  $ionicHistory, $ionicTabsDelegate, tripArray) {
  // $scope.$on('$stateChangeStart', function(event) {
  //   if (!$scope.canChangeView) {
  //     event.preventDefault();
  //   }
  // });

  var monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.getFormattedDate = function(dateStr) {
    var date = new Date(dateStr);
    return date.getDate() + ' ' + monthList[date.getMonth()] + ' ' + date.getFullYear();
  };

  $scope.$on('$ionicView.enter', function() {
      // $scope.changedProfilePic = false;
      // //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      // $scope.canChangeView = false;
      // //Select the 4th tab on the footer to highlight the profile icon.
      $scope.trips = tripArray;
      $ionicTabsDelegate.select(2);
  });

  $scope.tripDetail = function(param, index){
    $state.go('tripDetail', {mode : param, index : index});
  };
})
.constant('tripArray', [
  {
    from : "sydney",
    to : "shanghai",
    dateTime : "7 Nov 23:23",
    flightNumber : "RQ123",
    modeOfTransport : "plane",
  },
  {
    from : "New York",
    to : "Dubai",
    dateTime : "7 Nov 23:23",
    flightNumber : "RQ123",
    modeOfTransport : "plane",
  },
  {
    from : "Sydney",
    to : "Deli",
    dateTime : "7 Nov 23:23",
    flightNumber : "RQ123",
    modeOfTransport : "train",
  },
]);
