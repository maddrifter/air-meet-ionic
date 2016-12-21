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
    // friendList: [],
    unreadMessages: 0,
    // friendRequestList: [],
    // requestSentList: [],
    // friendRequests: 0,
    myTripList: [],
    myItemList: [],
    searchedTripsList : [],
  };
  this.clearData = function() {
    data.usersList = [];
    data.excludedIds = [];
    data.assignedIds = [];
    data.profile = {};
    data.conversationList = [];
    // data.friendList = [];
    data.unreadMessages = 0;
    // data.friendRequestList = [];
    // data.requestSentList = [];
    // data.friendRequests = 0;
    data.myTripList = [];
    data.myItemList = [];
    data.searchedTripsList = [];
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
  //Get account given the accountId.
  this.getAccount = function(accountId) {
    for (var i = 0; i < data.usersList.length; i++) {
      if (data.usersList[i].id == accountId) {
        return data.usersList[i];
      }
    }
  };
  //Return usersList.
  this.getUsersList = function() {
    return data.usersList;
  };
  //----  Control Trip List  -----//
  //Add My Trip
  this.addTrip = function(trip) {
    var index = -1;
    for(var i = 0; i < data.myTripList.length; i++) {
      if(data.myTripList[i].id == trip.id)
        index = i;
    }
    if(index == -1) {
      data.myTripList.push(trip);
    }
  }
  //Edit Trip
  this.replaceTrip = function(index, trip) {
    data.myTripList[index] = trip;
  }
  //Remove Trip
  this.removeTrip = function(index){
    data.myTripList.splice(index, 1);
  }
  //Get TripList
  this.getTripList =  function() {
    return data.myTripList;
  }
  this.getTripOf = function(index) {
    return data.myTripList[index];
  }
  //----  Control My ItemList  -----//
  //Get myItemList
  this.getMyItemList = function(){
    return data.myItemList;
  }
  //Get a Item of index
  this.getItemOf = function(index){
    return data.myItemList[index];
  }
  //Add a Item
  this.addItem =  function(item){
    var index = -1;
    for(var i = 0; i < data.myItemList.length; i++) {
      if(data.myItemList[i].id == item.id)
        index = i;
    }
    if(index == -1) {
      data.myItemList.push(item);
    }
  }
  //Remove a Item
  this.removeItem = function(index){
    data.myItemList.splice(index, 1);
  }
  //Edit a Item
  this.replaceItem = function(index, newItem){
    data.myItemList[index] = newItem;
  }
  //--------------SearchedTripList--------------//
  this.getSearchedTripsList = function(){
    return data.searchedTripsList;
  }
  this.addSearchedTripList = function(trip){
    var index = -1;
    for(var i = 0; i < data.searchedTripsList.length; i++) {
      if(data.searchedTripsList[i].tripId == trip.tripId)
        index = i;
    }
    if(index == -1) {
      data.searchedTripsList.push(trip);
    }
  }
  this.removeSearchedTripList = function(){
     data.searchedTripsList.splice(0, data.searchedTripsList.length);
  }
  this.getSearchedTripOf = function(index) {
    return data.searchedTripsList[index];
  }
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
      // for (var i = 0; i < data.friendList.length; i++) {
      //   if (data.friendList[i].id == id) {
      //     return data.friendList[i].profilePic;
      //   }
      // }
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
      // for (var i = 0; i < data.friendList.length; i++) {
      //   if (data.friendList[i].id == id) {
      //     return data.friendList[i].name.substr(0, data.friendList[i].name.indexOf(' '));
      //   }
      // }
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
  this.getConversation = function(userId) {
    for (var i = 0; i < data.conversationList.length; i++) {
      if (data.conversationList[i].contractor.id == userId) {
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
  // //Add Group.
  // this.addGroup = function(group) {
  //   data.groupList.push(group);
  // };

  // //Get unreadGroupMessages.
  // this.getUnreadGroupMessages = function() {
  //   return data.unreadGroupMessages;
  // };
  // //Add or update friend.
  // this.addOrUpdateFriend = function(friend) {
  //   var index = -1;
  //   for (var i = 0; i < data.friendList.length; i++) {
  //     if (data.friendList[i].id == friend.id) {
  //       index = i;
  //     }
  //   }
  //   if (index >= 0) {
  //     data.friendList[index] = friend;
  //   } else {
  //     data.friendList.push(friend);
  //   }
  // };
  //Get friend given its id.
  // this.getFriend = function(friendId) {
  //   for (var i = 0; i < data.friendList.length; i++) {
  //     if (data.friendList[i].id == friendId) {
  //       return data.friendList[i];
  //     }
  //   }
  // };

  // //Get friendList.
  // this.getFriendList = function() {
  //   return data.friendList;
  // };
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
  // //Add to Group unreadMessages.
  // this.addUnreadGroupMessages = function(messagesCount) {
  //   if (!data.unreadGroupMessages) {
  //     data.unreadGroupMessages = messagesCount;
  //   } else {
  //     data.unreadGroupMessages = data.unreadGroupMessages + messagesCount;
  //   }
  // };
  // //Minus to Group unreadMessages.
  // this.minusUnreadGroupMessages = function(messagesCount) {
  //   if (!data.unreadGroupMessages) {
  //     data.unreadGroupMessages = messagesCount;
  //   } else {
  //     data.unreadGroupMessages = data.unreadGroupMessages - messagesCount;
  //   }
  // };
  // //Set Group unreadMessages.
  // this.setUnreadGroupMessages = function(groupId, unreadMessages) {
  //   for (var i = 0; i < data.groupList.length; i++) {
  //     if (data.groupList[i].id == groupId) {
  //       data.groupList[i].unreadMessages = unreadMessages;
  //     }
  //   }
  // };
  //Add friendRequest.
  // this.addFriendRequest = function(friendRequest) {
  //   data.friendRequestList.push(friendRequest);
  //   data.friendRequests++;
  // };
  // //Get friendRequest List.
  // this.getFriendRequestList = function() {
  //   return data.friendRequestList;
  // };
  //Remove friendRequest.
  // this.removeFriendRequest = function(friendId) {
  //   var index = -1;
  //   for (var i = 0; i < data.friendRequestList.length; i++) {
  //     if (data.friendRequestList[i].id == friendId) {
  //       index = i;
  //       data.friendRequests--;
  //     }
  //   }
  //   if (index > -1) {
  //     data.friendRequestList.splice(index, 1);
  //   }
  // };
  // //Get friendRequest count.
  // this.getFriendRequestsCount = function() {
  //   return data.friendRequests;
  // };
  // //Add requestSent.
  // this.addRequestSent = function(friendRequest) {
  //   data.requestSentList.push(friendRequest);
  // };
  // //Remove requestSent.
  // this.removeRequestSent = function(friendId) {
  //   var index = -1;
  //   for (var i = 0; i < data.requestSentList.length; i++) {
  //     if (data.requestSentList[i].id == friendId) {
  //       index = i;
  //     }
  //   }
  //   if (index > -1) {
  //     data.requestSentList.splice(index, 1);
  //   }
  // };
  // //Get requestSent List.
  // this.getRequestSentList = function() {
  //   return data.requestSentList;
  // };
});
