'Use Strict';
angular.module('App').controller('searchController', function($scope, $state,  $ionicHistory, $ionicTabsDelegate, $ionicPlatform, $localStorage, Watchers, Service, Popup) {
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
        // Watchers.addNewGroupWatcher($localStorage.accountId);
      }
      $scope.changedProfilePic = false;
      // Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      $scope.canChangeView = false;
      // Select the 4th tab on the footer to highlight the profile icon.
      $ionicTabsDelegate.select(0);
  });

  $scope.travelerDetail = function() {
    $ionicHistory.nextViewOptions({ disableAnimate : true});
    $scope.canChangeView = true;
    $state.go("searchDetail");
  }
});
