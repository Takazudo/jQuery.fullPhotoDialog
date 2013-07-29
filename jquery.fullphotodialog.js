/*! jQuery.fullPhotoDialog (https://github.com/Takazudo/jQuery.fullPhotoDialog)
 * lastupdate: 2013-07-29
 * version: 0.0.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {

  (function($, window, document) {
    var $window, ns;
    $window = $(window);
    ns = {};
    ns.resizeCount = 0;
    ns.options = {};
    ns.options.spinner = {
      color: '#fff',
      width: 2,
      lines: 15,
      length: 12,
      radius: 20
    };
    ns.options.src_dialog = "<div class=\"ui-fullphotodialog\">\n  <div class=\"ui-fullphotodialog-close\"><a class=\"apply-domwindow-close\" href=\"#\">×</a></div>\n  <a class=\"ui-fullphotodialog-openblank\" href=\"#\" target=\"_blank\">OPEN</a>\n  <div class=\"ui-fullphotodialog-gallery\">\n    <div class=\"ui-fullphotodialog-gallery-inner\">\n      ___xxx___ITEMSSRC___xxx___\n    </div>\n  </div>\n  <div class=\"ui-fullphotodialog-caption\"></div>\n</div>";
    ns.options.src_item = "<div\n  data-fullphotodialog-caption=\"___xxx___CAPTION___xxx___\"\n  data-fullphotodialog-src=\"___xxx___SRC___xxx___\"\n  class=\"ui-fullphotodialog-galleryitem\"\n></div>";
    ns.browser = {};
    ns.browser.android = /android/i.test(navigator.userAgent);
    ns.browser.android = true;
    ns.winHeight = function() {
      return window.innerHeight || $window.height();
    };
    ns.winWidth = function() {
      return $window.width();
    };
    ns.tmpl = function(src, data) {
      $.each(data, function(key, val) {
        var tmplStr;
        tmplStr = "___xxx___" + (key.toUpperCase()) + "___xxx___";
        return src = src.replace(tmplStr, val);
      });
      return src;
    };
    ns.putOrAdjustImgInside = function($el) {
      var imgLoaded, src,
        _this = this;
      imgLoaded = $el.data('imgloaded') === true;
      if (imgLoaded) {
        return $el.refreshImgContainRect();
      } else {
        src = $el.attr('data-fullphotodialog-src');
        return $el.imgContainRect({
          cloneImg: false,
          oninit: function() {
            $el.data('imgloaded', true);
            return (new Spinner(ns.options.spinner)).spin($el[0]);
          },
          src: src
        });
      }
    };
    ns.FullPhotoDialog = (function() {

      function FullPhotoDialog() {}

      FullPhotoDialog.prototype.setup = function() {
        this.steppyInstance = null;
        this.$steppyRoot = null;
        this.$caption = null;
        this.$dialog = $.ui.domwindowdialog.setup({
          fixedMinY: 0,
          centeronresize: true,
          centeronscroll: true,
          tandbmargintodecideposition: 0
        });
        return this._eventify();
      };

      FullPhotoDialog.prototype._eventify = function() {
        var handler,
          _this = this;
        if (ns.browser.android) {
          handler = function(checkLater) {
            var currentResizeCount;
            currentResizeCount = ns.resizeCount;
            if (!_this.$dialog.is(":visible")) {
              return;
            }
            _this.fitDialog();
            _this.updateSteppySize();
            _this.handleImgs();
            if (!checkLater) {
              return;
            }
            return setTimeout(function() {
              if (ns.resizeCount !== currentResizeCount) {
                return;
              }
              return handler();
            }, 500);
          };
        } else {
          handler = function() {
            if (!_this.$dialog.is(":visible")) {
              return;
            }
            _this.fitDialog();
            _this.updateSteppySize();
            return _this.handleImgs();
          };
        }
        $window.bind("resize orientationchange", function() {
          ns.resizeCount += 1;
          return handler(true);
        });
        return this;
      };

      FullPhotoDialog.prototype.handleImgs = function() {
        var $items, wh;
        $items = this.$steppyRoot.find(".ui-fullphotodialog-galleryitem");
        wh = this.calcSteppySize();
        $items.each(function(i, el) {
          return ns.putOrAdjustImgInside($(el));
        });
        return this;
      };

      FullPhotoDialog.prototype.fitDialog = function() {
        this.$dialog.css({
          width: ns.winWidth(),
          height: ns.winHeight()
        });
        return this;
      };

      FullPhotoDialog.prototype.calcSteppySize = function() {
        var h, w;
        w = ns.winWidth();
        h = ns.winHeight();
        h = h - 70;
        return {
          width: w,
          height: h
        };
      };

      FullPhotoDialog.prototype.updateSteppySize = function() {
        var wh;
        wh = this.calcSteppySize();
        this.$steppyRoot.css({
          width: wh.width,
          height: wh.height,
          top: (ns.winHeight() / 2) - (wh.height / 2)
        });
        this.$steppyRoot.find(".ui-fullphotodialog-galleryitem").css({
          width: wh.width
        });
        this.steppyInstance.updateOption({
          stepwidth: wh.width
        });
        return this;
      };

      FullPhotoDialog.prototype.updateCaption = function(index) {
        var text;
        text = this.$steppyRoot.find('.ui-fullphotodialog-galleryitem').eq(index).attr('data-fullphotodialog-caption');
        this.$caption.text(text);
        return this;
      };

      FullPhotoDialog.prototype.attachCurrentImgLink = function($a) {
        var item;
        item = this.itemsData[this.steppyInstance.currentIndex];
        $a.attr('href', item.src);
        return this;
      };

      FullPhotoDialog.prototype.initializeInside = function($dialogRoot) {
        var _this = this;
        $dialogRoot.on('click', '.ui-fullphotodialog-openblank', function(e) {
          var $a;
          $a = $(e.currentTarget);
          return _this.attachCurrentImgLink($a);
        });
        $dialogRoot.on('touchmove', function(e) {
          return e.preventDefault();
        });
        this.$steppyRoot = $dialogRoot.find('.ui-fullphotodialog-gallery');
        this.$caption = $dialogRoot.find('.ui-fullphotodialog-caption');
        this.$steppyRoot.css({
          left: 0,
          top: (window.innerHeight || $window.height()) / 2
        });
        this.$steppyRoot.touchdraghsteppy({
          inner: '.ui-fullphotodialog-gallery-inner',
          item: '.ui-fullphotodialog-galleryitem',
          stepwidth: 300,
          widthbetween: 20,
          maxindex: 8,
          triggerrefreshimmediately: false,
          alwayspreventtouchmove: true
        });
        this.steppyInstance = this.$steppyRoot.data('touchdraghsteppy');
        this.steppyInstance.on('refresh indexchange', function() {
          return _this.updateCaption(_this.steppyInstance.currentIndex);
        });
        this.updateSteppySize();
        this.$steppyRoot.css({
          visibility: 'visible'
        });
        this.handleImgs();
        return this;
      };

      FullPhotoDialog.prototype.open = function(itemsData) {
        var src,
          _this = this;
        this.itemsData = itemsData;
        src = this.createDialogSrc(itemsData);
        window.domwindowApi.open(src, {
          strdialog: true,
          width: ns.winWidth(),
          height: ns.winHeight(),
          afteropen: function(e, data) {
            return _this.initializeInside(data.dialog);
          },
          beforeclose: function() {
            var $steppyRoot, steppyInstance;
            $steppyRoot = null;
            return steppyInstance = null;
          }
        });
        return this;
      };

      FullPhotoDialog.prototype.createDialogSrc = function(itemsData) {
        var itemsSrc, wholeSrc;
        itemsSrc = '';
        $.each(itemsData, function(i, data) {
          return itemsSrc += ns.tmpl(ns.options.src_item, data);
        });
        wholeSrc = ns.tmpl(ns.options.src_dialog, {
          itemsSrc: itemsSrc
        });
        return wholeSrc;
      };

      return FullPhotoDialog;

    })();
    $.FullPhotoDialogNs = ns;
    return $.fullPhotoDialog = new $.FullPhotoDialogNs.FullPhotoDialog;
  })(jQuery, window, document);

}).call(this);
