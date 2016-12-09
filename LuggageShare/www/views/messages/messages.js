// messages.js
// This is the controller that handles the messages of the users.
// Selecting on a message will open the conversation where the user can chat.
'Use Strict';
angular.module('App').controller('messagesController', function($scope, $state, $localStorage, Popup, Utils, $filter, Watchers, $timeout, $ionicPlatform, Service, $window, $stateParams, $ionicTabsDelegate, $ionicHistory) {
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
      $scope.conversations = [];
      $scope.conversations = Service.getConversationList();

      $scope.friends = [];
      $scope.friends = Service.getFriendList();

      console.log("Attaching Watchers");
      Watchers.addUsersWatcher();
      Watchers.addProfileWatcher($localStorage.accountId);
      Watchers.addNewFriendWatcher($localStorage.accountId);
      Watchers.addNewConversationWatcher($localStorage.accountId);
      Watchers.addFriendRequestsWatcher($localStorage.accountId);
      Watchers.addRequestsSentWatcher($localStorage.accountId);
      Watchers.addNewGroupWatcher($localStorage.accountId);
    }

    //Set mode to Messages.
    $scope.mode = 'Messages';

    //Notify whenever there are new messages.
    $scope.$watch(function() {
      return Service.getUnreadMessages();
    }, function(unreadMessages) {
      $scope.unreadMessages = unreadMessages;
    });

    //Notify whenever there are new friend requests.
    $scope.$watch(function() {
      return Service.getFriendRequestsCount();
    }, function(friendRequests) {
      $scope.friendRequestsCount = friendRequests;
    });

    //Notify whenever there are new group messages.
    $scope.$watch(function() {
      return Service.getUnreadGroupMessages();
    }, function(unreadGroupMessages) {
      $scope.unreadGroupMessages = unreadGroupMessages;
    });

    //Disable canChangeView to disable automatically restating to other route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Select the 1st tab on the footer to highlight the messages icon.
    $ionicTabsDelegate.select(0);
  });

  //Change mode to Compose message.
  $scope.compose = function() {
    $scope.mode = 'Compose';
  };

  //Change mode to view messages.
  $scope.cancel = function() {
    $scope.mode = 'Messages';
  };

  //Chat selected friend.
  $scope.chat = function(friend) {
    $localStorage.friendId = friend.id;
    $scope.canChangeView = true;
    $state.go('message');
  };

  //Chat selected friend, while passing conversationId.
  $scope.chat = function(friend, conversationId) {
    $localStorage.conversationId = conversationId;
    $localStorage.friendId = friend.id;
    $scope.canChangeView = true;
    $state.go('message');
  };

  //Delete conversation on Firebase, function is ready but not yet implemented, since the delete logic will vary on a use-case basis. It is up to you to make the logic for deleting conversations.
  $scope.delete = function(message, index) {
    var conversationId = message.conversationId;
    var friendId = message.friend.id;

    firebase.database().ref('conversations/' + conversationId).remove();

    firebase.database().ref('accounts/' + friendId).once('value', function(account) {
      var conversations = account.val().conversations;
      if (conversations) {
        var indexToRemove = -1;
        for (var i = 0; i < conversations.length; i++) {
          if (conversations[i].conversation == conversationId) {
            indexToRemove = i;
          }
        }
        conversations.splice(indexToRemove, 1);
        firebase.database().ref('accounts/' + friendId).update({
          conversations: conversations
        });
      }
    });

    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var conversations = account.val().conversations;
      if (conversations) {
        var indexToRemove = -1;
        for (var i = 0; i < conversations.length; i++) {
          if (conversations[i].conversation == conversationId) {
            indexToRemove = i;
          }
        }
        conversations.splice(indexToRemove, 1);
        firebase.database().ref('accounts/' + $localStorage.accountId).update({
          conversations: conversations
        });
      }
    });
    $scope.conversations.splice(index, 1);
  }
});
