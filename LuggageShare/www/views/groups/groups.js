// groups.js
// This is the controller that handles the groups of the user.
// Selecting a group will open the group chat.
'Use Strict';
angular.module('App').controller('groupsController', function($scope, $state, $localStorage, Utils, Popup, $timeout, Service, $ionicTabsDelegate, $ionicHistory) {
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
    $scope.mode = 'Groups';
    //If user uploaded a picture but didn't proceed with the group creation, delete the image.
    if($scope.group && !$scope.groupCreated) {
      if ($scope.group.image != 'img/group.png') {
        firebase.storage().refFromURL($scope.group.image).delete();
      }
    }
    //Clear assignedIds, assignedIds filters the friends to be shown on filter when they are already assigned on a group.
    Service.clearAssignedIds();
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.$on('$ionicView.enter', function() {
    $scope.mode = 'Groups';

    //Initialize our models from the Service.
    $scope.friends = [];
    $scope.friends = Service.getFriendList();

    $scope.groups = [];
    $scope.groups = Service.getGroupList();

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

    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Indicator if user created a group or not.
    $scope.groupCreated = false;
    //Select the 2nd tab on the footer to highlight the groups icon.
    $ionicTabsDelegate.select(1);
  });

  //Set group image while deleting the previous uploaded image.
  $scope.$on('imageUploaded', function(event, args) {
    if ($scope.group.image != 'img/group.png') {
      firebase.storage().refFromURL($scope.group.image).delete();
    }
    $scope.group.image = args.imageUrl;
  });

  //Function to assign a member to the group, this doesn't insert to the database yet.
  $scope.addToGroup = function(friend) {
    $scope.group.members.push(friend);
    Service.addAssignedIds(friend.id);
  };

  //Function to create group, creates Firebase database data.
  $scope.createGroup = function() {
    var users = [$localStorage.accountId];
    angular.forEach($scope.group.members, function(member) {
      users.push(member.id);
    });
    var messages = [];
    //Sends a welcome message to everyone to the group.
    messages.push({
      sender: $localStorage.accountId,
      message: 'Welcome to ' + $scope.group.name,
      date: Date(),
      type: 'text'
    });
    var groupId = firebase.database().ref('groups').push({
      name: $scope.group.name,
      image: $scope.group.image,
      users: users,
      messages: messages,
      dateCreated: Date()
    }).key;

    firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
      var groups = account.val().groups;
      if (!groups) {
        groups = [];
      }
      groups.push({
        group: groupId,
        messagesRead: 1
      });
      firebase.database().ref('accounts/' + $localStorage.accountId).update({
        groups: groups
      });
    });

    angular.forEach($scope.group.members, function(member) {
      firebase.database().ref('accounts/' + member.id).once('value', function(account) {
        var groups = account.val().groups;
        if (!groups) {
          groups = [];
        }
        groups.push({
          group: groupId,
          messagesRead: 0
        });
        firebase.database().ref('accounts/' + member.id).update({
          groups: groups
        });
      });
    });

    //Set our variables then proceed to open the group so the user can chat directly.
    $scope.groupCreated = true;
    Service.clearAssignedIds();
    $localStorage.groupId = groupId;
    $scope.canChangeView = true;
    $state.go('group');
  };

  //Set mode to compose a group, while clearing fields.
  $scope.compose = function() {
    $scope.mode = 'Compose';
    $scope.group = {
      name: "",
      image: 'img/group.png',
      members: []
    };
    Service.clearAssignedIds();
  };

  //Set mode to view groups list. If user uploaded an image but didn't proceed with group creation, delete the image.
  $scope.cancel = function() {
    $scope.mode = 'Groups';
    if($scope.group && !$scope.groupCreated) {
      if ($scope.group.image != 'img/group.png') {
        firebase.storage().refFromURL($scope.group.image).delete();
      }
    }
    Service.clearAssignedIds();
  };

  //Function to assign a group picture to the group to create, calls imageUploaded function on top when Firebase is done uploading the image.
  $scope.changeGroupPic = function() {
    var popup = Utils.confirm('ion-link', 'Group Picture: Do you want to take a photo or choose from your gallery?', 'ion-images', 'ion-camera');
    popup.then(function(isCamera) {
      var imageSource;
      if (isCamera) {
        imageSource = Camera.PictureSourceType.CAMERA;
      } else {
        imageSource = Camera.PictureSourceType.PHOTOLIBRARY;
      }
      Utils.getProfilePicture(imageSource);
    });
  };

  //Constrains our selected picture to be of same width and height, to preserve proportion.
  $scope.constrainProportion = function() {
    var img = document.getElementById('groupPic');
    var width = img.width;
    img.style.height = width + "px";
  };

  //Remove assignedMember to a group. Doesn't remove Firebase data just yet.
  $scope.remove = function(index) {
    Service.removeFromAssignedIds($scope.group.members[index].id);
    $scope.group.members.splice(index, 1);
  };

  //Proceed to group chat with the selected group.
  $scope.chat = function(group) {
    $localStorage.groupId = group.id;
    $scope.canChangeView = true;
    $state.go('group');
  };
});
