(function() {
  "use strict";

// Currently makes not much sense, but would be necessary for expansion Stop features (i.e. adding stops by users, etc.)

  angular
    .module("spa-demo.trips")
    .factory("spa-demo.trips.StopImage", StopImage);

  StopImage.$inject = ["$resource", "spa-demo.config.APP_CONFIG"];
  function StopImage($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.server_url + "/api/stops/:stop_id/stop_images/:id",
      { stop_id: '@stop_id', 
        id: '@id'},
      { update: {method:"PUT"} 
      });
  }

})();
