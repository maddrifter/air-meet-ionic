// watchers.js
// This is the controller that handles real time synchronization with the Firebase database and broadcasts to the controller and interfaces with service.js.
// Every time a callback was triggered on Firebase, changes made are made to reflect our Service at service.js.
angular.module('App').factory('Watchers', function($localStorage, $filter, $timeout, Service, Utils, $rootScope) {
  var watchers = [];
  return {
    //Check if watchers are already attached.
    watchersAttached: function() {
      if(watchers.length <= 0) {
        return false;
      } else {
        return true;
      }
    },
    //Clear all our existing watchers for the next user, when the current user logs out.
    removeWatchers: function() {
      var i = watchers.length;
      while (i--) {
        var watcher = watchers[i];
        watcher.ref.off(watcher.eventType, watcher.callback);
        watchers.splice(i, 1);
      }
      $timeout(function() {
        //Clear service variables.
        Service.clearData();
      });
    },
    //Watcher responsible for adding users on Firebase to the service.
    addUsersWatcher: function() {
      var ref = firebase.database().ref('accounts');
      var callback = ref.on('child_added', function(account) {

        var profile = {
          id: account.key,
          name: account.val().name,
          username: account.val().username,
          profilePic: account.val().profilePic,
          date: $filter('date')(new Date(account.val().dateCreated), 'MMM dd, yyyy'),
          provider: account.val().provider
        };
        $timeout(function() {

          Service.addUser(profile);
        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: ref,
        callback: callback,
        eventType: 'child_added'
      });
    },
    //Watcher responsible for adding and updating the user's profile to the service.
    addProfileWatcher: function(accountId) {
      var ref = firebase.database().ref('accounts/' + accountId);
      var callback = ref.on('value', function(account) {

        var profile = {
          id: account.key,
          name: account.val().name,
          username: account.val().username,
          profilePic: account.val().profilePic,
          date: $filter('date')(new Date(account.val().dateCreated), 'MMM dd, yyyy'),
          provider: account.val().provider
        };
        $timeout(function() {

          Service.setProfile(profile);
          //Add to excludedIds because own profile should not show up on search users.
          Service.addExcludedIds(profile.id);
        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: ref,
        callback: callback,
        eventType: 'value'
      });
    },
    //Watcher responsible for adding and updating conversations with the user to the service.
    addNewConversationWatcher: function(accountId) {
      var ref = firebase.database().ref('accounts/' + accountId).child('conversations');
      var callback = ref.on('child_added', function(conversation) {

        var conversationId = conversation.val().conversation;
        var friendId = conversation.val().friend;
        var messagesRead = conversation.val().messagesRead;
        firebase.database().ref('accounts/' + friendId).once('value', function(account) {
          firebase.database().ref('conversations/' + conversationId).once('value', function(conversation) {

            var messagesList = [];
            var messages = conversation.val().messages;
            for (var i = 0; i < messages.length; i++) {
              var profilePic, messageClass;
              if (messages[i].sender == $localStorage.accountId) {
                profilePic = Service.getProfile().profilePic;
                messageClass = 'self';
              } else {
                profilePic = Service.getFriend(messages[i].sender).profilePic;
                messageClass = 'other';
              }
              var message = {
                rawDate: new Date(messages[i].date),
                time: $filter('date')(new Date(messages[i].date), 'h:mm a'),
                date: $filter('date')(new Date(messages[i].date), 'MMM dd'),
                message: messages[i].message,
                image: messages[i].image,
                sender: messages[i].sender,
                type: messages[i].type,
                profilePic: profilePic,
                class: messageClass
              };
              messagesList.push(message);
            }
            var unreadMessages = messages.length - messagesRead;

            var message = messagesList[messagesList.length - 1];
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

            var conversation = {
              friend: Service.getFriend(friendId),
              messages: messagesList,
              unreadMessages: unreadMessages,
              lastMessage: lastMessage,
              id: conversationId,
              lastActiveDate: messagesList[messagesList.length - 1].rawDate
            };

            Service.addUnreadMessages(unreadMessages);
            $timeout(function() {
              Service.addConversation(conversation);

              $rootScope.$broadcast('conversationAdded', {
                friendId: friendId
              });
            });

            //Watcher responsible when a new message was added to the conversation.
            var conversationRef = firebase.database().ref('conversations/' + conversationId);
            var conversationRefChildChanged = conversationRef.on('child_changed', function(message) {

              var message = message.val()[message.val().length - 1];
              var profilePic, messageClass;
              if (message.sender == $localStorage.accountId) {
                profilePic = Service.getProfile().profilePic;
                messageClass = 'self';
              } else {
                profilePic = Service.getFriend(message.sender).profilePic;
                messageClass = 'other';
              }
              var message = {
                time: $filter('date')(new Date(message.date), 'h:mm a'),
                date: $filter('date')(new Date(message.date), 'MMM dd'),
                message: message.message,
                image: message.image,
                sender: message.sender,
                type: message.type,
                profilePic: profilePic,
                class: messageClass
              };
              $timeout(function() {

                Service.addMessageToConversation(conversationId, message);
                $rootScope.$broadcast('messageAdded');
              });
            });

            //Add watcher to the watchers list to be cleared later when user logged out.
            watchers.push({
              ref: conversationRef,
              callback: conversationRefChildChanged,
              eventType: 'child_changed'
            });

          });
        });
      });

      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: ref,
        callback: callback,
        eventType: 'child_added'
      });

      //Watcher responsible for when the accountId's conversations get updated, which in this case was the unreadMessages.
      var accountConversationsRef = firebase.database().ref('accounts/' + accountId).child('conversations');
      var accountConversationsRefChildChanged = accountConversationsRef.on('child_changed', function(conversation) {

        var conversationId = conversation.val().conversation;
        var messagesRead = Service.getConversationById(conversationId).unreadMessages;
        $timeout(function() {

          Service.minusUnreadMessages(messagesRead);
          Service.setUnreadMessages(conversationId, 0);
        });
      });

      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: accountConversationsRef,
        callback: accountConversationsRefChildChanged,
        eventType: 'child_changed'
      });
    },
    //Watcher responsible for the user's friends.
    addNewFriendWatcher: function(accountId) {
      var ref = firebase.database().ref('accounts/' + accountId).child('friends');
      var callback = ref.on('child_added', function(friendId) {

        var friendId = friendId.val();
        var accountFriendRef = firebase.database().ref('accounts/' + friendId);
        var accountFriendRefValue = accountFriendRef.on('value', function(account) {

          var account = account.val();
          var friend = {
            profilePic: account.profilePic,
            name: account.name,
            username: account.username,
            id: friendId,
            online: account.online
          };
          $timeout(function() {
            Service.addOrUpdateFriend(friend);
            Service.updateConversationFriend(friend);
            Service.addExcludedIds(friend.id);

          });
        });
        //Add watcher to the watchers list to be cleared later when user logged out.
        watchers.push({
          ref: accountFriendRef,
          callback: accountFriendRefValue,
          eventType: 'value'
        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: ref,
        callback: callback,
        eventType: 'child_added'
      });
    },
    //Watcher responsible for friend requests.
    addFriendRequestsWatcher: function(accountId) {
      var ref = firebase.database().ref('accounts/' + accountId).child('friendRequests');
      var callback = ref.on('child_added', function(friendId) {

        var friendId = friendId.val();
        firebase.database().ref('accounts/' + friendId).once('value', function(account) {

          var account = account.val();
          var friendRequest = {
            profilePic: account.profilePic,
            name: account.name,
            username: account.username,
            id: friendId,
            online: account.online
          };
          $timeout(function() {
            Service.addFriendRequest(friendRequest);
            Service.addExcludedIds(friendRequest.id);

          });
        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: ref,
        callback: callback,
        eventType: 'child_added'
      });
      //Watcher for friendRequests removed.
      var accountFriendRequestRef = firebase.database().ref('accounts/' + accountId).child('friendRequests');
      var accountFriendRequestRefChildRemoved = accountFriendRequestRef.on('child_removed', function(friendId) {

        var friendId = friendId.val();
        $timeout(function() {
          Service.removeFriendRequest(friendId);
          Service.removeFromExcludedIds(friendId);
          
        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: accountFriendRequestRef,
        callback: accountFriendRequestRefChildRemoved,
        eventType: 'child_removed'
      });
    },
    //Watcher responsible for friend requests sent.
    addRequestsSentWatcher: function(accountId) {
      var ref = firebase.database().ref('accounts/' + accountId).child('requestsSent');
      var callback = ref.on('child_added', function(friendId) {

        var friendId = friendId.val();
        firebase.database().ref('accounts/' + friendId).once('value', function(account) {

          var account = account.val();
          var friendRequest = {
            profilePic: account.profilePic,
            name: account.name,
            username: account.username,
            id: friendId,
            online: account.online
          };
          $timeout(function() {
            Service.addRequestSent(friendRequest);
            Service.addExcludedIds(friendRequest.id);

          });
        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: ref,
        callback: callback,
        eventType: 'child_added'
      });
      //Watcher for requests removed.
      var accountRequestSentRef = firebase.database().ref('accounts/' + accountId).child('requestsSent');
      var accountRequestSentRefChildRemoved = accountRequestSentRef.on('child_removed', function(friendId) {

        var friendId = friendId.val();
        $timeout(function() {
          Service.removeRequestSent(friendId);
          Service.removeFromExcludedIds(friendId);

        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: accountRequestSentRef,
        callback: accountRequestSentRefChildRemoved,
        eventType: 'child_removed'
      });
    },
    //Watcher for new groups.
    addNewGroupWatcher: function(accountId) {
      var ref = firebase.database().ref('accounts/' + accountId).child('groups');
      var callback = ref.on('child_added', function(group) {

        var groupId = group.val().group;
        var messagesRead = group.val().messagesRead;
        firebase.database().ref('groups/' + groupId).once('value', function(group) {
          var name = group.val().name;
          var image = group.val().image;

          var messagesList = [];
          var messages = group.val().messages;
          for (var i = 0; i < messages.length; i++) {
            var profilePic, messageClass;
            if (messages[i].sender == $localStorage.accountId) {
              profilePic = Service.getProfile().profilePic;
              messageClass = 'self';
            } else {
              profilePic = Service.getProfilePic(messages[i].sender);
              messageClass = 'other';
            }
            var message = {
              time: $filter('date')(new Date(messages[i].date), 'h:mm a'),
              date: $filter('date')(new Date(messages[i].date), 'MMM dd'),
              rawDate: new Date(messages[i].date),
              message: messages[i].message,
              image: messages[i].image,
              sender: messages[i].sender,
              type: messages[i].type,
              profilePic: profilePic,
              class: messageClass
            };
            messagesList.push(message);
          }
          var unreadMessages = messages.length - messagesRead;

          var group = {
            name: name,
            image: image,
            messages: messagesList,
            id: groupId,
            unreadMessages: unreadMessages,
            lastActiveDate: messagesList[messagesList.length - 1].rawDate
          };

          Service.addUnreadGroupMessages(unreadMessages);
          $timeout(function() {
            Service.addGroup(group);

          });

          var usersList = [];
          //Watcher for new members on the group.
          var groupUsersRef = firebase.database().ref('groups/' + groupId).child('users');
          var groupUsersRefChildAdded = groupUsersRef.on('child_added', function(userId) {

            var userId = userId.val();
            if (userId == $localStorage.accountId)
              usersList.push(Service.getProfile());
            else
              usersList.push(Service.getAccount(userId));
            $timeout(function() {
              Service.updateGroupUsers(groupId, usersList);

            });
          });
          //Add watcher to the watchers list to be cleared later when user logged out.
          watchers.push({
            ref: groupUsersRef,
            callback: groupUsersRefChildAdded,
            eventType: 'child_added'
          });

          //Watcher for when members leave the group.
          var groupUsersRef = firebase.database().ref('groups/' + groupId).child('users');
          var groupUsersRefChildRemoved = groupUsersRef.on('child_removed', function(userId) {

            var userId = userId.val();
            $timeout(function() {
              Service.removeGroupUser(groupId, userId);

            });
          });
          //Add watcher to the watchers list to be cleared later when user logged out.
          watchers.push({
            ref: groupUsersRef,
            callback: groupUsersRefChildRemoved,
            eventType: 'child_removed'
          });

          //Watcher for changes done on the group, messages and image.
          var groupRef = firebase.database().ref('groups/' + groupId);
          var groupRefChildChanged = groupRef.on('child_changed', function(change) {
            if (change.key == 'messages') {

              var message = change.val()[change.val().length - 1];
              var profilePic, messageClass;
              if (message.sender == $localStorage.accountId) {
                profilePic = Service.getProfile().profilePic;
                messageClass = 'self';
              } else {
                profilePic = Service.getProfilePic(message.sender);
                messageClass = 'other';
              }
              var message = {
                time: $filter('date')(new Date(message.date), 'h:mm a'),
                date: $filter('date')(new Date(message.date), 'MMM dd'),
                message: message.message,
                image: message.image,
                sender: message.sender,
                type: message.type,
                profilePic: profilePic,
                class: messageClass
              };
              $timeout(function() {
                Service.addMessageToGroup(groupId, message);
                $rootScope.$broadcast('messageAdded');

              });
            } else if (change.key == 'image') {
              $timeout(function() {
                Service.setGroupImage(groupId, change.val());
              });
            }
          });
          //Add watcher to the watchers list to be cleared later when user logged out.
          watchers.push({
            ref: groupRef,
            callback: groupRefChildChanged,
            eventType: 'child_changed'
          });
        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: ref,
        callback: callback,
        eventType: 'child_added'
      });
      //Watcher for groups removed.
      var accountGroupsRef = firebase.database().ref('accounts/' + accountId).child('groups');
      var accountGroupsRefChildRemoved = accountGroupsRef.on('child_removed', function() {

        var groupId = $localStorage.groupId;
        $timeout(function() {
          Service.removeGroup(groupId);

        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: accountGroupsRef,
        callback: accountGroupsRefChildRemoved,
        eventType: 'child_removed'
      });
      //Watcher for user when new groupMessages were read.
      var accountGroupsRef = firebase.database().ref('accounts/' + accountId).child('groups');
      var accountGroupsRefChildChanged = accountGroupsRef.on('child_changed', function(group) {

        var groupId = group.val().group;
        var messagesRead = Service.getGroupById(groupId).unreadMessages;
        $timeout(function() {
          Service.minusUnreadGroupMessages(messagesRead);
          Service.setUnreadGroupMessages(groupId, 0);

        });
      });
      //Add watcher to the watchers list to be cleared later when user logged out.
      watchers.push({
        ref: accountGroupsRef,
        callback: accountGroupsRefChildChanged,
        eventType: 'child_changed'
      });
    }
  };
});
