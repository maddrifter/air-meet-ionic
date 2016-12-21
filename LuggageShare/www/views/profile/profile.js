// home.js
// This is the controller that handles the main view when the user is successfully logged in.
// The account currently logged in can be accessed through localStorage.account.
// The authenticated user can be accessed through firebase.auth().currentUser.
'Use Strict';
angular.module('App').controller('profileController', function($scope, $state, $localStorage, Utils, Popup, $timeout, Service, $ionicTabsDelegate, $ionicHistory, Watchers) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });

  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.$on('$ionicView.enter', function() {
    //Notify whenever there are new messages.
    $scope.$watch(function() {
      return Service.getUnreadMessages();
    }, function(unreadMessages) {
      $scope.unreadMessages = unreadMessages;
    });

    //Update profile whenever there are changes done on the profile.
    $scope.$watch(function() {
      return Service.getProfile();
    }, function(profile) {
      if($scope.changedProfilePic)
        Utils.show();
      $scope.profile = Service.getProfile();
    });
    $scope.changedProfilePic = false;
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 4th tab on the footer to highlight the profile icon.
    $ionicTabsDelegate.select(4);
  });

  //Set profile image while deleting the previous uploaded profilePic.
  $scope.$on('imageUploaded', function(event, args) {
    $scope.changedProfilePic = true;
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      if(account.val().profilePic != 'img/profile.png')
        firebase.storage().refFromURL(account.val().profilePic).delete();
    });
    firebase.database().ref('accounts/' + $localStorage.accountId).update({
      profilePic: args.imageUrl
    });
  });

  //Logout the user. Clears the localStorage as well as reinitializing the variable of watcherAttached to only trigger attaching of watcher once.
  $scope.logout = function() {
    if (firebase.auth()) {
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        online: false
      });
      firebase.auth().signOut().then(function() {
        Watchers.removeWatchers();
        //Clear the saved credentials.
        $localStorage.$reset();
        //Proceed to login screen.
        $scope.canChangeView = true;
        $state.go('login');
      }, function(error) {
        //Show error message.
        Utils.message(Popup.errorIcon, Popup.errorLogout);
      });
    } else {
      //Clear the saved credentials.
      $localStorage.$reset();
      //Proceed to login screen.
      $scope.canChangeView = true;
      $state.go('login');
    }
  };

  //Function to assign a profile picture, calls imageUploaded function on top when Firebase is done uploading the image.
  $scope.changeProfilePic = function() {
    var popup = Utils.confirm('ion-link', 'Profile Picture: Do you want to take a photo or choose from your gallery?', 'ion-images', 'ion-camera');
    popup.then(function(isCamera) {
      var imageSource;
      if (isCamera) {
        imageSource = Camera.PictureSourceType.CAMERA;
      } else {
        imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
      }
      //Show loading.
      Utils.getProfilePicture(imageSource);
    });
  };

  //Constrains our selected picture to be of same width and height, to preserve proportion.
  $scope.constrainProportion = function() {
    if($scope.changedProfilePic) {
      Utils.hide();
      $scope.changedProfilePic = false;
    }
    var img = document.getElementById('profilePic');
    var width = img.width;
    img.style.height = width + "px";
  };
});
