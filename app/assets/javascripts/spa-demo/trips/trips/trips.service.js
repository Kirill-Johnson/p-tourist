(function() {
  'use strict';

  angular.module('spa-demo.trips')
    .factory('spa-demo.trips.Trip', TripFactory);

  TripFactory.$inject = ['$resource', 'spa-demo.config.APP_CONFIG'];
  function TripFactory($resource, APP_CONFIG) {
    var service = $resource(
      APP_CONFIG.server_url + '/api/trips/:id',
      { id: '@id' },
      {
        query: {method: 'GET', isArray: true},
        update: { method: 'PUT' },
        associate_stops: {
          method: 'POST',
          url: APP_CONFIG.server_url + '/api/trips/:id/associated_stops'
        },
        associated_stops: {
          method: 'GET',
          isArray: true,
          url: APP_CONFIG.server_url + '/api/trips/:id/associated_stops'
        },
        linkable_stops: {
          method: 'GET',
          isArray: true,
          url: APP_CONFIG.server_url + '/api/trips/:id/linkable_stops'
        }
      }
    );

    return service;
  }
}());
