(function() {
  "use strict";

  angular
    .module("spa-demo.trips")
    .factory("spa-demo.trips.Stop", StopFactory);

  StopFactory.$inject = ["$resource","spa-demo.config.APP_CONFIG"];
  function StopFactory($resource, APP_CONFIG) {
    var service = $resource(APP_CONFIG.server_url + "/api/stops/:id",
        { id: '@id'},
        { update: {method:"PUT"} }
      );
    return service;
  }
})();
