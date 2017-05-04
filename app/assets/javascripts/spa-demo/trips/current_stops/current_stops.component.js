(function() {
  "use strict";

  angular
    .module("spa-demo.trips")
    .component("sdCurrentStops", {
      templateUrl: stopsTemplateUrl,
      controller: CurrentStopsController,
    })
    .component("sdCurrentStopInfo", {
      templateUrl: stopInfoTemplateUrl,
      controller: CurrentStopInfoController,
    })
    ;

  stopsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function stopsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_stops_html;
  }    
  stopInfoTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function stopInfoTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_stop_info_html;
  }    

  CurrentStopsController.$inject = ["$scope",
                                     "spa-demo.trips.currentTrips"];
  function CurrentStopsController($scope,currentTrips) {
    var vm=this;
    vm.stopClicked = stopClicked;
    vm.isCurrentStop = currentTrips.isCurrentStopIndex;

    vm.$onInit = function() {
      console.log("CurrentStopsController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentTrips.getStops(); }, 
        function(stops) { vm.stops = stops; }
      );
    }    
    return;
    //////////////
    function stopClicked(index) {
      currentTrips.setCurrentStop(index);
    }    
  }

  CurrentStopInfoController.$inject = ["$scope",
                                        "spa-demo.trips.currentTrips",
                                        "spa-demo.trips.Stop",
                                        "spa-demo.authz.Authz"];
  function CurrentStopInfoController($scope,currentTrips, Stop, Authz) {
    var vm=this;
    vm.nextStop = currentTrips.nextStop;
    vm.previousStop = currentTrips.previousStop;

    vm.$onInit = function() {
      console.log("CurrentStopInfoController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentTrips.getCurrentStop(); }, 
        newStop 
      );
      $scope.$watch(
        function() { return Authz.getAuthorizedUserId(); },
        function() { newStop(currentTrips.getCurrentStop()); }
      );        
    }    
    return;
    //////////////
    function newStop(link) {
      vm.link = link; 
      vm.stop = null;
      if (link && link.stop_id) {
        vm.stop=Stop.get({id:link.stop_id});
      }
    }







  }
})();
