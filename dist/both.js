/*
 *  both - v0.7.0
 *  detects in real time user interaction type (mouse, touch or keyboard) and switches linked events
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

  var pluginName = 'both';

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
      _this.keyboard = false;

      _this.handlersData = {
        mouse: [],
        touch: [],
        key: [],
      };

      _this.scroll = false;

      _this.inputs = [
        'input',
        'select',
        'textarea',
      ];
      _this.keys = {
        9: 'tab',
        13: 'enter',
        16: 'shift',
        27: 'esc',
        32: 'space',
        33: 'page up',
        34: 'page down',
        35: 'end',
        36: 'home',
        37: 'left arrow',
        38: 'up arrow',
        39: 'right arrow',
        40: 'down arrow',
      };

      _this.active = {
        type: '',
        input: '',
      };

      _this.all = {
        type: [],
        keys: [],
      };

      // map of IE 10 and Windows 8 pointer types (IE 11 and Windows 8.1 return a string)
      // https://msdn.microsoft.com/fr-fr/library/windows/apps/hh466130.aspx
      // https://msdn.microsoft.com/fr-fr/library/windows/apps/hh466130.aspx
      /*_this.pointerTypes = {
        2: 'touch',

        // treat pen like touch
        3: 'touch',
        4: 'mouse',
      };*/

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

        if (_this.active.type === 'mouse') return;

        //comment:mousemoveend:if (typeof _movewait != 'undefined') {
        //comment:mousemoveend:  clearTimeout(_movewait);
        //comment:mousemoveend:}

        //comment:mousemoveend:_movewait = setTimeout(function() {
        //comment:mousemoveend:if (_this._debug) console.log('>>> movewait');

        if (_this._debug) console.log('_touchstart', _touchstart);

        // prevent false positive on mousemove with touch devices
        if (_touchstart) {
          _touchstart = false;
          return;
        }

        // prevent false positive on mousemove when navigate with keyboard
        if (_this.scroll & _this.active.type === 'keyboard') {
          _this.scroll = false;
          return;
        }

        _this.set.call(_this, 'mouse', e);
        _this.handleInteractionTypeChange(e);

        //comment:mousemoveend:}, _this.settings.interval);
      });

      _this.document.on('touchstart' + '.' + _this._name, function(e) {
        if (_this._debug) console.log('>>> touchstart');
        _touchstart = true;

        if (_this.active.type === 'touch') return;

        _this.set('touch', e);
        _this.handleInteractionTypeChange(e);

      });

      // keyboard
      _this.document.on('keydown' + '.' + _this._name, function(e) {
        _this.check.call(_this, e);
      });

    },

    // Unbind events that trigger methods
    unbindEvents: function() {
      var _this = this;

      _this.document.off('mousemove' + '.' + _this._name);
      _this.document.off('touchstart' + '.' + _this._name);
    },

    check: function(event) {
      var _this = this;
      if (_this._debug) console.log('##################### check()', event);

      if (_this._debug) console.log('event.type:', event.type);

      console.log('key:', _this._key(event), _this.keys[_this._key(event)]);
      console.log('accessible key:', _this.keys.hasOwnProperty(_this._key(event)));

      if (

        // if the key is a accessible key
        _this.keys.hasOwnProperty(_this._key(event))

      ) {

        if (

        // if the key is `TAB`
        _this.keys[_this._key(event)] !== 'tab' &&

        // only if the target is one of the elements in `inputs` list
        _this.inputs.indexOf(_this._target(event).nodeName.toLowerCase()) >= 0

        ) {
          // ignore navigation keys typing on form elements
          console.log('| ignore navigation keys typing on form element');
          return;
        } else /*if (

          // if the key is `HOME`
          _this.keys[_this._key(event)] === 'home' ||

            // if the key is `END`
          _this.keys[_this._key(event)] === 'end' ||

            // if the key is `UP ARROW`
          _this.keys[_this._key(event)] === 'up arrow' ||

            // if the key is `DOWN ARROW`
          _this.keys[_this._key(event)] === 'down arrow' ||

            // if the key is `PAGE UP`
          _this.keys[_this._key(event)] === 'page up' ||

            // if the key is `PAGE DOWN`
          _this.keys[_this._key(event)] === 'page down'

        )*/ {
          console.log('| this pressed key causes an event mousemove');
          _this.scroll = true;
        }

        if (_this.active.type === 'keyboard') return;

        _this.set('keyboard', event);
        _this.handleInteractionTypeChange(event);
      }

    },

    set: function(type, event) {
      var _this = this;
      if (_this._debug) console.log('##################### set()', type);
      console.log(this);

      if (type == 'mouse') {
        _this.keyboard = false;
        _this.touch = false;
        _this.mouse = true;
        _this._array.remove(_this.types, 'keyboard');
        _this._array.remove(_this.types, 'touch');
        _this._array.add(_this.types, 'mouse');
      } else if (type == 'touch') {
        _this.keyboard = false;
        _this.touch = true;
        _this.mouse = false;
        _this._array.remove(_this.types, 'keyboard');
        _this._array.remove(_this.types, 'mouse');
        _this._array.add(_this.types, 'touch');
      } else if (type == 'keyboard') {
        if (_this.active.type === 'keyboard') return;
        _this.mouse = false;
        _this.touch = false;
        _this.keyboard = true;
        _this._array.remove(_this.types, 'mouse');
        _this._array.remove(_this.types, 'touch');
        _this._array.add(_this.types, 'keyboard');
      }

      _this.active.type = type;

      if (_this._debug) console.log('types:', _this.types);
      if (_this._debug) console.log('inputs:', _this.active.input);
      if (_this._debug) console.log('keys:', _this.active.key);

      if (_this.settings.class) {
        if (_this.settings.name) {
          if (_this.$html.attr('class') !== undefined) {
            var classes = _this.$html.attr('class').split(' ').filter(function(c) {
              return c.lastIndexOf(_this.settings.name, 0) !== 0;
            });

            _this.$html.attr('class', $.trim(classes.join(' ')));
          }

          _this.$html.addClass(_this.settings.name + '-' + _this.active.type);
        } else {
          $('html').removeClass('mouse touch keyboard');
          _this.$html.addClass(_this.active.type);
        }
      } else {
        if (_this.settings.name) {
          _this.$html.attr('data-' + _this.settings.name, _this.active.type);
        } else {
          _this.$html.attr('data-' + _this.defaults.name, _this.active.type);
        }
      }
    },

    _key: function(event) {
      return (event.keyCode) ? event.keyCode : event.which;
    },

    _target: function(event) {
      return event.target || event.srcElement;
    },

    /*pointer: function(event) {
      return (typeof event.pointerType === 'number') ? pointerTypes[event.pointerType] : event.pointerType;
    },*/

    // keyboard logging
    _log: {
      keys: function(eventKey) {
        if (this.active.keys.indexOf(this.keys[eventKey]) === -1 && this.keys[eventKey]) this.active.keys.push(this.keys[eventKey]);
      },
    },

    _unlog: {
      keys: function(event) {
        var eventKey = key(event);
        var arrayPos = this.active.keys.indexOf(this.keys[eventKey]);

        if (arrayPos !== -1) this.active.keys.splice(arrayPos, 1);
      },
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

      _this._array.add(_this.handlersData[context], {
          selector: selector,
          event: event,
          handler: handler,
        });
      /*_this.handlersData[context].push({
        selector: selector,
        event: event,
        handler: handler,
      });*/

      if (_this._debug) console.log('handlersData', _this.handlersData);

      // Wait last call to start plugin:
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

    lose: function(context, selector, event) {
      var _this = this;
      if (_this._debug) console.log('##################### lose()');

      if (_this._debug) console.log('- context', context);
      if (_this._debug) console.log('- selector', selector.selector);
      if (_this._debug) console.log('- event', event);
      for (var i = 0; i < _this.handlersData[context].length; i++) {
        if (_this.handlersData[context][i].selector.selector === selector.selector && _this.handlersData[context][i].event === event) {
          _this.handlersData[context][i].selector.off(_this.handlersData[context][i].event, _this.handlersData[context][i].handler);
          _this._array.remove(_this.handlersData[context], _this.handlersData[context][i]);
          i--;
        }
      }

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
        };
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
      var _this = this;
      if (this._debug) console.log('##################### refresh()');

    },

    /**
     * @return {string} current input type
     */
    getType: function() {
      console.log(this);
      return this.active.type;
    },

    /**
     * @return {array} currently pressed keys
     */
    getKey: function() {
      return this.active.input;
    },

    /**
     * @return {array} all the detected input types
     */
    getTypes: function() {
      return this.types;
    },

  });

  window[ pluginName ] = function(options) {
    if (!$.data(window, pluginName)) {
      $.data(window, pluginName, new Plugin(options));
    }
  };

  window[ pluginName ].defaults = {

    // desktop, tablet, mobile
    device: '',

    // data attribute name (or class name prefix)
    name: 'interaction',

    // data attribute (false) or class (true)
    class: false,

    // set name at null or '' and class at true to override Modernizr's classes (Modernizr has a useless 'touch' class positive for touch screens)

    // debug mode
    debug: false,
    
  };

})(jQuery, window, document);
