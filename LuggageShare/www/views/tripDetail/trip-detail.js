'Use Strict';
angular.module('App').controller('TripDetailController', function($scope, $state, $stateParams,  $ionicHistory, $ionicTabsDelegate, tripArray) {
  // $scope.$on('$stateChangeStart', function(event) {
  //   if (!$scope.canChangeView) {
  //     event.preventDefault();
  //   }
  // });
  $scope.tripInfo = {
    from : "",
    to : "",
    dateTime: "",
    weightAvailable : "",
    sizeAvailable : "",
    flightNumber: "",
    modeOfTranport : ""
  }

  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.$on('$ionicView.enter', function() {
      // $scope.changedProfilePic = false;
      // //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      // $scope.canChangeView = false;
      // //Select the 4th tab on the footer to highlight the profile icon.
      $scope.mode = $stateParams.mode;
      if ($scope.mode == "Edit") {
        var index = $stateParams.index;
        console.log("The index of trip is " + index);
        var trip = tripArray[index];
        $scope.tripInfo.from = trip.from;
        $scope.tripInfo.to = trip.to;
        $scope.tripInfo.dateTime = new Date(trip.dateTime);
        $scope.tripInfo.modeOfTransport = trip.modeOfTransport;
        $scope.tripInfo.flightNumber = trip.flightNumber;
      }

      $ionicTabsDelegate.select(2);
  });
  $scope.clearTripInfo = function() {
    $scope.tripInfo.from = "";
    $scope.tripInfo.to = "";
    $scope.tripInfo.dateTime = "";
    $scope.tripInfo.modeOfTransport = "";
    $scope.tripInfo.flightNumber = "";
  };
  $scope.saveTrip = function() {
    if ($scope.mode == "Edit") {
      var index = $stateParams.index;
      tripArray[index] = $scope.tripInfo;
      console.log(tripArray);
    } else {
      console.log($scope.tripInfo);
      tripArray.push($scope.tripInfo);
      if ($scope.tripInfo.dateTime == "") {
        $scope.tripInfo.dateTime = new Date();
      }
    }
    $scope.back();
  };
  $scope.cancel = function() {
      $scope.back();
  };
  $scope.back = function(){
    $scope.canChangeView = true;
    // $scope.clearTripInfo();
    $state.go("mytrips");
  };

});
