// group.js
// This is the controller that handles the chat messages for a group.
'Use Strict';
angular.module('App').controller('groupController', function($scope, $state, $localStorage, Popup, Utils, $filter, $ionicScrollDelegate, $ionicHistory, Service, $timeout, $cordovaCamera) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });

  //Allow going back when back is selected.
  $scope.back = function() {
    $scope.canChangeView = true;
    $localStorage.groupId = undefined;
    $ionicHistory.goBack();
    $state.go('groups');
  };

  $scope.$on('$ionicView.enter', function() {
    //Disable scroll to correctly orient the keyboard input for iOS.
    cordova.plugins.Keyboard.disableScroll(true);

    //Set scope variables to the selected group.
    if ($localStorage.groupId) {
      var group = Service.getGroupById($localStorage.groupId);
      $scope.groupName = group.name;
      $scope.messages = group.messages;
      $scope.unreadGroupMessages = group.unreadMessages;
      for (var i = 0; i < $scope.messages.length; i++) {
        $scope.messages[i].profilePic = Service.getProfilePic($scope.messages[i].sender);
      }
      $scope.scrollBottom();
      if ($localStorage.groupId) {
        //Update users read messages on Firebase.
        $scope.groupId = $localStorage.groupId;
        $scope.updateMessagesRead();
      }
    }

    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
  });

  //Broadcast from our Watcher that tells us that a new message has been added to the group.
  $scope.$on('messageAdded', function() {
    //Scroll to bottom and updateMessagesRead, as well as setting the lastGroupActiveDate.
    $scope.scrollBottom();
    $scope.updateMessagesRead();
    $timeout(function () {
      Service.setGroupLastActiveDate($localStorage.groupId, new Date());
    });
  });

  //Broadcast from our Utils.getPicture function that tells us that the image selected has been uploaded.
  $scope.$on('imageUploaded', function(event, args) {
    //Proceed with sending of image message.
    $scope.sendMessage('image', args.imageUrl);
  });

  //Send picture message, ask if the image source is gallery or camera.
  $scope.sendPictureMessage = function() {
    var popup = Utils.confirm('ion-link', 'Photo Message: Do you want to take a photo or choose from your gallery?', 'ion-images', 'ion-camera');
    popup.then(function(isCamera) {
      var imageSource;
      if (isCamera) {
        imageSource = Camera.PictureSourceType.CAMERA;
      } else {
        imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
      }
      //Show loading.
      Utils.getPicture(imageSource);
    });
  };

  //Send text message.
  $scope.sendTextMessage = function() {
    if ($scope.message != '') {
      $scope.sendMessage('text', $scope.message);
    }
  };

  //Scroll to bottom so new messages will be seen.
  $scope.scrollBottom = function() {
    $ionicScrollDelegate.scrollBottom(true);
  };

  //Scroll to top.
  $scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop(true);
  };

  //Send message, create Firebase data.
  $scope.sendMessage = function(type, message) {
    if ($scope.groupId) {
      //Has existing conversation
      firebase.database().ref('groups/' + $scope.groupId).once('value', function(group) {
        var messages = group.val().messages;
        if (!messages) {
          messages = [];
        }
        if (type == 'text') {
          messages.push({
            sender: $localStorage.accountId,
            message: message,
            date: Date(),
            type: 'text'
          });
        } else {
          messages.push({
            sender: $localStorage.accountId,
            image: message,
            date: Date(),
            type: 'image'
          });
        }
        firebase.database().ref('groups/' + $scope.groupId).update({
          messages: messages
        });
      });
    }

    //Clear, and refresh to see the new messages.
    $scope.message = '';
    $scope.scrollBottom();
  };

  //Enlarge selected image when selected on view.
  $scope.enlargeImage = function(url) {
    Utils.image(url);
  };

  //Update users messagesRead on Firebase database.
  $scope.updateMessagesRead = function() {
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var groups = account.val().groups;
      angular.forEach(groups, function(group) {
        if (group.group == $scope.groupId) {
          group.messagesRead = $scope.messages.length;
        }
      });
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        groups: groups
      });
    });
  };

  //Open group details, where user can add member or leave group.
  $scope.details = function() {
    $scope.canChangeView = true;
    $state.go('groupDetails');
  };
});
