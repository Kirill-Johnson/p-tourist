(function() {
  "use strict";

  angular
    .module("spa-demo.trips")
    .component("sdCurrentTripsMap", {
      template: "<div id='map'></div>",
      controller: CurrentTripsMapController,
      bindings: {
        zoom: "@"
      }
    });

  CurrentTripsMapController.$inject = ["$scope", "$q", "$element",
                                          "spa-demo.geoloc.currentOrigin",
                                          "spa-demo.geoloc.myLocation",
                                          "spa-demo.geoloc.Map",
                                          "spa-demo.trips.currentTrips",
                                          "spa-demo.config.APP_CONFIG"];
  function CurrentTripsMapController($scope, $q, $element, 
                                        currentOrigin, myLocation, Map, currentTrips, 
                                        APP_CONFIG) {
    var vm=this;

    vm.$onInit = function() {
      console.log("CurrentTripsMapController",$scope);
    }
    vm.$postLink = function() {
      var element = $element.find('div')[0];
      getLocation().then(
        function(location){
          vm.location = location;
          initializeMap(element, location.position);
        });

      $scope.$watch(
        function(){ return currentTrips.getImages(); }, 
        function(images) { 
          vm.images = images; 
          displayTrips(); 
        }); 
      $scope.$watch(
        function(){ return currentTrips.getCurrentImage(); }, 
        function(link) { 
          if (link) { 
            vm.setActiveMarker(link.stop_id, link.image_id); 
          } else {
            vm.setActiveMarker(null,null);           
          }
        }); 
      $scope.$watch(
        function(){ 
            return vm.map ? vm.map.getCurrentMarker() : null; }, 
        function(marker) { 
          if (marker) {
            console.log("map changed markers", marker);
            currentTrips.setCurrentTripId(marker.stop_id, marker.image_id);
          }
        }); 
      $scope.$watch(
        function() { return currentOrigin.getLocation(); },
        function(location) { 
          vm.location = location;
          vm.updateOrigin(); 
        });       
    }

    return;
    //////////////
    function getLocation() {
      var deferred = $q.defer();

      //use current address if set
      var location = currentOrigin.getLocation();
      if (!location) {
        //try my location next
        myLocation.getCurrentLocation().then(
          function(location){
            deferred.resolve(location);
          },
          function(){
            deferred.resolve({ position: APP_CONFIG.default_position});
          });
      } else {
        deferred.resolve(location);
      }

      return deferred.promise;
    }

    function initializeMap(element, position) {
      vm.map = new Map(element, {
        center: position,        
        zoom: vm.zoom || 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      displayTrips();  
    }

    function displayTrips(){
      if (!vm.map) { return; }
      vm.map.clearMarkers();
      vm.map.displayOriginMarker(vm.originInfoWindow(vm.location));

      angular.forEach(vm.images, function(si){
        displayTrip(si);
      });
    }

    function displayTrip(si) {
      var markerOptions = {
        position: {
          lng: si.position.lng,
          lat: si.position.lat
        },
        stop_id: si.stop_id,
        image_id: si.image_id          
      };
      if (si.stop_id && si.priority===0) {
        markerOptions.title = si.stop_name;
        markerOptions.icon = APP_CONFIG.stop_marker;
        markerOptions.content = vm.stopInfoWindow(si);
      } else if (si.stop_id) {
        markerOptions.title = si.stop_name;
        markerOptions.icon = APP_CONFIG.secondary_marker;
        markerOptions.content = vm.stopInfoWindow(si);
      } else {
        markerOptions.title = si.image_caption;
        markerOptions.icon = APP_CONFIG.orphan_marker;
        markerOptions.content = vm.imageInfoWindow(si);
      }
      vm.map.displayMarker(markerOptions);    
    }
  }

  CurrentTripsMapController.prototype.updateOrigin = function() {
    if (this.map && this.location) {
      this.map.center({ 
        center: this.location.position
      });
      this.map.displayOriginMarker(this.originInfoWindow(this.location));
    }
  }

  CurrentTripsMapController.prototype.setActiveMarker = function(stop_id, image_id) {
    if (!this.map) { 
      return; 
    } else if (!stop_id && !image_id) {
      if (this.map.getCurrentMarker().title!=='origin') {
        this.map.setActiveMarker(null);
      }
    } else {
      var markers=this.map.getMarkers();
      for (var i=0; i<markers.length; i++) {
        var marker=markers[i];
        if (marker.stop_id === stop_id && marker.image_id === image_id) {
            this.map.setActiveMarker(marker);
            break;
        }
      }
    } 
  }

  CurrentTripsMapController.prototype.originInfoWindow = function(location) {
    console.log("originInfo", location);
    var full_address = location ? location.formatted_address : "";
    var lng = location && location.position ? location.position.lng : "";
    var lat = location && location.position ? location.position.lat : "";
    var html = [
      "<div class='origin'>",
        "<div class='full_address'>"+ full_address + "</div>",
        "<div class='position'>",
          "lng: <span class='lng'>"+ lng +"</span>",
          "lat: <span class='lat'>"+ lat +"</span>",
        "</div>",
      "</div>",
    ].join("\n");

    return html;
  }

  CurrentTripsMapController.prototype.stopInfoWindow = function(si) {
    console.log("stopInfo", si);
    var html ="<div class='stop-marker-info'><div>";
      html += "<span class='id si_id'>"+ si.id+"</span>";
      html += "<span class='id stop_id'>"+ si.stop_id+"</span>";
      html += "<span class='id image_id'>"+ si.image_id+"</span>";
      html += "<span class='stop-name'>"+ si.stop_name + "</span>";
      if (si.image_caption) {
        html += "<span class='image-caption'> ("+ si.image_caption + ")</span>";      
      }
      if (si.distance) {
        html += "<span class='distance'> ("+ Number(si.distance).toFixed(1) +" mi)</span>";
      }
      html += "</div><img src='"+ si.image_content_url+"?width=200'>";
      html += "</div>";
    return html;
  }

  CurrentTripsMapController.prototype.imageInfoWindow = function(si) {
    console.log("imageInfo", si);
    var html ="<div class='image-marker-info'><div>";
      html += "<span class='id image_id'>"+ si.image_id+"</span>";
      if (si.image_caption) {
        html += "<span class='image-caption'>"+ si.image_caption + "</span>";      
      }
      if (si.distance) {
        html += "<span class='distance'> ("+ Number(si.distance).toFixed(1) +" mi)</span>";
      }
      html += "</div><img src='"+ si.image_content_url+"?width=200'>";
      html += "</div>";
    return html;    
  }


})();
