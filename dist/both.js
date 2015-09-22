/*
 *  both - v0.4.0
 *  detects in real time user interaction type (Mouse or Touch) and switches linked events
 *  https://github.com/idomusha/both
 *
 *  Made by idomusha
 *  Under MIT License
 */
/**
 * both
 * detects in real time user interaction type (Mouse or Touch) and switches linked events
 * @author idomusha / https://github.com/idomusha
 */

;

(function($, window, document, undefined) {
  'use strict';

  var pluginName = 'Both';

  function Plugin(options) {

    this._name = pluginName;

    this._defaults = window[ pluginName ].defaults;
    this.settings = $.extend({}, this._defaults, options);

    this._debug = this.settings.debug;
    if (this._debug) console.log('defaults', this._defaults);
    if (this._debug) console.log('settings', this.settings);

    this.init();
  }

  $.extend(Plugin.prototype, {

    init: function() {
      var _this = this;
      if (_this._debug) console.log('##################### init()');

      _this.buildCache();

      // mouse, touch (touch and pen), key
      _this.types = [];
      _this.touch = false;
      _this.mouse = false;
      _this.key = false;
      _this.handlersData = {
        mouse: [],
        touch: [],
        key: [],
      };

      if (_this._debug) console.log('device:', _this.settings.device);
      if (_this.settings.device == 'mobile' || _this.settings.device == 'tablet') {
        _this.set('touch', true);
      } else {
        _this.set('mouse', true);
      }

      _this.bindEvents();
    },

    // Remove plugin instance completely
    destroy: function() {
      var _this = this;

      _this.unbindEvents();
      _this.window.removeData();
    },

    // Cache DOM nodes for performance
    buildCache: function() {

      this.document = $(document);
      this.$html = $('html');
    },

    // Bind events that trigger methods
    bindEvents: function() {
      var _this = this;
      if (_this._debug) console.log('##################### bindUIActions()');

      //comment:mousemoveend:var _movewait;

      // boolean to not fire mousemove event after touchstart event
      var _touchstart;

      _this.document.on('mousemove' + '.' + _this._name, function(e) {
        if (_this._debug) console.log('>>> mousemove');

        if (_this.types.indexOf('mouse') > -1) return;

        //comment:mousemoveend:if (typeof _movewait != 'undefined') {
        //comment:mousemoveend:  clearTimeout(_movewait);
        //comment:mousemoveend:}

        //comment:mousemoveend:_movewait = setTimeout(function() {
        //comment:mousemoveend:if (_this._debug) console.log('>>> movewait');

        if (_this._debug) console.log('_touchstart', _touchstart);
        if (_touchstart) {
          _touchstart = false;
          return;
        }

        _this.set('mouse', e);
        _this.handleInteractionTypeChange(e);

        //comment:mousemoveend:}, _this.settings.interval);
      });

      _this.document.on('touchstart' + '.' + _this._name, function(e) {
        if (_this._debug) console.log('>>> touchstart');
        _touchstart = true;

        if (_this.types.indexOf('touch') > -1) return;

        _this.set('touch', e);
        _this.handleInteractionTypeChange(e);

      });

    },

    // Unbind events that trigger methods
    unbindEvents: function() {
      var _this = this;

      _this.document.off('mousemove' + '.' + _this._name);
      _this.document.off('touchstart' + '.' + _this._name);
    },

    set: function(type) {
      var _this = this;
      if (_this._debug) console.log('##################### set()', type);

      if (type == 'mouse') {
        _this.$html.removeClass('touch').addClass('mouse');
        _this.touch = false;
        _this.mouse = true;
        _this._array.add(_this.types, 'mouse');
        _this._array.remove(_this.types, 'touch');
      } else if (type == 'touch') {
        _this.$html.removeClass('mouse').addClass('touch');
        _this.touch = true;
        _this.mouse = false;
        _this._array.add(_this.types, 'touch');
        _this._array.remove(_this.types, 'mouse');
      }
    },

    start: function() {
      this.handleInteractionTypeChange(true);
    },

    handleInteractionTypeChange: function(e) {
      var _this = this;
      var _text = typeof (e) == 'boolean' && e ? 'is setted' : 'has changed';
      if (_this._debug) console.log('---------------------------------------------------');
      if (_this._debug) console.log('Interaction type ' + _text + ': ' + _this.types.toString());
      if (_this._debug) console.log('---------------------------------------------------');
      _this.switch();
    },

    store: function(context, selector, event, handler) {
      var _this = this;
      if (_this._debug) console.log('##################### store()');

      if (_this._debug) console.log('- context', context);
      if (_this._debug) console.log('- selector', selector);
      if (_this._debug) console.log('- event', event);
      if (_this._debug) console.log('- handler', handler);

      _this.handlersData[context].push({
        selector: selector,
        event: event,
        handler: handler,
      });

      if (_this._debug) console.log('handlersData', _this.handlersData);

      // Clear prev counter, if exist.
      if (_this.interval != null) {
        clearInterval(this.interval);
      }

      // init timer
      _this.timer = 0;
      _this.interval = setInterval(function() {
        if (_this.timer == 1) {
          _this.start.call(_this);
          clearInterval(_this.interval);
          _this.interval = null;
        }

        _this.timer++;
      }.bind(_this), 100);

      // Important to .bind(this) so that context will remain consistent.

    },

    switch: function() {
      var _this = this;
      if (_this._debug) console.log('##################### switch()');
      var _oType = {
        on: _this.types.indexOf('mouse') > -1 ? 'mouse' : 'touch',
        off: _this.types.indexOf('mouse') > -1 ? 'touch' : 'mouse',
      };
      if (_this._debug) console.log(_this.types);
      _this.on(_oType.on);
      _this.off(_oType.off);
    },

    on: function(type) {
      var _this = this;
      if (_this._debug) console.log('##################### on()');
      for (var i = 0; i < _this.handlersData[type].length; i++) {
        var _handlerData = {
          selector: _this.handlersData[type][i]['selector'],
          event: _this.handlersData[type][i]['event'],
          handler: _this.handlersData[type][i]['handler'],
        }
        _handlerData.selector.on(_handlerData.event, _handlerData.handler);
      }
    },

    off: function(type) {
      var _this = this;
      if (_this._debug) console.log('##################### off()');
      for (var i = 0; i < _this.handlersData[type].length; i++) {
        var _handlerData = {
          selector: _this.handlersData[type][i]['selector'],
          event: _this.handlersData[type][i]['event'],
          handler: _this.handlersData[type][i]['handler'],
        };
        _handlerData.selector.off(_handlerData.event, _handlerData.handler);
      }
    },

    _array: {

      add: function(array, item) {
        if (this._debug) console.log('##################### array.add()');
        array.push(item);
      },

      remove: function(array, item) {
        if (this._debug) console.log('##################### array.remove()');
        var index = array.indexOf(item);
        if (index > -1) array.splice(index, 1);
      },

    },

    /*_object: {

      add: function(obj, key, item) {
        if (this._debug) console.log('##################### object.add()');
        if (this.collection[key] != undefined)
          return undefined;
        this.collection[key] = item;
        return ++this.count;
      },

      remove: function(obj, key) {
        if (this._debug) console.log('##################### object.remove()');
        if (this.collection[key] == undefined)
          return undefined;
        delete this.collection[key];
        return --this.count;
      },

      iterate: function(obj) {
        for (var property in obj) {
          if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == 'object') {
              this._object.iterate(obj[property]);
            } else {
              console.log(property + '   ' + obj[property]);
            }
          }
        }
      },

      get: function(obj, prop) {
        if (this._debug) log('##################### object.get()');
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            return obj[prop];
          }
        }
      },

    },*/

    refresh: function() {
      if (this._debug) log('##################### refresh()');

    },

  });

  /*window[ pluginName ] = function(options) {
    var args = arguments;

    if (options === undefined || typeof options === 'object') {
      if (!$.data(window, pluginName)) {
        $.data(window, pluginName, new Plugin(options));
      }

    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

      var returns;

      this.each(function() {
        var instance = $.data(this, pluginName);

        if (instance instanceof Plugin && typeof instance[options] === 'function') {

          returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
        }

        if (options === 'destroy') {
          $.data(this, pluginName, null);
        }
      });

      return returns !== undefined ? returns : this;
    }
  };*/

  window[ pluginName ] = function(options) {
    if (!$.data(window, pluginName)) {
      $.data(window, pluginName, new Plugin(options));
    }
  };

  window[ pluginName ].defaults = {

    // desktop, tablet, mobile
    device: '',

    interval: 200,
    debug: true,
  };

})(jQuery, window, document);
