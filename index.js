(function() {
  angular.module('mpx-frontend-module-thumbor', []);

}).call(this);

(function() {
  angular.module("mpx-frontend-module-thumbor").directive('thumbor', function() {
    return {
      restrict: 'A',
      controller: ["$scope", "$parse", function($scope, $parse) {
        return {
          init: function(attrs) {
            var keepWatching, unwatch;
            this.attrs = attrs;
            this.watchers = [];
            keepWatching = !!attrs.allowChange;
            return unwatch = $scope.$watch(attrs.image, (function(_this) {
              return function(image) {
                if (_.isEmpty(image)) {
                  return;
                }
                if (!keepWatching) {
                  unwatch();
                }
                _this.originalUrl = $parse(attrs.image + ".url")($scope);
                _this.signingKey = $parse(attrs.image + ".signing_key")($scope);
                _this.distributionUrl = $parse(attrs.image + ".distribution_url")($scope);
                return _.each(_this.callbacks, function(cb) {
                  return cb();
                });
              };
            })(this));
          },
          registerListener: function(cb) {
            this.callbacks || (this.callbacks = []);
            return this.callbacks.push(cb);
          },
          parseDimensions: function(dimensions) {
            return dimensions.split('x');
          },
          generateUrl: function(width, height, method) {
            var call, token;
            width || (width = '0');
            height || (height = '0');
            method = method && (method + "/") || '';
            call = "" + method + width + "x" + height + "/" + this.originalUrl;
            token = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(call, this.signingKey));
            token = token.replace(/\+/g, '-');
            token = token.replace(/\//g, '_');
            return this.distributionUrl + "/" + token + "/" + call;
          }
        };
      }],
      link: function(scope, element, attrs, ctrl) {
        return ctrl.init(attrs);
      }
    };
  });

  angular.module("mpx-frontend-module-thumbor").directive('thumborImage', function() {
    return {
      restrict: 'E',
      replace: true,
      template: "<img></img>",
      require: 'thumbor',
      link: function(scope, element, attrs, ctrl) {
        var onReady;
        onReady = function() {
          var height, ref1, url, width;
          ref1 = ctrl.parseDimensions(attrs.thumborDimensions), width = ref1[0], height = ref1[1];
          url = ctrl.generateUrl(width, height, attrs.thumborMethod);
          element.attr('src', url);
          return element.removeAttr('url signing-key distribution-url');
        };
        return ctrl.registerListener(onReady);
      }
    };
  });

  angular.module("mpx-frontend-module-thumbor").directive('thumborBackground', function() {
    return {
      restrict: 'A',
      require: 'thumbor',
      link: function(scope, element, attrs, ctrl) {
        var onReady;
        onReady = function() {
          var height, ref1, url, width;
          ref1 = ctrl.parseDimensions(attrs.thumborDimensions), width = ref1[0], height = ref1[1];
          url = ctrl.generateUrl(width, height, attrs.thumborMethod);
          element.css({
            'background-image': "url(" + url + ")"
          });
          element.css({
            'background-size': "contain"
          });
          element.css({
            'background-repeat': "no-repeat"
          });
          element.css({
            'background-position': "center center"
          });
          return element.removeAttr('url signing-key distribution-url');
        };
        return ctrl.registerListener(onReady);
      }
    };
  });

  angular.module('mpx-frontend-module-thumbor').directive('thumborWrapper', function() {
    return {
      restrict: 'A',
      require: 'thumbor',
      controllerAs: 'thumborWrapper',
      controller: ["$scope", function($scope) {
        var vm;
        vm = this;
        $scope.setSrc = function(src) {
          vm._src = src;
        };
      }],
      link: function(scope, element, attrs, ctrl) {
        var onReady;
        onReady = function() {
          var height, ref, url, width;
          ref = ctrl.parseDimensions(attrs.thumborDimensions);
          width = ref[0];
          height = ref[1];
          url = ctrl.generateUrl(width, height, attrs.thumborMethod);
          scope.setSrc(url);
          element.removeAttr('url signing-key distribution-url');
        };
        ctrl.registerListener(onReady);
      }
    };
  });

  angular.module("mpx-frontend-module-thumbor").directive('thumborBackground', function() {
    return {
      restrict: 'A',
      require: 'thumbor',
      link: function(scope, element, attrs, ctrl) {
        var onReady;
        onReady = function() {
          var height, ref1, url, width;
          ref1 = ctrl.parseDimensions(attrs.thumborDimensions), width = ref1[0], height = ref1[1];
          url = ctrl.generateUrl(width, height, attrs.thumborMethod);
          element.css({
            'background-image': "url(" + url + ")"
          });
          element.css({
            'background-size': "contain"
          });
          element.css({
            'background-repeat': "no-repeat"
          });
          element.css({
            'background-position': "center center"
          });
          return element.removeAttr('url signing-key distribution-url');
        };
        return ctrl.registerListener(onReady);
      }
    };
  });

  angular.module("mpx-frontend-module-thumbor").directive('thumborTooltip', function() {
    return {
      restrict: 'A',
      require: 'thumbor',
      link: function(scope, element, attrs, ctrl) {
        var onReady;
        onReady = function() {
          var height, preload, ref1, url, width;
          ref1 = ctrl.parseDimensions(attrs.thumborTooltipDimensions), width = ref1[0], height = ref1[1];
          url = ctrl.generateUrl(width, height, attrs.thumborTooltipMethod);
          preload = new Image();
          preload.onload = function() {
            return element.tooltip({
              placement: 'right',
              html: true,
              title: "<img width='" + preload.width + "' height='" + preload.height + "' src='" + url + "' />",
              template: '<div class="tooltip thumbor-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
            });
          };
          return preload.src = url;
        };
        return ctrl.registerListener(onReady);
      }
    };
  });

}).call(this);
