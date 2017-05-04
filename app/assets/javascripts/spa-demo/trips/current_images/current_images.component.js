(function() {
  "use strict";

  angular
    .module("spa-demo.trips")
    .component("sdCurrentTripImages", {
      templateUrl: imagesTemplateUrl,
      controller: CurrentImagesController,
    })
    .component("sdCurrentTripImageViewer", {
      templateUrl: imageViewerTemplateUrl,
      controller: CurrentImageViewerController,
      bindings: {
        name: "@",
        minWidth: "@"
      }
    })
    ;

  imagesTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function imagesTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_trip_images_html;
  }    
  imageViewerTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function imageViewerTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_trip_image_viewer_html;
  }    

  CurrentImagesController.$inject = ["$scope",
                                     "spa-demo.trips.currentTrips"];
  function CurrentImagesController($scope, currentTrips) {
    var vm=this;
    vm.imageClicked = imageClicked;
    vm.isCurrentImage = currentTrips.isCurrentImageIndex;

    vm.$onInit = function() {
      console.log("CurrentImagesController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentTrips.getImages(); }, 
        function(images) { vm.images = images; }
      );
    }    
    return;
    //////////////
    function imageClicked(index) {
      currentTrips.setCurrentImage(index);
    }
  }

  CurrentImageViewerController.$inject = ["$scope",
                                          "spa-demo.trips.currentTrips"];
  function CurrentImageViewerController($scope, currentTrips) {
    var vm=this;
    vm.viewerIndexChanged = viewerIndexChanged;

    vm.$onInit = function() {
      console.log("CurrentImageViewerController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentTrips.getImages(); }, 
        function(images) { vm.images = images; }
      );
      $scope.$watch(
        function() { return currentTrips.getCurrentImageIndex(); }, 
        function(index) { vm.currentImageIndex = index; }
      );
    }    
    return;
    //////////////
    function viewerIndexChanged(index) {
      console.log("viewer index changed, setting currentImage", index);
      currentTrips.setCurrentImage(index);
    }
  }

})();
