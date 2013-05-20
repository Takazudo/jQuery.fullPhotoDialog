/*! jQuery.fullPhotoDialog (https://github.com/Takazudo/jQuery.fullPhotoDialog)
 * lastupdate: 2013-05-21
 * version: 0.0.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  var __slice = [].slice;

  (function($, window, document) {
    var $window, ns;
    $window = $(window);
    ns = {};
    ns.options = {};
    ns.options.spinner = {
      color: '#fff',
      width: 2,
      lines: 15,
      length: 12,
      radius: 20
    };
    ns.options.src_dialog = "<div class=\"ui-fullphotodialog\">\n  <p class=\"ui-fullphotodialog-close\"><a class=\"apply-domwindow-close\" href=\"#\">×</a></p>\n  <div class=\"ui-fullphotodialog-gallery\">\n    <div class=\"ui-fullphotodialog-gallery-inner\">\n      ___xxx___ITEMSSRC___xxx___\n    </div>\n  </div>\n  <div class=\"ui-fullphotodialog-caption\"></div>\n</div>";
    ns.options.src_item = "<div\n  data-fullphotodialog-caption=\"___xxx___CAPTION___xxx___\"\n  data-fullphotodialog-src=\"___xxx___SRC___xxx___\"\n  class=\"ui-fullphotodialog-galleryitem\"\n></div>";
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
    ns.putOrAdjustImgInside = function($el, containerWidth, containerHeight) {
      var containerWH, imgLoaded, src;
      src = $el.attr('data-fullphotodialog-src');
      imgLoaded = $el.data('imgloaded') === true;
      containerWH = {
        width: containerWidth,
        height: containerHeight
      };
      if (!imgLoaded) {
        $el.empty();
        (new Spinner(ns.options.spinner)).spin($el[0]);
      }
      return $.imgUtil.calcRectFitImgWH(src, containerWH).done(function(res) {
        var $img, mt;
        $el.data('imgloaded', true);
        $img = res.img;
        setTimeout(function() {
          return $el.empty().append($img);
        }, 10);
        mt = void 0;
        if (res.height < containerHeight) {
          mt = Math.floor((containerHeight / 2) - (res.height / 2));
        } else {
          mt = 0;
        }
        return $img.css({
          width: res.width,
          height: res.height,
          marginTop: mt
        });
      });
    };
    ns.Event = (function() {

      function Event() {}

      Event.prototype.on = function(ev, callback) {
        var evs, name, _base, _i, _len;
        if (this._callbacks == null) {
          this._callbacks = {};
        }
        evs = ev.split(' ');
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
          name = evs[_i];
          (_base = this._callbacks)[name] || (_base[name] = []);
          this._callbacks[name].push(callback);
        }
        return this;
      };

      Event.prototype.once = function(ev, callback) {
        this.on(ev, function() {
          this.off(ev, arguments.callee);
          return callback.apply(this, arguments);
        });
        return this;
      };

      Event.prototype.trigger = function() {
        var args, callback, ev, list, _i, _len, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        ev = args.shift();
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return;
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          callback = list[_i];
          if (callback.apply(this, args) === false) {
            break;
          }
        }
        return this;
      };

      Event.prototype.off = function(ev, callback) {
        var cb, i, list, _i, _len, _ref;
        if (!ev) {
          this._callbacks = {};
          return this;
        }
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return this;
        }
        if (!callback) {
          delete this._callbacks[ev];
          return this;
        }
        for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
          cb = list[i];
          if (!(cb === callback)) {
            continue;
          }
          list = list.slice();
          list.splice(i, 1);
          this._callbacks[ev] = list;
          break;
        }
        return this;
      };

      return Event;

    })();
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
        var _this = this;
        $window.bind("resize orientationchange", function() {
          if (!_this.$dialog.is(":visible")) {
            return;
          }
          _this.fitDialog();
          _this.updateSteppySize();
          return _this.handleImgs();
        });
        return this;
      };

      FullPhotoDialog.prototype.handleImgs = function() {
        var $items, wh;
        $items = this.$steppyRoot.find(".ui-fullphotodialog-galleryitem");
        wh = this.calcSteppySize();
        $items.each(function(i, el) {
          return ns.putOrAdjustImgInside($(el), wh.width, wh.height);
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

      FullPhotoDialog.prototype.initializeInside = function($dialogRoot) {
        var _this = this;
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
