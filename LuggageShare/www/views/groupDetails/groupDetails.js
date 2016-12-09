// groupDetails.js
// This is the controller that handles the groupDetails view of the selected group.
// The user can add members or leave/delete the group in this view.
'Use Strict';
angular.module('App').controller('groupDetailsController', function($scope, $state, $localStorage, Popup, Utils, $filter, $ionicScrollDelegate, $ionicHistory, Service, $timeout, $cordovaCamera) {
  //Prevent automatically restating to messages route when Firebase Watcher calls are triggered.
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });

  //Allow going back when back is selected.
  $scope.back = function() {
    $scope.canChangeView = true;
    //Clear assignedIds, assignedIds filters the friends to be shown on filter when they are already assigned on a group.
    Service.clearAssignedIds();
    $state.go('group');
  };

  $scope.$on('$ionicView.enter', function() {
    //Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
    $scope.canChangeView = false;
    //Retrieve group using the Service.
    $scope.group = Service.getGroupById($localStorage.groupId);
    $scope.mode = 'Group';

    for (var i = 0; i < $scope.group.users.length; i++) {
      $scope.group.users[i].profilePic = Service.getProfilePic($scope.group.users[i].id);
    }

    //Set friendList when we are adding members to the group.
    $scope.friends = [];
    $scope.friends = Service.getFriendList();

    //Add members of the group to the assignedIds, assignedIds filters the friends to be shown on filter when they are already assigned on a group.
    for (var i = 0; i < $scope.group.users.length; i++) {
      Service.addAssignedIds($scope.group.users[i].id);
    }
  });

  //Broadcast when new group image is uploaded, delete the previous group image.
  $scope.$on('imageUploaded', function(event, args) {
    //Delete the previous group image, and set to the new group image.
    firebase.database().ref('groups/' + $localStorage.groupId).once('value', function(group) {
      if(group.val().image != 'img/group.png')
        firebase.storage().refFromURL(group.val().image).delete();
    });
    firebase.database().ref('groups/' + $localStorage.groupId).update({
      image: args.imageUrl
    });
    $scope.group.image = args.imageUrl;
  });

  //Confirm where the new group picture will come from, gallery or camera?
  $scope.changeGroupPic = function() {
    var popup = Utils.confirm('ion-link', 'Group Picture: Do you want to take a photo or choose from your gallery?', 'ion-images', 'ion-camera');
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

  //Change mode to adding member to the group.
  $scope.addMember = function() {
    $scope.mode = 'Add';
  };

  //Change mode to viewing details of the group.
  $scope.cancelAddMember = function() {
    $scope.mode = 'Group';
  };

  //Add selected friend to the group, create Firebase datas to accomodate the changes.
  $scope.addToGroup = function(friend) {
    firebase.database().ref('groups/' + $localStorage.groupId).once('value', function(group) {
      var group = group.val();
      var users = group.users;
      var messages = group.messages;
      if (!users) {
        users = [];
      }
      if (!messages) {
        messages = [];
      }
      users.push(friend.id);
      //Add a message to the group saying that you added member to the group.
      messages.push({
        sender: $localStorage.accountId,
        message: "has added " + friend.name + " to the group.",
        date: Date(),
        type: 'text'
      });
      firebase.database().ref('groups/' + $localStorage.groupId).update({
        users: users,
        messages: messages
      });
      firebase.database().ref('accounts/' + friend.id).once('value', function(account) {
        var groups = account.val().groups;
        if (!groups) {
          groups = [];
        }
        groups.push({
          group: $localStorage.groupId,
          messagesRead: 0
        });
        firebase.database().ref('accounts/' + friend.id).update({
          groups: groups
        });
      });

      //Add to assignedIds so recently added member won't show up on the add member list.
      Service.addAssignedIds(friend.id);
    });
  };

  //Leave group, will delete Firebase data to accomodate leaving of group.
  $scope.leaveGroup = function() {
    var popup = Utils.confirm('ion-chatboxes', 'Are you sure you want to leave this group?', 'ion-close', 'ion-checkmark');
    popup.then(function(proceed) {
      if (proceed) {
        firebase.database().ref('groups/' + $localStorage.groupId).once('value', function(group) {
          var group = group.val();
          var users = group.users;
          var messages = group.messages;
          if (!messages) {
            messages = [];
          }
          users.splice(users.indexOf($localStorage.accountId), 1);
          firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
            var name = account.val().name;
            //Add a message to the group saying that you left the group.
            messages.push({
              sender: $localStorage.accountId,
              message: name + " has left this group.",
              date: Date(),
              type: 'text'
            });
            firebase.database().ref('groups/' + $localStorage.groupId).update({
              users: users,
              messages: messages
            });

            var groups = account.val().groups;
            var index = -1;
            for (var i = 0; i < groups.length; i++) {
              if (groups[i].group == $localStorage.groupId) {
                index = i;
              }
            }
            if (index > -1) {
              groups.splice(index, 1);
            }
            firebase.database().ref('accounts/' + $localStorage.accountId).update({
              groups: groups
            });
          });
          //Clear assignedIds and proceed to groups selection.
          Service.clearAssignedIds();
          $scope.canChangeView = true;
          $state.go('groups');
        });
      }
    });
  };

  //Deleting a group, when only one member was left to the group.
  //Delete Group on Firebase.
  $scope.deleteGroup = function() {
    var popup = Utils.confirm('ion-chatboxes', 'Are you sure you want to delete this group?', 'ion-close', 'ion-checkmark');
    popup.then(function(proceed) {
      if (proceed) {
        firebase.database().ref('accounts/' + $localStorage.accountId).once('value', function(account) {
          var groups = account.val().groups;
          var index = -1;
          for (var i = 0; i < groups.length; i++) {
            if (groups[i].group == $localStorage.groupId) {
              index = i;
            }
          }
          if (index > -1) {
            groups.splice(index, 1);
          }
          firebase.database().ref('accounts/' + $localStorage.accountId).update({
            groups: groups
          });
        });
        //Delete groupImage.
        firebase.database().ref('groups/' + $localStorage.groupId).once('value', function(group) {
          if(group.val().image != 'img/group.png')
            firebase.storage().refFromURL(group.val().image).delete();
        });
        firebase.database().ref('groups/' + $localStorage.groupId).remove();
        //Clear assignedIds and proceed to groups selection.
        Service.clearAssignedIds();
        $scope.canChangeView = true;
        $state.go('groups');
      }
    });
  };
});
