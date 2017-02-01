'Use Strict';
angular.module('App').controller('MyItemsController', function($scope, $state, $localStorage, $stateParams, $ionicHistory, $ionicTabsDelegate, Service) {
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
  $scope.$on('$ionicView.loaded', function(){
  // Anything you can think of
    $scope.items = Service.getMyItemList();
    if($localStorage.selectedItem) {
      for (var i = 0; i < $scope.items.length; i++) {
        if($scope.items[i].id == $localStorage.selectedItem){
          $scope.items[i].isSelected = true;
        }
      }
    }
  });
  $scope.$on('$ionicView.enter', function() {

      if ($stateParams.mode) {
        $scope.mode = $stateParams.mode;
      } else {
        $scope.mode = 'View';
      }
      console.log($scope.items);

      $scope.changedProfilePic = false;
      // //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      $scope.canChangeView = false;
      // //Select the 4th tab on the footer to highlight the profile icon.
      $ionicTabsDelegate.select(1);
  });
  // Go item detail
  $scope.itemDetail = function(mode, index) {
    if (mode == 'Edit'){
      $localStorage.itemId = $scope.items[index].id;
    }
    $scope.canChangeView = true;
    $state.go('itemDetail', { mode : mode, index : index});
  }
  //Remove item
  $scope.removeItem = function(index) {
    var itemId = $scope.items[index].id;
    if (itemId == $localStorage.selectedItem) {
      delete $localStorage.selectedItem;
    }
    firebase.database().ref('accounts/' + $localStorage.accountId).child("myItems").once('value', function(myItems){
      var items = myItems.val();
      var deleteItemsIndex = -1;
      if (items){
        console.log("My Itemss : ", items);
        for(var i = 0 ; i < items.length ; i++){
            if(items[i] == itemId) {
              deleteItemsIndex = i;
            }
        }
        //Remove from the myTrips list
        console.log(deleteItemsIndex);
        if (deleteItemsIndex != -1){
          items.splice(deleteItemsIndex, 1);
        }
        console.log("After remove : " , items);

        firebase.database().ref('accounts/' + $localStorage.accountId).update({
          myItems : items
        });
        //Remove from Trips list
        var ref = firebase.database().ref('items/');
        ref.child(itemId).remove();
      }
    });
  }
  //Select Item
  $scope.selectItem = function(index) {
    var oldItemIndex = -1;
    for (var i = 0; i < $scope.items.length; i++) {
        if($scope.items[i].isSelected == true){
          oldItemIndex = i;
        }
    }
    if(oldItemIndex != -1){
      if (index == oldItemIndex) {
        $scope.items[index].isSelected = false;
        delete $localStorage.selectedItem;
      } else {
        $scope.items[oldItemIndex].isSelected = false;
        $scope.items[index].isSelected = true;
        $localStorage.selectedItem = $scope.items[index].id;
      }
    } else {
      $scope.items[index].isSelected = true;
      $localStorage.selectedItem = $scope.items[index].id;
    }
  }

  $scope.back = function() {
    if ($ionicHistory.backView()) {
      $ionicHistory.goBack();
    }
  }

});
