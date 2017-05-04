(function() {
  "use strict";

// Currently makes not much sense, but would be necessary for expansion Stop features (i.e. adding stops by users, etc.)

  angular
    .module("spa-demo.trips")
    .component("sdStopEditor", {
      templateUrl: stopEditorTemplateUrl,
      controller: StopEditorController,
      bindings: {
        authz: "<"
      },
      require: {
        stopsAuthz: "^sdStopsAuthz"
      }      
    })
    .component("sdStopSelector", {
      templateUrl: stopSelectorTemplateUrl,
      controller: StopSelectorController,
      bindings: {
        authz: "<"
      }
    })
    ;


  stopEditorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function stopEditorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.stop_editor_html;
  }    
  stopSelectorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function stopSelectorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.stop_selector_html;
  }    

  StopEditorController.$inject = ["$scope","$q",
                                   "$state","$stateParams",
                                   "spa-demo.authz.Authz",
                                   "spa-demo.trips.Stop",
                                   "spa-demo.trips.StopImage"];
  function StopEditorController($scope, $q, $state, $stateParams, 
                                 Authz, Stop, StopImage) {
    var vm=this;
    vm.create = create;
    vm.clear  = clear;
    vm.update  = update;
    vm.remove  = remove;
    vm.haveDirtyLinks = haveDirtyLinks;
    vm.updateImageLinks = updateImageLinks;

    vm.$onInit = function() {
      //console.log("StopEditorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); }, 
                    function(){ 
                      if ($stateParams.id) {
                        reload($stateParams.id); 
                      } else {
                        newResource();
                      }
                    });
    }

    return;
    //////////////
    function newResource() {
      vm.item = new Stop();
      vm.stopsAuthz.newItem(vm.item);
      return vm.item;
    }

    function reload(stopId) {
      var itemId = stopId ? stopId : vm.item.id;      
      //console.log("re/loading stop", itemId);
      vm.images = StopImage.query({stop_id:itemId});
      vm.item = Stop.get({id:itemId});
      vm.stopsAuthz.newItem(vm.item);
      vm.images.$promise.then(
        function(){
          angular.forEach(vm.images, function(si){
            si.originalPriority = si.priority;            
          });                     
        });
      $q.all([vm.item.$promise,vm.images.$promise]).catch(handleError);
    }
    function haveDirtyLinks() {
      for (var i=0; vm.images && i<vm.images.length; i++) {
        var si=vm.images[i];
        if (si.toRemove || si.originalPriority != si.priority) {
          return true;
        }        
      }
      return false;
    }    

    function create() {      
      vm.item.errors = null;
      vm.item.$save().then(
        function(){
          //console.log("stop created", vm.item);
          $state.go(".",{id:vm.item.id});
        },
        handleError);
    }

    function clear() {
      newResource();
      $state.go(".",{id: null});    
    }

    function update() {      
      vm.item.errors = null;
      var update=vm.item.$update();
      updateImageLinks(update);
    }
    function updateImageLinks(promise) {
      //console.log("updating links to images");
      var promises = [];
      if (promise) { promises.push(promise); }
      angular.forEach(vm.images, function(si){
        if (si.toRemove) {
          promises.push(si.$remove());
        } else if (si.originalPriority != si.priority) {          
          promises.push(si.$update());
        }
      });

      //console.log("waiting for promises", promises);
      $q.all(promises).then(
        function(response){
          //console.log("promise.all response", response); 
          //update button will be disabled when not $dirty
          $scope.stopform.$setPristine();
          reload(); 
        }, 
        handleError);    
    }

    function remove() {      
      vm.item.$remove().then(
        function(){
          //console.log("stop.removed", vm.item);
          clear();
        },
        handleError);
    }

    function handleError(response) {
      console.log("error", response);
      if (response.data) {
        vm.item["errors"]=response.data.errors;          
      } 
      if (!vm.item.errors) {
        vm.item["errors"]={}
        vm.item["errors"]["full_messages"]=[response]; 
      }      
      $scope.stopform.$setPristine();
    }    
  }

  StopSelectorController.$inject = ["$scope",
                                     "$stateParams",
                                     "spa-demo.authz.Authz",
                                     "spa-demo.trips.Stop"];
  function StopSelectorController($scope, $stateParams, Authz, Stop) {
    var vm=this;

    vm.$onInit = function() {
      //console.log("StopSelectorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); }, 
                    function(){ 
                      if (!$stateParams.id) {
                        vm.items = Stop.query();        
                      }
                    });
    }
    return;
    //////////////
  }

})();
