//service.js
//This is the class where most of the data shown on the views are stored.
//Changes done on the Firebase Database through the Watchers (watcher.js) should be reflected on this service.
angular.module('App').service('Service', function($localStorage) {
  var data = {
    usersList: [],
    excludedIds: [],
    assignedIds: [],
    profile: {},
    conversationList: [],
    groupList: [],
    friendList: [],
    unreadMessages: 0,
    unreadGroupMessages: 0,
    friendRequestList: [],
    requestSentList: [],
    friendRequests: 0
  };
  this.clearData = function() {
    data.usersList = [];
    data.excludedIds = [];
    data.assignedIds = [];
    data.profile = {};
    data.conversationList = [];
    data.groupList = [];
    data.friendList = [];
    data.unreadMessages = 0;
    data.unreadGroupMessages = 0;
    data.friendRequestList = [];
    data.requestSentList = [];
    data.friendRequests = 0;
  };
  //Add user to the usersList, only adds if user doesn't exist yet.
  this.addUser = function(profile) {
    var index = -1;
    for(var i = 0; i < data.usersList.length; i++) {
      if(data.usersList[i].id == profile.id)
        index = i;
    }
    if(index == -1) {
      if(profile.name && profile.username)
        data.usersList.push(profile);
    }

  };
  //Return usersList.
  this.getUsersList = function() {
    return data.usersList;
  };
  //Add to excludedIds, excludedIds are ids that should not show up on search Users. Your own profile and your existing friends are excludedIds.
  this.addExcludedIds = function(id) {
    data.excludedIds.push(id);
  };
  //Remove from excludedIds.
  this.removeFromExcludedIds = function(id) {
    if (data.excludedIds.length > 0) {
      data.excludedIds.splice(data.excludedIds.indexOf(id), 1);
    }
  };
  //Get excludedIds.
  this.getExcludedIds = function() {
    return data.excludedIds;
  };
  //Add to assignedIds, assignedIds are ids for members/friends that are already assigned to a group.
  this.addAssignedIds = function(id) {
    data.assignedIds.push(id);
  };
  //Remove from assignedIds.
  this.removeFromAssignedIds = function(id) {
    if (data.assignedIds.length > 0) {
      data.assignedIds.splice(data.assignedIds.indexOf(id), 1);
    }
  };
  //Clear assignedIds.
  this.clearAssignedIds = function(id) {
    data.assignedIds = [];
  };
  //Get assignedIds.
  this.getAssignedIds = function() {
    return data.assignedIds;
  };
  //Set Profile with the profile object.
  this.setProfile = function(profile) {
    data.profile = profile;
  };
  //Get the profile.
  this.getProfile = function() {
    return data.profile;
  };
  //Get profilePic given the id.
  this.getProfilePic = function(id) {
    if ($localStorage.accountId == id) {
      return data.profile.profilePic;
    } else {
      for (var i = 0; i < data.friendList.length; i++) {
        if (data.friendList[i].id == id) {
          return data.friendList[i].profilePic;
        }
      }
      for (var i = 0; i < data.usersList.length; i++) {
        if (data.usersList[i].id == id) {
          return data.usersList[i].profilePic;
        }
      }
    }
  };
  //Get profileName given the id.
  this.getProfileName = function(id) {
    if ($localStorage.accountId == id) {
      return data.profile.name.substr(0, data.profile.name.indexOf(' '));
    } else {
      for (var i = 0; i < data.friendList.length; i++) {
        if (data.friendList[i].id == id) {
          return data.friendList[i].name.substr(0, data.friendList[i].name.indexOf(' '));
        }
      }
      for (var i = 0; i < data.usersList.length; i++) {
        if (data.usersList[i].id == id) {
          return data.usersList[i].name.substr(0, data.usersList[i].name.indexOf(' '));
        }
      }
    }
  };
  //Add conversation.
  this.addConversation = function(conversation) {
    data.conversationList.push(conversation);
  };
  //Add message to a conversation.
  this.addMessageToConversation = function(conversationId, message) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        var messages = data.conversationList[i].messages;
        messages.push(message);
        data.conversationList[i].messages = messages;
        var lastMessage;
        if (message.type == 'text') {
          if (message.sender == $localStorage.accountId) {
            lastMessage = "You: " + message.message;
          } else {
            lastMessage = message.message;
          }
        } else {
          if (message.sender == $localStorage.accountId) {
            lastMessage = "You sent a photo message.";
          } else {
            lastMessage = "Sent you a photo message.";
          }
        }
        data.conversationList[i].lastMessage = lastMessage;
        if (message.sender != $localStorage.accountId) {
          data.conversationList[i].unreadMessages++;
          this.addUnreadMessages(1);
        }
      }
    }
  };
  //Update conversationFriend.
  this.updateConversationFriend = function(friend) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].friend.id == friend.id) {
        data.conversationList[i].friend = friend;
      }
    }
  };
  //Get conversationList.
  this.getConversationList = function() {
    return data.conversationList;
  };
  //Get conversation given the friend id.
  this.getConversation = function(friendId) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].friend.id == friendId) {
        return data.conversationList[i];
      }
    }
  };
  //Get conversation given its id.
  this.getConversationById = function(conversationId) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        return data.conversationList[i];
      }
    }
  };
  //Set lastActiveDate of conversation.
  this.setLastActiveDate = function(conversationId, date) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        data.conversationList[i].lastActiveDate = date;
      }
    }
  };
  //Get unreadMessages.
  this.getUnreadMessages = function() {
    return data.unreadMessages;
  };
  //Add Group.
  this.addGroup = function(group) {
    data.groupList.push(group);
  };
  //Add message to group.
  this.addMessageToGroup = function(groupId, message) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        var messages = data.groupList[i].messages;
        messages.push(message);
        data.groupList[i].messages = messages;
        if (message.sender != $localStorage.accountId) {
          data.groupList[i].unreadMessages++;
          this.addUnreadGroupMessages(1);
        }
      }
    }
  };
  //Get group List.
  this.getGroupList = function() {
    return data.groupList;
  };
  //Get group by its id.
  this.getGroupById = function(groupId) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        return data.groupList[i];
      }
    }
  };
  //Set group's lastActiveDate.
  this.setGroupLastActiveDate = function(groupId, date) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].lastActiveDate = date;
      }
    }
  };
  //Update group's users.
  this.updateGroupUsers = function(groupId, usersList) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].users = usersList;
      }
    }
  };
  //Remove user from group.
  this.removeGroupUser = function(groupId, userId) {
    var index = -1;
    var group;
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        group = data.groupList[i];
        for(var j = 0; j < group.users.length; j++) {
          if (group.users[j].id == userId){
            index = j;
          }
        }
      }
    }
    if(index > -1) {
      group.users.splice(index, 1);
    }
  };
  //Remove group when group is deleted.
  this.removeGroup = function(groupId) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.unreadGroupMessages-= data.groupList[i].unreadMessages;
        data.groupList.splice(i, 1);
        $localStorage.groupId = undefined;
      }
    }
  };
  //Set group image.
  this.setGroupImage = function(groupId, imageUrl) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].image = imageUrl;
      }
    }
  };
  //Get unreadGroupMessages.
  this.getUnreadGroupMessages = function() {
    return data.unreadGroupMessages;
  };
  //Add or update friend.
  this.addOrUpdateFriend = function(friend) {
    var index = -1;
    for (var i = 0; i < data.friendList.length; i++) {
      if (data.friendList[i].id == friend.id) {
        index = i;
      }
    }
    if (index >= 0) {
      data.friendList[index] = friend;
    } else {
      data.friendList.push(friend);
    }
  };
  //Get friend given its id.
  this.getFriend = function(friendId) {
    for (var i = 0; i < data.friendList.length; i++) {
      if (data.friendList[i].id == friendId) {
        return data.friendList[i];
      }
    }
  };
  //Get account given the accountId.
  this.getAccount = function(accountId) {
    for (var i = 0; i < data.usersList.length; i++) {
      if (data.usersList[i].id == accountId) {
        return data.usersList[i];
      }
    }
  };
  //Get friendList.
  this.getFriendList = function() {
    return data.friendList;
  };
  //Add to unreadMessages.
  this.addUnreadMessages = function(messagesCount) {
    if (!data.unreadMessages) {
      data.unreadMessages = messagesCount;
    } else {
      data.unreadMessages = data.unreadMessages + messagesCount;
    }
  };
  //Minus to unreadMessages.
  this.minusUnreadMessages = function(messagesCount) {
    if (!data.unreadMessages) {
      data.unreadMessages = messagesCount;
    } else {
      data.unreadMessages = data.unreadMessages - messagesCount;
    }
  };
  //Set unreadMessages.
  this.setUnreadMessages = function(conversationId, unreadMessages) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].id == conversationId) {
        data.conversationList[i].unreadMessages = unreadMessages;
      }
    }
  };
  //Add to Group unreadMessages.
  this.addUnreadGroupMessages = function(messagesCount) {
    if (!data.unreadGroupMessages) {
      data.unreadGroupMessages = messagesCount;
    } else {
      data.unreadGroupMessages = data.unreadGroupMessages + messagesCount;
    }
  };
  //Minus to Group unreadMessages.
  this.minusUnreadGroupMessages = function(messagesCount) {
    if (!data.unreadGroupMessages) {
      data.unreadGroupMessages = messagesCount;
    } else {
      data.unreadGroupMessages = data.unreadGroupMessages - messagesCount;
    }
  };
  //Set Group unreadMessages.
  this.setUnreadGroupMessages = function(groupId, unreadMessages) {
    for (var i = 0; i < data.groupList.length; i++) {
      if (data.groupList[i].id == groupId) {
        data.groupList[i].unreadMessages = unreadMessages;
      }
    }
  };
  //Add friendRequest.
  this.addFriendRequest = function(friendRequest) {
    data.friendRequestList.push(friendRequest);
    data.friendRequests++;
  };
  //Get friendRequest List.
  this.getFriendRequestList = function() {
    return data.friendRequestList;
  };
  //Remove friendRequest.
  this.removeFriendRequest = function(friendId) {
    var index = -1;
    for (var i = 0; i < data.friendRequestList.length; i++) {
      if (data.friendRequestList[i].id == friendId) {
        index = i;
        data.friendRequests--;
      }
    }
    if (index > -1) {
      data.friendRequestList.splice(index, 1);
    }
  };
  //Get friendRequest count.
  this.getFriendRequestsCount = function() {
    return data.friendRequests;
  };
  //Add requestSent.
  this.addRequestSent = function(friendRequest) {
    data.requestSentList.push(friendRequest);
  };
  //Remove requestSent.
  this.removeRequestSent = function(friendId) {
    var index = -1;
    for (var i = 0; i < data.requestSentList.length; i++) {
      if (data.requestSentList[i].id == friendId) {
        index = i;
      }
    }
    if (index > -1) {
      data.requestSentList.splice(index, 1);
    }
  };
  //Get requestSent List.
  this.getRequestSentList = function() {
    return data.requestSentList;
  };
});
