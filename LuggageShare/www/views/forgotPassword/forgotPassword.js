// forgotPassword.js
// This is the controller that handles the retriving of password for Firebase accounts.
// The user is asked for their email address, where the password reset form will be emailed to.
'Use Strict';
angular.module('App').controller('forgotPasswordController', function($scope, $state, Utils, Popup) {
  $scope.$on('$ionicView.enter', function() {
    //Clears the Forgot Password Form.
    $scope.user = {
      email: ''
    };
  });

  $scope.resetPassword = function(user) {
    if (angular.isDefined(user)) {
      Utils.show();
      firebase.auth().sendPasswordResetEmail(user.email)
        .then(function() {
          //Shows success message.
          Utils.message(Popup.successIcon, Popup.passwordReset + user.email)
            .then(function() {
              //Proceeds to home after a short delay.
              $state.go('login');
            })
            .catch(function() {
              //User closed the prompt, proceed immediately to home.
              $state.go('login');
            });
        })
        .catch(function(error) {
          var errorCode = error.code;
          //Show error message.
          console.log(errorCode);
          switch (errorCode) {
            case 'auth/user-not-found':
              Utils.message(Popup.errorIcon, Popup.emailNotFound);
              break;
            case 'auth/invalid-email':
              Utils.message(Popup.errorIcon, Popup.invalidEmail);
              break;
            default:
              Utils.message(Popup.errorIcon, Popup.errorPasswordReset);
              break;
          }
        });
    }
  };

  $scope.back = function() {
    $state.go('login');
  };
});
