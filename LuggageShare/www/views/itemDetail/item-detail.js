'Use Strict';
angular.module('App').controller('ItemDetailController', function($scope, $state,  $ionicHistory, $ionicTabsDelegate, $stateParams, Service) {
  // $scope.$on('$stateChangeStart', function(event) {
  //   if (!$scope.canChangeView) {
  //     event.preventDefault();
  //   }
  // });
  $scope.itemInfo = {
    quantity : 0,
    weight : "",
    dimension: "",
    description : "",
    reward : "",
    status : "default",
    deliverer : "",
    rating : 0,
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

      $scope.mode = $stateParams.mode;
      if ($scope.mode == 'Edit') {
        var index = $stateParams.index;
        $scope.itemInfo = Service.getItemOf(index);
      }

      $scope.changedProfilePic = false;
      // //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      $scope.canChangeView = false;
      // //Select the 4th tab on the footer to highlight the profile icon.
      $ionicTabsDelegate.select(1);
  });

  $scope.back = function(){
    $scope.canChangeView = true;
    $state.go("myitems");
  };
  $scope.saveItem = function() {
    if ($scope.mode == 'Add') {
       Service.addItem($scope.itemInfo);
    } else {
      var index = $stateParams.index;
      Service.replaceItem(index , $scope.itemInfo);
    }
    $scope.back();
  }

  $scope.ratingsObject = {
        iconOn: 'ion-ios-star',    //Optional
        iconOff: 'ion-ios-star-outline',   //Optional
        iconOnColor: 'rgb(200, 200, 100)',  //Optional
        iconOffColor:  'rgb(200, 100, 100)',    //Optional
        rating:  $scope.itemInfo.rating , //Optional
        minRating: 0,    //Optional
        readOnly: true, //Optional
        callback: function(rating, index) {    //Mandatory
          $scope.ratingsCallback(rating, index);
        }
      };

      $scope.ratingsCallback = function(rating, index) {
        $scope.itemInfo.rating = rating;
        console.log('Selected rating is : ', rating, ' and the index is : ', index);
      };
});
