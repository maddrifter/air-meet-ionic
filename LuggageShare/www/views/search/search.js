'Use Strict';
angular.module('App').controller('searchController', function($scope, $state,  $ionicHistory, $ionicTabsDelegate, $ionicPlatform, $localStorage, Watchers, Service, Popup) {
  // $scope.$on('$stateChangeStart', function(event) {
  //   if (!$scope.canChangeView) {
  //     event.preventDefault();
  //   }
  // });

  var placeFlag = 0, destinationFlag = 0, dateFlag = 0;

  $scope.searchedTrips = [];
  $scope.searchedTrips = Service.getSearchedTripsList();

  $scope.searchObj = {
    startPlace: '',
    destination: '',
    startDate: new Date()
  };

  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.$on('$ionicView.enter', function() {

      //Check if there's an authenticated user, if there is non, redirect to login.
      if (firebase.auth().currentUser) {
        //Set status to online or offline on Firebase.
        $scope.loggedIn = true;
        $ionicPlatform.ready(function() {
          document.addEventListener("deviceready", function() {
            if ($localStorage.accountId) {
              firebase.database().ref('accounts/' + $localStorage.accountId).update({
                online: true
              });
            }
          }, false);
          document.addEventListener("resume", function() {
            if ($localStorage.accountId) {
              firebase.database().ref('accounts/' + $localStorage.accountId).update({
                online: true
              });
            }
          }, false);
          document.addEventListener("pause", function() {
            if ($localStorage.accountId) {
              firebase.database().ref('accounts/' + $localStorage.accountId).update({
                online: false
              });
            }
          }, false);
        });
      } else {
        $scope.loggedIn = false;
        $state.go('login');
      }

      //Check if Watchers already attached, if not, reload to reload all controllers and attach the watcher once. Watchers should only be attached ONCE.
      if (!Watchers.watchersAttached()) {
        //Initialize Service and Watchers
        console.log("Attaching Watchers");
        Watchers.addUsersWatcher();
        Watchers.addProfileWatcher($localStorage.accountId);
        // Watchers.addNewFriendWatcher($localStorage.accountId);
        Watchers.addNewConversationWatcher($localStorage.accountId);
        // Watchers.addFriendRequestsWatcher($localStorage.accountId);
        Watchers.addRequestsSentWatcher($localStorage.accountId);
        Watchers.addMyTripWatcher($localStorage.accountId);
        Watchers.addMyItmesWatcher($localStorage.accountId);
        // Watchers.addNewGroupWatcher($localStorage.accountId);
      }
      //When input search items - startPlace , destination, startDate
      $scope.$watch('searchObj.startPlace', function(newValue){
        console.log('=====', newValue);
        if (newValue.length > 0) {
          placeFlag = 1;
        } else {
          placeFlag = 0;
        }
        triggerFirebaseSearch();
      });
      $scope.$watch('searchObj.destination', function(newValue){
        console.log('=====', newValue);
        if (newValue.length > 0) {
          destinationFlag = 1;
        } else {
          destinationFlag = 0;
        }
        triggerFirebaseSearch();
      });
      $scope.$watch('searchObj.startDate', function(newValue){
        triggerFirebaseSearch();
      });
      //Trigger firebase search.
      var triggerFirebaseSearch = function() {
        if (destinationFlag * placeFlag == 1){
          console.log("=====API Request");
          updateTripsList();
        } else {
          $scope.searchedTrips.splice(0, $scope.searchedTrips.length);
        }
      };
      var updateTripsList = function() {
        Service.removeSearchedTripList();
        firebase.database().ref("trips/").once('value', function(allTripsRef){
           var allTrips = allTripsRef.val();
           if (allTrips) {
              for (var key in allTrips) {
                console.log(allTrips[key]);
                var tripInfo = allTrips[key].trip;
                var startDate = new Date($scope.searchObj.startDate);
                var tripDate = new Date(tripInfo.dateTime);
                if (tripInfo.from.indexOf($scope.searchObj.startPlace) !== -1 && tripInfo.to.indexOf($scope.searchObj.destination) !== -1 && startDate <= tripDate){
                  console.log("=======", allTrips[key]);
                  Service.addSearchedTripList(allTrips[key]);
                }
              }
           }
           $scope.$apply(function() {
             $scope.searchedTrips = Service.getSearchedTripsList();
           });
        });
      };

      $scope.changedProfilePic = false;
      // Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      $scope.canChangeView = false;
      // Select the 4th tab on the footer to highlight the profile icon.
      $ionicTabsDelegate.select(0);
  });

  $scope.travelerDetail = function(index) {
    $ionicHistory.nextViewOptions({ disableAnimate : true});
    $scope.canChangeView = true;
    $state.go("searchDetail", {index : index});
  };
});
