'Use Strict';
angular.module('App').controller('searchController', function($scope, $state,  $ionicHistory, $ionicTabsDelegate) {
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
