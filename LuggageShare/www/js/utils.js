angular.module('App').factory('Utils', function($ionicLoading, $timeout, Popup, $ionicPopup, $cordovaCamera, $rootScope) {
  var promise;
  var Utils = {
    show: function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="ripple"></ion-spinner>'
      });
    },
    hide: function() {
      $ionicLoading.hide();
    },
    message: function(icon, message) {
      $ionicLoading.show({
        template: '<div class="message-popup" onclick="hideMessage()"><h1><i class="icon ' + icon + '"></i></h1><p>' + message + '</p></div>',
        scope: this
      });
      promise = $timeout(function() {
        $ionicLoading.hide();
      }, Popup.delay);
      return promise;
    },
    confirm: function(icon, message, icon1, icon2) {
      var popup = $ionicPopup.confirm({
        cssClass: 'message-confirm',
        title: '<i class="icon ' + icon + '"></i>',
        template: message,
        buttons: [{
          text: '<i class="icon ' + icon1 + '"></i>',
          type: 'button-confirm',
          onTap: function(e) {
            return false;
          }
        }, {
          text: '<i class="icon ' + icon2 + '"></i>',
          type: 'button-confirm',
          onTap: function(e) {
            return true;
          }
        }]
      });
      return popup;
    },
    image: function(url) {
      var popup = $ionicPopup.confirm({
        cssClass: 'image-popup',
        template: '<div><img ng-src="' + url + '"/></div>',
        buttons: [{
          text: '<i class="icon ion-close"></i>',
          type: 'button-confirm',
          onTap: function(e) {
            return false;
          }
        }]
      });
      return popup;
    },
    generateFilename: function() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 100; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text + ".png";
    },
    dataURItoBlob: function(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {
        type: mimeString
      });
    },
    getProfilePicture: function(imageSource) {
      Utils.show();
      //Set Camera options here.
      var options = {
        quality: 25,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: imageSource,
        encodingType: Camera.EncodingType.PNG,
        targetWidth: 320,
        targetHeight: 320,
        popoverOptions: CameraPopoverOptions,
        correctOrientation: true,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        //Create imageURI.
        var imgURI = "data:image/png;base64," + imageData;
        //Create Blob File from ImageURI.
        var file = Utils.dataURItoBlob(imgURI);
        //Create and set Meta Type to Firebase Storage Ref.
        var storageRef = firebase.storage().ref();
        var metadata = {
          'contentType': file.type
        };
        //Refer to images folder of Firebase Storage.
        storageRef.child('images/' + Utils.generateFilename()).put(file, metadata).then(function(snapshot) {
          //File successfully uploaded to Firebase Storage.
          var url = snapshot.metadata.downloadURLs[0];
          // $scope.sendMessage('image', url);
          Utils.hide();
          $rootScope.$broadcast('imageUploaded', {
            imageUrl: url
          });
        }).catch(function(error) {
          alert(error);
          //Show Error.
          Utils.message(Popup.errorIcon, Popup.uploadImageError);
        });
      }, function(err) {
        //User Cancelled.
        Utils.hide();
      });
    },
    getPicture: function(imageSource) {
      Utils.show();
      //Set Camera options here.
      var options = {
        quality: 25,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: imageSource,
        encodingType: Camera.EncodingType.PNG,
        targetWidth: 576,
        targetHeight: 576,
        popoverOptions: CameraPopoverOptions,
        correctOrientation: true,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        //Create imageURI.
        var imgURI = "data:image/png;base64," + imageData;
        //Create Blob File from ImageURI.
        var file = Utils.dataURItoBlob(imgURI);
        //Create and set Meta Type to Firebase Storage Ref.
        var storageRef = firebase.storage().ref();
        var metadata = {
          'contentType': file.type
        };
        //Refer to images folder of Firebase Storage.
        storageRef.child('images/' + Utils.generateFilename()).put(file, metadata).then(function(snapshot) {
          //File successfully uploaded to Firebase Storage.
          var url = snapshot.metadata.downloadURLs[0];
          // $scope.sendMessage('image', url);
          Utils.hide();
          $rootScope.$broadcast('imageUploaded', {
            imageUrl: url
          });
        }).catch(function(error) {
          alert(error);
          //Show Error.
          Utils.message(Popup.errorIcon, Popup.uploadImageError);
        });
      }, function(err) {
        //User Cancelled.
        Utils.hide();
      });
    },
    getItemPicture: function(imageSource) {
      Utils.show();
      //Set Camera options here.
      var options = {
        quality: 25,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: imageSource,
        encodingType: Camera.EncodingType.PNG,
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        correctOrientation: true,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        //Create imageURI.
        var imgURI = "data:image/png;base64," + imageData;
        //Create Blob File from ImageURI.
        var file = Utils.dataURItoBlob(imgURI);
        //Create and set Meta Type to Firebase Storage Ref.
        var storageRef = firebase.storage().ref();
        var metadata = {
          'contentType': file.type
        };
        //Refer to images folder of Firebase Storage.
        storageRef.child('images/' + Utils.generateFilename()).put(file, metadata).then(function(snapshot) {
          //File successfully uploaded to Firebase Storage.
          var url = snapshot.metadata.downloadURLs[0];
          // $scope.sendMessage('image', url);
          Utils.hide();
          $rootScope.$broadcast('imageUploaded', {
            imageUrl: url
          });
        }).catch(function(error) {
          alert(error);
          //Show Error.
          Utils.message(Popup.errorIcon, Popup.uploadImageError);
        });
      }, function(err) {
        //User Cancelled.
        Utils.hide();
      });
    }
  };
  hideMessage = function() {
    $timeout.cancel(promise);
    $ionicLoading.hide();
  };
  return Utils;
});
