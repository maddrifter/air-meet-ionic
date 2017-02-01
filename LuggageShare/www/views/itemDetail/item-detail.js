'Use Strict';
angular.module('App').controller('ItemDetailController', function($scope, $state,$localStorage, $ionicHistory, $ionicTabsDelegate, $stateParams, Service, Utils) {
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
    isSelected : false,
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
      if($scope.itemInfo.quantity > 0) {
        $scope.addItem($scope.itemInfo);
      }
    }
    $scope.canChangeView = true;
    $state.go("myitems");
  };
  $scope.saveItem = function() {
    if ($scope.itemInfo.quantity > 0) {
      $scope.addItem($scope.itemInfo);
      $scope.canChangeView = true;
      $state.go("myitems");
    }
  };

  //Set profile image while deleting the previous uploaded profilePic.
  $scope.$on('imageUploaded', function(event, args) {
    $scope.changedProfilePic = true;
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      if(account.val().profilePic != 'img/profile.png')
        firebase.storage().refFromURL(account.val().profilePic).delete();
    });
    firebase.database().ref('accounts/' + $localStorage.accountId).update({
      itemPicture: args.imageUrl
    });
  });
  //Function to assign a profile picture, calls imageUploaded function on top when Firebase is done uploading the image.
  $scope.changeItemPicture = function() {
    var popup = Utils.confirm('ion-link', 'Profile Picture: Do you want to take a photo or choose from your gallery?', 'ion-images', 'ion-camera');
    popup.then(function(isCamera) {
      var imageSource;
      if (isCamera) {
        imageSource = Camera.PictureSourceType.CAMERA;
      } else {
        imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
      }
      //Show loading.
      Utils.getItemPicture(imageSource);
    });
  };

  //Constrains our selected picture to be of same width and height, to preserve proportion.
  $scope.constrainProportion = function() {
    if($scope.changedProfilePic) {
      Utils.hide();
      $scope.changedProfilePic = false;
    }
    var img = document.getElementById('item-picture');
    var width = img.width;
    img.style.height = width + "px";
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
  $scope.addItem = function(itemInfo) {
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account){
      //Check existing the trip
      var item = {
        name : itemInfo.name,
        quantity : itemInfo.quantity,
        weight : itemInfo.weight,
        dimension: itemInfo.dimension,
        description : itemInfo.description,
        reward : itemInfo.reward,
        status : itemInfo.status,
        deliverer : itemInfo.deliverer,
        rating : itemInfo.rating        
      }
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
