(function() {
  'use strict';
  angular.module("spa-demo.trips").component("sdCurrentTrips", {
    templateUrl: currentTripsTemplateUrl,
    controller: currentTripsController
  });

  currentTripsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function currentTripsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_trip_html;
  }

  currentTripsController.$inject = ["spa-demo.trips.Trip", "spa-demo.trips.currentTrips"];
  function currentTripsController(Trip, currentTrips) {
    var vm = this;
    vm.trips = [];
    vm.selected = null;
    vm.select = select;

    Trip.query().$promise.then(function(x, d) {
      vm.trips = x;
      select(vm.trips[0]);
    })

    //////////////////////////
    function select(trip) {
      if (trip == vm.selected) {
        vm.selected = null;
        return;
      }
      vm.selected = trip;
      currentTrips.filterByTrip(trip);
    }

  }

}());
