'Use Strict';
angular.module('App').controller('ItemDetailController', function($scope, $state,$localStorage, $ionicHistory, $ionicTabsDelegate, $stateParams, Service) {
  // $scope.$on('$stateChangeStart', function(event) {
  //   if (!$scope.canChangeView) {
  //     event.preventDefault();
  //   }
  // });
  $scope.itemInfo = {
    name : "",
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
      $scope.ratingsObject.rating = $scope.itemInfo.rating;
      $scope.changedProfilePic = false;
      // //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      $scope.canChangeView = false;
      // //Select the 4th tab on the footer to highlight the profile icon.
      $ionicTabsDelegate.select(1);
  });

  $scope.back = function(){
    if ($scope.mode == 'Edit'){
      $scope.addItem($scope.itemInfo);
    }
    $scope.canChangeView = true;
    $state.go("myitems");
  };
  $scope.saveItem = function() {
    $scope.addItem($scope.itemInfo);
    $scope.canChangeView = true;
    $state.go("myitems");
  };

  $scope.ratingsObject = {
    iconOn: 'ion-ios-star',    //Optional
    iconOff: 'ion-ios-star-outline',   //Optional
    iconOnColor: 'rgb(200, 200, 100)',  //Optional
    iconOffColor:  'rgb(200, 100, 100)',    //Optional
    rating:  $scope.itemInfo.rating , //Optional
    minRating: 0,    //Optional
    readOnly: false, //Optional
    callback: function(rating, index) {    //Mandatory
      $scope.ratingsCallback(rating, index);
    }
  };

  $scope.ratingsCallback = function(rating, index) {
    $scope.itemInfo.rating = rating;
    console.log('Selected rating is : ', rating, ' and the index is : ', index);
  };

  //Add My trip, create Firebase data.
  $scope.addItem = function(item) {
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account){
      //Check existing the trip
      var hasItem = false;
      var myItems = account.val().myItems;
      if (myItems) {
        for (var i = 0; i < myItems.length; i++) {
          if (myItems[i] == $localStorage.itemId) {
            hasItem = true;
          }
        }
      } else {
        hasItem = false;
      }

      if (hasItem) {
        firebase.database().ref('items/' + $localStorage.itemId).update({
          item : item
        });
      } else {
        //Create new trip
        var newItemId = firebase.database().ref('items/').push({
          owner : $localStorage.accountId,
          item : item,
          dateCreated : Date(),
        }).key;

        firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
            var myItems = account.val().myItems;
            if (!myItems) {
              myItems = [];
            }
            myItems.push(newItemId);
            firebase.database().ref('accounts/' + $localStorage.accountId).update({
              myItems : myItems,
            })
        });
      }
    });
    delete $localStorage.itemId;
  };
});
