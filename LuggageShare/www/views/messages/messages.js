// messages.js
// This is the controller that handles the messages of the users.
// Selecting on a message will open the conversation where the user can chat.
'Use Strict';
angular.module('App').controller('messagesController', function($scope, $state, $localStorage, $stateParams, Popup, Utils, $filter, Watchers, $timeout, $ionicPlatform, Service, $window, $stateParams, $ionicTabsDelegate, $ionicHistory) {
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

    if ($stateParams.mode) {
      $scope.mode = $stateParams.mode;
    } else {
      $scope.mode = "Chats";
    }
    $scope.conversations = [];
    $scope.conversations = Service.getConversationList();

    $scope.requests = Service.getReceivedRequests();

    $scope.canChangeView = false;
    //Select the 1st tab on the footer to highlight the messages icon.
    $ionicTabsDelegate.select(3);
  });

  //Chat selected friend.
  $scope.chat = function(user) {
    $localStorage.userId = user.id;
    $scope.canChangeView = true;
    $state.go('message');
  };

  //Chat selected friend, while passing conversationId.
  $scope.chat = function(user, conversationId) {
    $localStorage.conversationId = conversationId;
    $localStorage.userId = user.id;
    $scope.canChangeView = true;
    $state.go('message');
  };
  $scope.requestDetail = function() {
    $scope.canChangeView = true;
    $state.go('requestDetail');
  }
  //Delete conversation on Firebase, function is ready but not yet implemented, since the delete logic will vary on a use-case basis. It is up to you to make the logic for deleting conversations.
  $scope.delete = function(message, index) {
    var conversationId = message.conversationId;
    var userId = message.user.id;

    firebase.database().ref('conversations/' + conversationId).remove();

    firebase.database().ref('accounts/' + userId).once('value', function(account) {
      var conversations = account.val().conversations;
      if (conversations) {
        var indexToRemove = -1;
        for (var i = 0; i < conversations.length; i++) {
          if (conversations[i].conversation == conversationId) {
            indexToRemove = i;
          }
        }
        conversations.splice(indexToRemove, 1);
        firebase.database().ref('accounts/' + userId).update({
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
