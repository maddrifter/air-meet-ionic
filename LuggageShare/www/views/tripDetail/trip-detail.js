'Use Strict';
angular.module('App').controller('TripDetailController', function($scope, $state, $stateParams,  $ionicHistory, $ionicTabsDelegate, Service) {
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
        $scope.tripInfo = Service.getTripOf(index);
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
      Service.replaceTrip(index, $scope.tripInfo);
    } else {
      if ($scope.tripInfo.dateTime == "") {
        $scope.tripInfo.dateTime = new Date();
      }
      Service.addTrip($scope.tripInfo);
    }
    $scope.back();
  };

  $scope.back = function(){
    $scope.canChangeView = true;
    // $scope.clearTripInfo();
    $state.go("mytrips");
  };

});
