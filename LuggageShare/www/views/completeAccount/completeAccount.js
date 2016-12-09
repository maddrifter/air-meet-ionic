// completeAccount.js
// This is the controller that handles the final steps when creating an account at Firebase when Social Login is used.
// The user is asked for their email address, because in some cases Social Login is not able to retrieve an email address or is not required by the service (such as Twitter).
// If the email is provided by the provider it is automatically filled in for them when the form loads.
'Use Strict';
angular.module('App').controller('completeAccountController', function($scope, $state, $localStorage, Utils, Popup, $window) {
  $scope.$on('$ionicView.enter', function() {
    //Checks if the Social Login has a photo, and show it on the Registration Form.
    var profilePic;
    if (firebase.auth().currentUser.photoURL) {
      profilePic = firebase.auth().currentUser.photoURL;
    } else {
      profilePic = 'img/profile.png';
    }
    //Checks if the Social Login has a displayName, and show it on the Registration Form.
    var name;
    if (firebase.auth().currentUser.displayName) {
      name = firebase.auth().currentUser.displayName;
    } else {
      name = '';
    }
    //Checks if the Social Login has an email, and set it on the Registration Form.
    var email = '';
    if (firebase.auth().currentUser.email) {
      email = firebase.auth().currentUser.email;
    }

    $scope.user = {
      email: email,
      name: name,
      username: '',
      profilePic: profilePic
    };
  });

  $scope.completeAccount = function(user) {
    //Check if form is filled up.
    if (angular.isDefined(user)) {
      Utils.show();
      //Check if an account with the same email already exists.
      firebase.database().ref('accounts').orderByChild('email').equalTo(user.email).once('value').then(function(accounts) {
        if (accounts.exists()) {
          //Shows error message.
          Utils.message(Popup.errorIcon, Popup.emailAlreadyExists);
        } else {
          //Adds the account to Firebase database.
          firebase.database().ref().child('accounts').push({
            name: user.name,
            username: user.username,
            profilePic: user.profilePic,
            email: user.email,
            userId: firebase.auth().currentUser.uid,
            dateCreated: Date(),
            provider: $localStorage.provider
          }).then(function(response) {
            //Shows success message and proceeds to home after a short delay.
            Utils.message(Popup.successIcon, Popup.accountCreateSuccess)
              .then(function() {
                getAccountAndLogin(response.key);
              })
              .catch(function() {
                //User closed the prompt, proceed immediately to home.
                getAccountAndLogin(response.key);
              });
          });
        }
      });
    }
  };

  //Function to retrieve the account object from the Firebase database and store it on $localStorage.account.
  getAccountAndLogin = function(key) {
    $localStorage.accountId = key;
    firebase.database().ref('accounts/' + key).on('value', function(response) {
      var account = response.val();
      $localStorage.account = account;
      $state.go('messages');
    });
  };

  $scope.back = function() {
    if (firebase.auth()) {
      firebase.auth().signOut().then(function() {
        //Clear the saved credentials.
        $localStorage.$reset();
        $scope.loggedIn = false;
        //Proceed to login screen.
        $state.go('login');
      }, function(error) {
        //Show error message.
        Utils.message(Popup.errorIcon, Popup.errorLogout);
      });
    }
  };
});
