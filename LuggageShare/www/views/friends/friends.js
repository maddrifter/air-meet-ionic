// friends.js
// This is the controller that handles the friends list of the user.
// In order to be able to chat someone, one must be friends with them first.
// This view allows user to send and accept friend requests.
// Selecting a friend from the friendlist automatically opens a chat with them, if no conversation are made prior it will start a new chat.
'Use Strict';
angular.module('App').controller('friendsController', function($scope, $state, $localStorage, Popup, $timeout, Utils, Watchers, Service, $ionicTabsDelegate, $ionicHistory) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event) {
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
    //Set mode to friends tab.
    $scope.mode = 'Friends';

    //Initialize our models from the Service.
    $scope.friends = [];
    $scope.friends = Service.getFriendList();

    $scope.friendRequests = [];
    $scope.friendRequests = Service.getFriendRequestList();

    $scope.requestsSent = [];
    $scope.requestsSent = Service.getRequestSentList();

    $scope.users = [];
    $scope.users = Service.getUsersList();

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
      //Proceed to friendRequests mode automatically when friendRequest is received.
      if($scope.friendRequestsCount > 0)
        $scope.mode = 'Requests';
    });

    //Notify whenever there are new group messages.
    $scope.$watch(function() {
      return Service.getUnreadGroupMessages();
    }, function(unreadGroupMessages) {
      $scope.unreadGroupMessages = unreadGroupMessages;
    });

    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;

    //Select the 3rd tab on the footer to highlight the friends icon.
    $ionicTabsDelegate.select(2);
  });

  //Accept Friend Request, create Firebase database data.
  $scope.acceptRequest = function(friend) {
    $scope.deleteRequest(friend);
    firebase.database().ref('accounts/' + friend.id).once('value', function(account) {
      var friends = account.val().friends;
      if (!friends) {
        friends = [];
      }
      friends.push($localStorage.accountId);
      firebase.database().ref('accounts/' + friend.id).update({
        friends: friends
      });
    });

    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var friends = account.val().friends;
      if (!friends) {
        friends = [];
      }
      friends.push(friend.id);
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        friends: friends
      });
    });
    //Switch mode to friends, to show the new friend added.
    $scope.mode = 'Friends';
  };

  //Delete Friend Request, delete Firebase database data.
  $scope.deleteRequest = function(friend) {
    firebase.database().ref('accounts/' + friend.id).once('value', function(account) {
      var requestsSent = account.val().requestsSent;
      if (!requestsSent) {
        requestsSent = [];
      }
      requestsSent.splice(requestsSent.indexOf($localStorage.accountId), 1);
      firebase.database().ref('accounts/' + friend.id).update({
        requestsSent: requestsSent
      });
    });

    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var friendRequests = account.val().friendRequests;
      if (!friendRequests) {
        friendRequests = [];
      }
      friendRequests.splice(friendRequests.indexOf(friend.id), 1);
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        friendRequests: friendRequests
      });
    });
  };

  //Send Friend Request, create Firebase Database data.
  $scope.sendRequest = function(user) {
    Utils.message(Popup.successIcon, "Friend request successfully sent to: " + user.name + ".");
    firebase.database().ref('accounts/' + user.id).once('value', function(account) {
      var friendRequests = account.val().friendRequests;
      if (!friendRequests) {
        friendRequests = [];
      }
      friendRequests.push($localStorage.accountId);
      firebase.database().ref('accounts/' + user.id).update({
        friendRequests: friendRequests
      });
    });

    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var requestsSent = account.val().requestsSent;
      if (!requestsSent) {
        requestsSent = [];
      }
      requestsSent.push(user.id);
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        requestsSent: requestsSent
      });
    });
  };

  //Cancel Friend Request, delete Firebase Database data.
  $scope.cancelRequest = function(user) {
    firebase.database().ref('accounts/' + user.id).once('value', function(account) {
      var friendRequests = account.val().friendRequests;
      if (!friendRequests) {
        friendRequests = [];
      }
      friendRequests.splice(friendRequests.indexOf($localStorage.accountId), 1);
      firebase.database().ref('accounts/' + user.id).update({
        friendRequests: friendRequests
      });
    });

    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var requestsSent = account.val().requestsSent;
      if (!requestsSent) {
        requestsSent = [];
      }
      requestsSent.splice(requestsSent.indexOf(user.id), 1);
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        requestsSent: requestsSent
      });
    });
  };

  //Chat the selected Friend, set Friend to Chat on localStorage and proceed to message.
  $scope.chat = function(friend) {
    $localStorage.friendId = friend.id;
    $scope.canChangeView = true;
    $state.go('message');
  };
});
