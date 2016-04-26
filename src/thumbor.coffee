angular.module("mpx-frontend-module-thumbor").directive 'thumbor', ->
  restrict: 'A'
  controller: ($scope, $parse) ->
    init: (attrs) ->
      @attrs        = attrs
      @watchers     = []
      keepWatching  = !!attrs.allowChange

      unwatch = $scope.$watch attrs.image, (image) =>
        return if _.isEmpty(image)
        unwatch() unless keepWatching

        @originalUrl      = $parse("#{attrs.image}.url")($scope)
        @signingKey       = $parse("#{attrs.image}.signing_key")($scope)
        @distributionUrl  = $parse("#{attrs.image}.distribution_url")($scope)

        _.each @callbacks,  (cb) -> cb()

    registerListener: (cb) ->
      @callbacks ||= []
      @callbacks.push cb

    parseDimensions: (dimensions) ->
      dimensions.split('x')

    generateUrl: (width, height, method) ->
      width   ||= '0'
      height  ||= '0'
      method  = method && "#{method}/" || ''

      call  = "#{method}#{width}x#{height}/#{@originalUrl}"
      token = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(call, @signingKey))

      # make it urlsafe as python's 'urlsafe_b64encode' does it: https://docs.python.org/2/library/base64.html
      token = token.replace(/\+/g, '-')
      token = token.replace(/\//g, '_')

      "#{@distributionUrl}/#{token}/#{call}"

  link: (scope, element, attrs, ctrl) ->
    ctrl.init(attrs)

angular.module("mpx-frontend-module-thumbor").directive 'thumborImage', ->
  restrict: 'E'
  replace: true
  template: "<img></img>"
  require: 'thumbor'
  link: (scope, element, attrs, ctrl) ->
    onReady = ->
      [width, height] = ctrl.parseDimensions(attrs.thumborDimensions)
      url             = ctrl.generateUrl(width, height, attrs.thumborMethod)

      element.attr('src', url)
      element.removeAttr('url signing-key distribution-url')

    ctrl.registerListener(onReady)

angular.module("mpx-frontend-module-thumbor").directive 'thumborBackground', ->
  restrict: 'A'
  require: 'thumbor'
  link: (scope, element, attrs, ctrl) ->
    onReady = ->
      [width, height] = ctrl.parseDimensions(attrs.thumborDimensions)
      url             = ctrl.generateUrl(width, height, attrs.thumborMethod)

      element.css('background-image': "url(#{url})")
      element.css('background-size': "contain")
      element.css('background-repeat': "no-repeat")
      element.css('background-position': "center center")
      element.removeAttr('url signing-key distribution-url')

    ctrl.registerListener(onReady)

angular.module('mpx-frontend-module-thumbor').directive 'thumborWrapper', ->
    restrict: 'A'
    require: 'thumbor'
    controllerAs: 'thumborWrapper'
    controller: ($scope) ->
      vm = this
      $scope.setSrc = (src) ->
        vm._src = src
        return
      return
    link: (scope, element, attrs, ctrl) ->
      onReady = ->
        ref = ctrl.parseDimensions(attrs.thumborDimensions)
        width = ref[0]
        height = ref[1]
        url = ctrl.generateUrl(width, height, attrs.thumborMethod)
        scope.setSrc url
        element.removeAttr 'url signing-key distribution-url'
        return

      ctrl.registerListener onReady
      return

angular.module("mpx-frontend-module-thumbor").directive 'thumborBackground', ->
  restrict: 'A'
  require: 'thumbor'
  link: (scope, element, attrs, ctrl) ->
    onReady = ->
      [width, height] = ctrl.parseDimensions(attrs.thumborDimensions)
      url             = ctrl.generateUrl(width, height, attrs.thumborMethod)

      element.css('background-image': "url(#{url})")
      element.css('background-size': "contain")
      element.css('background-repeat': "no-repeat")
      element.css('background-position': "center center")
      element.removeAttr('url signing-key distribution-url')

    ctrl.registerListener(onReady)

angular.module("mpx-frontend-module-thumbor").directive 'thumborTooltip', ->
  restrict: 'A'
  require: 'thumbor'
  link: (scope, element, attrs, ctrl) ->
    onReady = ->
      [width, height] = ctrl.parseDimensions(attrs.thumborTooltipDimensions)
      url             = ctrl.generateUrl(width, height, attrs.thumborTooltipMethod)

      preload = new Image()
      preload.onload = ->
        element.tooltip(
          placement: 'right'
          html: true
          title: "<img width='#{preload.width}' height='#{preload.height}' src='#{url}' />"
          template: '<div class="tooltip thumbor-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        )
      preload.src = url

    ctrl.registerListener(onReady)
