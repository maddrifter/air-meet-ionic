'Use Strict';
angular.module('App').controller('searchDetailController', function($scope, $state, $stateParams, Service, Watchers,$localStorage, $ionicHistory, $ionicTabsDelegate) {
  // $scope.$on('$stateChangeStart', function(event) {
  //   if (!$scope.canChangeView) {
  //     event.preventDefault();
  //   }
  // });

  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.back = function(){
    $scope.canChangeView = true;
    $state.go("search");
  }

  $scope.$on('$ionicView.enter', function() {


      var tripInfo = Service.getSearchedTripOf($stateParams.index);
      var tripVal = tripInfo.trip;
      if (tripVal) {
        $scope.trip = {
          from : tripInfo.trip.from,
          to : tripInfo.trip.to,
          traveler : tripInfo.traveler,
          date : new Date(tripInfo.trip.dateTime),
          flightNumber : tripInfo.trip.flightNumber,
          weightAvailable : tripInfo.trip.weightAvailable,
          dimension : tripInfo.trip.sizeAvailable,
          modeOfTransport : tripInfo.trip.modeOfTransport,
          tripId : tripInfo.trip.id,
        };

        firebase.database().ref('accounts/' + $scope.trip.traveler).once('value', function(account) {
           var traveler = account.val();
           var travelerName = traveler.name;
           $scope.trip['travelerName'] = travelerName;
           console.log("!!!===", scope.trip);
        });
      }


      $scope.changedProfilePic = false;
      // Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      $scope.canChangeView = false;
      // Select the 4th tab on the footer to highlight the profile icon.
      $ionicTabsDelegate.select(0);
  });
});
