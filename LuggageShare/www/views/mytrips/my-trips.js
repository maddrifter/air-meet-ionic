'Use Strict';
angular.module('App').controller('MyTripsController', function($scope, $localStorage, $state,  $ionicHistory, $ionicTabsDelegate, Service) {
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

  // Get formatted Date string
  $scope.getFormattedDate = function(dateStr) {
    var date = new Date(dateStr);
    return date.getDate() + ' ' + monthList[date.getMonth()] + ' ' + date.getFullYear();
  };

  $scope.$on('$ionicView.enter', function() {
      // $scope.changedProfilePic = false;
      // //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      // $scope.canChangeView = false;
      // //Select the 4th tab on the footer to highlight the profile icon.
      $scope.trips = Service.getTripList();
      console.log(Service.getTripList());
      $ionicTabsDelegate.select(2);
  });
 // Transite to Trip Detail Information Page
  $scope.tripDetail = function(param, index){
    if (param == 'Edit'){
      $localStorage.tripId = $scope.trips[index].id;
    }
    $state.go('tripDetail', {mode : param, index : index});
  };
  // Remove a trip
  $scope.removeTrip =  function(index) {
    var tripId = $scope.trips[index].id;
    firebase.database().ref('accounts/' + $localStorage.accountId).child("myTrips").once('value', function(myTrips){
      var trips = myTrips.val();
      var deleteTripsIndex = -1;
      if (trips){
        console.log("My Trips : ", trips);
        for(var i = 0 ; i < trips.length ; i++){
            if(trips[i].trip == tripId) {
              deleteTripsIndex = i;
            }
        }
        //Remove from the myTrips list
        console.log(deleteTripsIndex);
        if (deleteTripsIndex != -1){
          trips.splice(deleteTripsIndex, 1);
        }
        console.log("After remove : " , trips);

        firebase.database().ref('accounts/' + $localStorage.accountId).update({
          myTrips : trips
        });
        //Remove from Trips list
        var ref = firebase.database().ref('trips/');
        ref.child(tripId).remove();
      }
    });
  }

});
