// register.js
// This is the controller that handles the registration of the user through Firebase.
// When the user is done registering, the user is automatically logged in.
'Use Strict';
angular.module('App').controller('registerController', function($scope, $state, $localStorage, Utils, Popup, $window) {
  $scope.$on('$ionicView.enter', function() {
    //Clear the Registration Form.
    $scope.user = {
      username: '',
      name: '',
      email: '',
      password: '',
      profilePic: 'img/profile.png'
    };

    $scope.profilePic = 'img/profile.png';
  });

  $scope.register = function(user) {
    //Check if form is filled up.
    if (angular.isDefined(user)) {
      Utils.show();
      firebase.database().ref('accounts').orderByChild('email').equalTo(user.email).once('value').then(function(accounts) {
        if (accounts.exists()) {
          Utils.message(Popup.errorIcon, Popup.emailAlreadyExists);
        } else {
          firebase.database().ref('accounts').orderByChild('username').equalTo(user.username).once('value').then(function(accounts) {
            if (accounts.exists()) {
              Utils.message(Popup.errorIcon, Popup.usernameAlreadyExists);
            } else {
              //Create Firebase account.
              firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then(function() {
                  //Add Firebase account reference to Database. Firebase v3 Implementation.
                  firebase.database().ref().child('accounts').push({
                    name: user.name,
                    username: user.username,
                    profilePic: user.profilePic,
                    email: user.email,
                    userId: firebase.auth().currentUser.uid,
                    dateCreated: Date(),
                    provider: 'Firebase'
                  }).then(function(response) {
                    //Account created successfully, logging user in automatically after a short delay.
                    Utils.message(Popup.successIcon, Popup.accountCreateSuccess)
                      .then(function() {
                        getAccountAndLogin(response.key);
                      })
                      .catch(function() {
                        //User closed the prompt, proceed immediately to login.
                        getAccountAndLogin(response.key);
                      });
                    $localStorage.loginProvider = "Firebase";
                    $localStorage.email = user.email;
                    $localStorage.password = user.password;
                  });
                })
                .catch(function(error) {
                  var errorCode = error.code;
                  var errorMessage = error.message;
                  //Show error message.
                  console.log(errorCode);
                  switch (errorCode) {
                    case 'auth/email-already-in-use':
                      Utils.message(Popup.errorIcon, Popup.emailAlreadyExists);
                      break;
                    case 'auth/invalid-email':
                      Utils.message(Popup.errorIcon, Popup.invalidEmail);
                      break;
                    case 'auth/operation-not-allowed':
                      Utils.message(Popup.errorIcon, Popup.notAllowed);
                      break;
                    case 'auth/weak-password':
                      Utils.message(Popup.errorIcon, Popup.weakPassword);
                      break;
                    default:
                      Utils.message(Popup.errorIcon, Popup.errorRegister);
                      break;
                  }
                });
            }
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
    $state.go('login');
  };
});
