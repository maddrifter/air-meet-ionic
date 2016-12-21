'Use Strict';
angular.module('App').controller('searchDetailController', function($scope, $state, $filter, $stateParams, Service, Watchers,$localStorage, $ionicHistory, $ionicTabsDelegate) {
  $scope.$on('$stateChangeStart', function(event) {
    if (!$scope.canChangeView) {
      event.preventDefault();
    }
  });
  $scope.trip = {
    from : "",
    to : "",
    dateTime: $filter('date')(new Date(), 'dd MMM yyyy'),
    weightAvailable : "",
    dimension : "",
    flightNumber: "",
    modeOfTransport : "",
    traveler : "",
    tripId : "",
    travelerName : "",
    travelerAvatarURL : "",
  }
  //Allow changing to other views when tabs is selected.
  $scope.changeTab = function(stateTo) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $scope.canChangeView = true;
    $state.go(stateTo);
  };

  $scope.back = function(){
    $scope.canChangeView = true;
    if ($ionicHistory.backView()) {
      $ionicHistory.goBack();
    } else {
      $state.go("search");
    }
  };
  $scope.goToChat = function(){
    console.log("====== Go To Chat");
    if ($scope.trip.traveler) {
      $localStorage.userId = $scope.trip.traveler;
      console.log("Chat Partner : " , $scope.trip.traveler);
    }
    $scope.canChangeView = true;
    $state.go('message');
  };
  $scope.goToGetItem = function(){
    console.log("======= Go to Get Item");
    $scope.canChangeView = true;
    $scope.changeTab('myitems');
  };
  $scope.sendRequest = function() {
    console.log("======== Go to Send Request");
  };
  $scope.$on('$ionicView.enter', function() {

      var tripInfo = Service.getSearchedTripOf($stateParams.index);
      if (tripInfo) {
        $scope.trip = {
          from : tripInfo.from,
          to : tripInfo.to,
          dateTime : $filter('date')(new Date(tripInfo.dateTime), 'dd MMM yyyy'),
          weightAvailable :tripInfo.weightAvailable,
          dimension : tripInfo.sizeAvailable,
          flightNumber : tripInfo.flightNumber,
          modeOfTransport : tripInfo.modeOfTransport,
          traveler : tripInfo.traveler,
          tripId : tripInfo.tripId,
          travelerName : "",
          travelerAvatarURL : "",
        }
        if (Service.getAccount($scope.trip.traveler)){
          var traveler = Service.getAccount($scope.trip.traveler);
          addAccountInfo(traveler)
        } else {
          firebase.database().ref('accounts/' + $scope.trip.traveler).once('value', function(account) {
             var traveler = account.val();
             addAccountInfo(traveler)
          });
        }
      }

      $scope.changedProfilePic = false;
      // Disable canChangeView to disable automatically restating to messages route whenever Firebase Watcher calls are triggered.
      $scope.canChangeView = false;
      // Select the 4th tab on the footer to highlight the profile icon.
      $ionicTabsDelegate.select(0);
  });

  var addAccountInfo = function(traveler){
    var travelerName = traveler.name;
    $scope.trip['travelerName'] = travelerName;
    console.log("!!!===", $scope.trip);
  }
});
