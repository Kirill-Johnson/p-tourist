(function() {
  "use strict";

  angular
    .module("spa-demo.trips")
    .service("spa-demo.trips.currentTrips", CurrentTrips);

  CurrentTrips.$inject = ["$rootScope","$q",
                             "$resource",
                             "spa-demo.geoloc.currentOrigin",
                             "spa-demo.config.APP_CONFIG"];

  function CurrentTrips($rootScope, $q, $resource, currentOrigin, APP_CONFIG) {
    var tripsResource = $resource(APP_CONFIG.server_url + "/api/trip-stops",{},{
      query: { cache:false, isArray:true }
    });
    var service = this;
    service.version = 0;
    service.images = [];
    service.imageIdx = null;
    service.stops = [];
    service.stopIdx = null;
    service.refresh = refresh;
    service.isCurrentImageIndex = isCurrentImageIndex;
    service.isCurrentStopIndex = isCurrentStopIndex;
    service.nextStop = nextStop;
    service.previousStop = previousStop;
    service.imagesAll = [];
    service.stopsAll = [];
    service.trip_id = null;
    service.filterByTrip = filterByTrip;

    //refresh();
    $rootScope.$watch(function(){ return currentOrigin.getVersion(); }, refresh);
    return;
    ////////////////
    function refresh() {
      var params=currentOrigin.getPosition();
      if (!params || !params.lng || !params.lat) {
        params=angular.copy(APP_CONFIG.default_position);
      } else {
        params["distance"]=true;
      }

      if (currentOrigin.getDistance() > 0) {
        params["miles"]=currentOrigin.getDistance();
      }
      params["order"]="ASC";
      if (service.trip_id) {
        params["trip_id"] = service.trip_id;
      }
      console.log("refresh",params);

      var p1=refreshImages(params);
      params["trip"] = "stop";
      var p2=refreshStops(params);
      $q.all([p1, p2]).then(
        function() {
          service.setCurrentImageForCurrentStop();
        });
    }

    function filterByTrip(trip) {
      service.trip_id = trip.id;
      refresh();
    }

    function refreshImages(params) {
      var result=tripsResource.query(params);
      result.$promise.then(
        function(images){
          service.images=images;
          service.version += 1;
          if (!service.imageIdx || service.imageIdx > images.length) {
            service.imageIdx=0;
          }
          console.log("refreshImages", service);
        });
      return result.$promise;
    }
    function refreshStops(params) {
      var result=tripsResource.query(params);
      result.$promise.then(
        function(stops){
          service.stops=stops;
          service.version += 1;
          if (!service.stopIdx || service.stopIdx > stops.length) {
            service.stopIdx=0;
          }
          console.log("refreshStops", service);
        });
      return result.$promise;
    }

    function isCurrentImageIndex(index) {
      //console.log("isCurrentImageIndex", index, service.imageIdx === index);
      return service.imageIdx === index;
    }
    function isCurrentStopIndex(index) {
      //console.log("isCurrentStopIndex", index, service.stopIdx === index);
      return service.stopIdx === index;
    }
    function nextStop() {
      if (service.stopIdx !== null) {
        service.setCurrentStop(service.stopIdx + 1);
      } else if (service.stops.length >= 1) {
        service.setCurrentStop(0);
      }
    }
    function previousStop() {
      if (service.stopIdx !== null) {
        service.setCurrentStop(service.stopIdx - 1);
      } else if (service.stops.length >= 1) {
        service.setCurrentStop(service.stops.length-1);
      }
    }
  }

  CurrentTrips.prototype.getVersion = function() {
    return this.version;
  }
  CurrentTrips.prototype.getImages = function() {
    return this.images;
  }
  CurrentTrips.prototype.getStops = function() {
    return this.stops;
  }
  CurrentTrips.prototype.getCurrentImageIndex = function() {
     return this.imageIdx;
  }
  CurrentTrips.prototype.getCurrentImage = function() {
    return this.images.length > 0 ? this.images[this.imageIdx] : null;
  }
  CurrentTrips.prototype.getCurrentStop = function() {
    return this.stops.length > 0 ? this.stops[this.stopIdx] : null;
  }
  CurrentTrips.prototype.getCurrentImageId = function() {
    var currentImage = this.getCurrentImage();
    return currentImage ? currentImage.image_id : null;
  }
  CurrentTrips.prototype.getCurrentStopId = function() {
    var currentStop = this.getCurrentStop();
    return currentStop ? currentStop.stop_id : null;
  }


  CurrentTrips.prototype.setCurrentImage = function(index, skipStop) {
    if (index >= 0 && this.images.length > 0) {
      this.imageIdx = (index < this.images.length) ? index : 0;
    } else if (index < 0 && this.images.length > 0) {
      this.imageIdx = this.images.length - 1;
    } else {
      this.imageIdx = null;
    }

    if (!skipStop) {
      this.setCurrentStopForCurrentImage();
    }

    console.log("setCurrentImage", this.imageIdx, this.getCurrentImage());
    return this.getCurrentImage();
  }

  CurrentTrips.prototype.setCurrentStop = function(index, skipImage) {
    if (index >= 0 && this.stops.length > 0) {
      this.stopIdx = (index < this.stops.length) ? index : 0;
    } else if (index < 0 && this.stops.length > 0) {
      this.stopIdx = this.stops.length - 1;
    } else {
      this.stopIdx=null;
    }

    if (!skipImage) {
      this.setCurrentImageForCurrentStop();
    }

    console.log("setCurrentStop", this.stopIdx, this.getCurrentStop());
    return this.getCurrentStop();
  }

  CurrentTrips.prototype.setCurrentStopForCurrentImage = function() {
    var image=this.getCurrentImage();
    if (!image || !image.stop_id) {
      this.stopIdx = null;
    } else {
      var stop=this.getCurrentStop();
      if (!stop || stop.stop_id !== image.stop_id) {
        this.stopIdx=null;
        for (var i=0; i<this.stops.length; i++) {
          stop=this.stops[i];
          if (image.stop_id === stop.stop_id) {
            this.setCurrentStop(i, true);
            break;
          }
        }
      }
    }
  }

  CurrentTrips.prototype.setCurrentImageForCurrentStop = function() {
    var image=this.getCurrentImage();
    var stop=this.getCurrentStop();
    if (!stop) {
      this.imageIdx=null;
    } else if ((stop && (!image || stop.stop_id !== image.stop_id)) || image.priority!==0) {
      for (var i=0; i<this.images.length; i++) {
        image=this.images[i];
        if (image.stop_id === stop.stop_id && image.priority===0) {
          this.setCurrentImage(i, true);
          break;
        }
      }
    }
  }

  CurrentTrips.prototype.setCurrentImageId = function(image_id, skipStop) {
    var found=this.getCurrentImageId() === image_id;
    if (image_id && !found) {
      for(var i=0; i<this.images.length; i++) {
        if (this.images[i].image_id === image_id) {
          this.setCurrentImage(i, skipStop);
          found=true;
          break;
        }
      }
    }
    if (!found) {
      this.setCurrentImage(null, true);
    }
  }
  CurrentTrips.prototype.setCurrentStopId = function(stop_id, skipImage) {
    var found=this.getCurrentStopId() === stop_id;
    if (stop_id && !found) {
      for (var i=0; i< this.stops.length; i++) {
        if (this.stops[i].stop_id === stop_id) {
          this.setCurrentStop(i, skipImage);
          found=true;
          break;
        }
      }
    }
    if (!found) {
      this.setCurrentStop(null, true);
    }
  }
  CurrentTrips.prototype.setCurrentTripId = function(stop_id, image_id) {
    console.log("setCurrentTrip", stop_id, image_id);
    this.setCurrentStopId(stop_id, true);
    this.setCurrentImageId(image_id, true);
  }















  })();
