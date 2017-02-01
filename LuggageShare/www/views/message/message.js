// message.js
// This is the controller that handles the messages for a conversation.
'Use Strict';
angular.module('App').controller('messageController', function($scope, $state, $localStorage, Popup, Utils, $filter, $ionicScrollDelegate, $ionicHistory, Service, $timeout, $cordovaCamera) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });

  //Allow going back when back is selected.
  $scope.back = function() {
    $scope.canChangeView = true;
    $localStorage.userId = undefined;
    $localStorage.conversationId = undefined;
    if ($ionicHistory.backView()) {
      $ionicHistory.goBack();
    } else {
      $state.go('messages');
    }
  };

  $scope.$on('$ionicView.enter', function() {
    //Disable scroll to correctly orient the keyboard input for iOS.
    // cordova.plugins.Keyboard.disableScroll(true);

    //Set scope variables to the selected conversation partner.
    if ($localStorage.userId) {
      var user = Service.getAccount($localStorage.userId);
      if(user){
        $scope.conversationName = user.name;
        $scope.conversation = Service.getConversation($localStorage.userId);
        if ($scope.conversation) {
          $scope.conversationId = $scope.conversation.id;
          $scope.messages = $scope.conversation.messages;
          $scope.unreadMessages = $scope.conversation.unreadMessages;
          for (var i = 0; i < $scope.messages.length; i++) {
            $scope.messages[i].profilePic = Service.getProfilePic($scope.messages[i].sender);
          }
        }
        $scope.scrollBottom();
        if ($localStorage.conversationId) {
          $scope.conversationId = $localStorage.conversationId;
        }
      }
    }

    //Update users read messages on Firebase.
    $scope.updateMessagesRead();
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
  });

  //Broadcast from our Watcher that tells us that a new message has been added to the conversation.
  $scope.$on('messageAdded', function() {
    $scope.scrollBottom();
    $scope.updateMessagesRead();
    $timeout(function () {
      Service.setLastActiveDate($localStorage.conversationId, new Date());
    });
  });

  //Broadcast from our Watcher that tells us that a new conversation has been made with the user, we then reload the view to accomodate the changes.
  $scope.$on('conversationAdded', function(event, args) {
    if (args.userId == $localStorage.userId) {
      $scope.canChangeView = true;
      $state.reload();
    } else {
      $scope.canChangeView = false;
    }
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
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var hasConversation = false;
      var conversations = account.val().conversations;
      if(conversations) {
        for(var i = 0; i < conversations.length; i++) {
          if(conversations[i].contractor == $localStorage.userId) {
            hasConversation = true;
          }
        }
      } else {
        hasConversation = false;
      }

      if(hasConversation) {
        //Has existing conversation
        firebase.database().ref('conversations/' + $scope.conversationId).once('value', function(conversation) {
          var messages = conversation.val().messages;
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
          firebase.database().ref('conversations/' + $scope.conversationId).update({
            messages: messages
          });
        });
      } else {
        //Create new conversation
        var users = [$localStorage.accountId, $localStorage.userId];
        var messages = [];
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

        var conversationId = firebase.database().ref('conversations').push({
          users: users,
          messages: messages,
          dateCreated: Date()
        }).key;

        firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
          var conversations = account.val().conversations;
          if (!conversations) {
            conversations = [];
          }
          conversations.push({
            contractor: $localStorage.userId,
            conversation: conversationId,
            messagesRead: 1
          });
          firebase.database().ref('accounts/' + $localStorage.accountId).update({
            conversations: conversations
          });
        });

        firebase.database().ref('accounts/' + $localStorage.userId).once('value', function(account) {
          var conversations = account.val().conversations;
          if (!conversations) {
            conversations = [];
          }
          conversations.push({
            contractor: $localStorage.accountId,
            conversation: conversationId,
            messagesRead: 0
          });
          firebase.database().ref('accounts/' + $localStorage.userId).update({
            conversations: conversations
          });
        });
        $scope.conversationId = conversationId;
      }
      //Clear, and refresh to see the new messages.
      $scope.message = '';
      $scope.scrollBottom();
    });
  };

  //Enlarge selected image when selected on view.
  $scope.enlargeImage = function(url) {
    Utils.image(url);
  };

  //Update users messagesRead on Firebase database.
  $scope.updateMessagesRead = function() {
    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var conversations = account.val().conversations;
      if(conversations) {
        angular.forEach(conversations, function(conversation) {
          if (conversation.conversation == $scope.conversationId) {
            conversation.messagesRead = $scope.messages.length;
          }
        });
        firebase.database().ref('accounts/' + $localStorage.accountId).update({
          conversations: conversations
        });
      }
    });
  };
});
