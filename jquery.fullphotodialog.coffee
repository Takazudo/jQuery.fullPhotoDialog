# encapsulate plugin
do ($=jQuery, window=window, document=document) ->

  $window = $(window)

  ns = {}

  # ============================================================
  # options
  
  ns.options = {}

  ns.options.spinner = 
    color: '#fff'
    width: 2
    lines: 15
    length: 12
    radius: 20

  ns.options.src_dialog = """
    <div class="ui-fullphotodialog">
      <div class="ui-fullphotodialog-close"><a class="apply-domwindow-close" href="#">×</a></div>
      <a class="ui-fullphotodialog-openblank" href="#" target="_blank">OPEN</a>
      <div class="ui-fullphotodialog-gallery">
        <div class="ui-fullphotodialog-gallery-inner">
          ___xxx___ITEMSSRC___xxx___
        </div>
      </div>
      <div class="ui-fullphotodialog-caption"></div>
    </div>
  """

  ns.options.src_item = """
    <div
      data-fullphotodialog-caption="___xxx___CAPTION___xxx___"
      data-fullphotodialog-src="___xxx___SRC___xxx___"
      class="ui-fullphotodialog-galleryitem"
    ></div>
  """
  
  # ============================================================
  # utils

  # winsize
  
  ns.winHeight = ->
    return window.innerHeight or $window.height()
  ns.winWidth = ->
    return $window.width()
  
  # simple template

  ns.tmpl = (src, data) ->
    $.each data, (key, val) ->
      tmplStr = "___xxx___#{key.toUpperCase()}___xxx___"
      src = src.replace tmplStr, val
    return src

  # image putter

  ns.putOrAdjustImgInside = ($el) ->

    imgLoaded = $el.data('imgloaded') is true

    if imgLoaded
      $el.refreshImgContainRect()
    else
      src = $el.attr('data-fullphotodialog-src')
      $el.imgContainRect
        cloneImg: false
        oninit: =>
          $el.data 'imgloaded', true
          (new Spinner(ns.options.spinner)).spin $el[0]
        src: src

  # ============================================================
  # FullPhotoDialog
  
  class ns.FullPhotoDialog
    
    constructor: ->

    setup: ->
      
      @steppyInstance = null
      @$steppyRoot = null
      @$caption = null

      @$dialog = $.ui.domwindowdialog.setup
        fixedMinY: 0
        centeronresize: true
        centeronscroll: true
        tandbmargintodecideposition: 0

      @_eventify()

    _eventify: ->

      $window.bind "resize orientationchange", =>
        return unless @$dialog.is(":visible")
        @fitDialog()
        @updateSteppySize()
        @handleImgs()

      return this
      
    handleImgs: ->

      $items = @$steppyRoot.find(".ui-fullphotodialog-galleryitem")
      wh = @calcSteppySize()
      $items.each (i, el) ->
        ns.putOrAdjustImgInside $(el)
      return this

    fitDialog: ->

      @$dialog.css
        width: ns.winWidth()
        height: ns.winHeight()
      return this

    calcSteppySize: ->

      w = ns.winWidth()
      h = ns.winHeight()
      h = h - 70 # subtract close button's height
      return {
        width: w
        height: h
      }

    updateSteppySize: ->

      wh = @calcSteppySize()
      @$steppyRoot.css
        width: wh.width
        height: wh.height
        top: (ns.winHeight() / 2) - (wh.height / 2)

      @$steppyRoot.find(".ui-fullphotodialog-galleryitem").css
        width: wh.width
      @steppyInstance.updateOption
        stepwidth: wh.width

      return this

    updateCaption: (index) ->

      text = @$steppyRoot
        .find('.ui-fullphotodialog-galleryitem')
        .eq(index)
        .attr('data-fullphotodialog-caption')

      @$caption.text text

      return this

    attachCurrentImgLink: ($a) ->

      item = @itemsData[ @steppyInstance.currentIndex ]
      $a.attr 'href', item.src
      return this

    initializeInside: ($dialogRoot) ->

      $dialogRoot.on 'click', '.ui-fullphotodialog-openblank', (e) =>
        $a = $(e.currentTarget)
        @attachCurrentImgLink($a)

      $dialogRoot.on 'touchmove', (e) ->
        e.preventDefault()

      @$steppyRoot = $dialogRoot.find('.ui-fullphotodialog-gallery')
      @$caption = $dialogRoot.find('.ui-fullphotodialog-caption')

      @$steppyRoot.css
        left: 0
        top: (window.innerHeight or $window.height()) / 2

      @$steppyRoot.touchdraghsteppy
        inner: '.ui-fullphotodialog-gallery-inner'
        item: '.ui-fullphotodialog-galleryitem'
        stepwidth: 300
        widthbetween: 20
        maxindex: 8
        triggerrefreshimmediately: false
        alwayspreventtouchmove: true

      @steppyInstance = @$steppyRoot.data('touchdraghsteppy')
      @steppyInstance.on 'refresh indexchange', =>
        @updateCaption @steppyInstance.currentIndex

      @updateSteppySize()
      @$steppyRoot.css visibility: 'visible'
      @handleImgs()

      return this

    open: (@itemsData) ->

      defer = $.Deferred()
      src = @createDialogSrc itemsData

      window.domwindowApi.open src,
        strdialog: true
        width: ns.winWidth()
        height: ns.winHeight()
        afteropen: (e, data) =>
          @initializeInside data.dialog
          defer.resolve()
        beforeclose: =>
          $steppyRoot = null
          steppyInstance = null

      return defer.promise()

    createDialogSrc: (itemsData) ->
      itemsSrc = ''
      $.each itemsData, (i, data) ->
        itemsSrc += ns.tmpl ns.options.src_item, data
      wholeSrc = ns.tmpl ns.options.src_dialog,
        itemsSrc: itemsSrc
      return wholeSrc

  # ============================================================
  # bridge to plugin

  $.FullPhotoDialogNs = ns
  $.fullPhotoDialog = new $.FullPhotoDialogNs.FullPhotoDialog


