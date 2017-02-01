'Use Strict';
angular.module('App').controller('RequestDetailController', function($scope, $filter, $localStorage, $state, $stateParams,  $ionicHistory, $ionicTabsDelegate, Service) {
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
    modeOfTransport : ""
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
      // $scope.canChangeView = faśse;
      // //Select the 4th tab on the footer to highlight the profile icon.
      $scope.mode = $stateParams.mode;
      $scope.clearTripInfo();
      if ($scope.mode == "Edit") {
        var index = $stateParams.index;
        console.log("The index of trip is " + index);
        $scope.tripInfo = Service.getTripOf(index);
        $scope.tripInfo.dateTime = new Date($scope.tripInfo.dateTime);
      }

      $ionicTabsDelegate.select(2);
  });
  $scope.clearTripInfo = function() {
    $scope.tripInfo.from = "";
    $scope.tripInfo.to = "";
    $scope.tripInfo.dateTime = new Date();
    $scope.tripInfo.modeOfTransport = "";
    $scope.tripInfo.flightNumber = "";
    $scope.tripInfo.sizeAvailable = "";
    $scope.tripInfo.weightAvailable = ""
  };


  $scope.back = function(){
    $scope.canChangeView = true;
    // $scope.clearTripInfo();
    $state.go("messages");
  };
  //Broadcast from our Watcher that tells us that a new trip has been made with the user, we then reload the view to accomodate to changes
  // $scope.$on('tripAdded', function(event, args){
  //   if (args.tripId == $localStorage.tripId){
  //     $scope.canChangeView = true;
  //     $state.reload();
  //   } else {
  //     $scope.canChangeView = false;
  //   }
  // });
  //Add My trip, create Firebase data.
  $scope.addTrip = function(tripInfo) {
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account){
      //Check existing the trip
      var hasTrip = false;
      var myTrips = account.val().myTrips;
      if (myTrips) {
        for (var i = 0; i < myTrips.length; i++) {
          if (myTrips[i].trip == $localStorage.tripId) {
            hasTrip = true;
          }
        }
      } else {
        hasTrip = false;
      }

      if (hasTrip) {
        firebase.database().ref('trips/' + $localStorage.tripId).update({
          trip : tripInfo
        });
      } else {
        //Create new trip
        var newTripId = firebase.database().ref('trips/').push({
          traveler : $localStorage.accountId,
          trip : tripInfo,
          dateCreated : Date(),
        }).key;

        firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
            var myTrips = account.val().myTrips;
            if (!myTrips) {
              myTrips = [];
            }
            myTrips.push({
              trip : newTripId,
            });
            firebase.database().ref('accounts/' + $localStorage.accountId).update({
              myTrips : myTrips,
            })
        });
      }
    });
    delete $localStorage.tripId;
  };
});
