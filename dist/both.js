/*
 *  both - v0.2.0
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

(function (window, $) {
  var s,
    Both = {

      defaults: {
        types: [],    // mouse, touch (touch and pen), key
        device: '',   // desktop, tablet, mobile

        touch: false,
        mouse: false,
        key: false,
        oHandlersData: [],
        jHandlersData: {},
        iViewportWidth: 1024,
        iInterval: 200,
        debug: false
      },

      options: {},

      settings: {},

      init: function () {
        // merge defaults and options, without modifying defaults explicitly
        this.settings = $.extend({}, this.defaults, this.options);
        s = this.settings;

        if (s.debug) log("##################### init()");

        if (s.device == 'mobile' || s.device == "tablet") {
          this.set('touch', true);
        }
        else {
          this.set('mouse', true);
        }

        s.oHandlersData = {
          mouse: [],
          touch: [],
          key: []
        };

        this.bindUIActions();
      },

      bindUIActions: function () {
        if (s.debug) log("##################### bindUIActions()");

        var _movewait;
        var _return;    // boolean to not fire mousemove event after touchstart event
        $(document).on('mousemove', function (e) {
          if (_return) {
            _return = false;
            return;
          }
          if (s.types.indexOf('mouse') > -1) return;
          if (s.debug) log('>>> mousemove');
          if (typeof _movewait != 'undefined') {
            clearTimeout(_movewait);
          }
          _movewait = setTimeout(function () {

            if (s.debug) log('>>> movewait');
            Both.set('mouse', e);
            Both.handleInteractionTypeChange(e);
          }, s.iInterval);
        });

        $(document).on('touchstart', function (e) {
          if (s.types.indexOf('touch') > -1) return;
          if (s.debug) log('>>> touchstart');
          Both.set('touch', e);
          Both.handleInteractionTypeChange(e);
          _return = true;
        });

        /*$(document).on('click', function (e) {
          if (s.debug) log('>>> click');
          _return = false;
        });*/

      },

      define: function (o) {
        if (s.debug) {
          log("##################### define()");
        }

        var $returnObject = null;
        // Undefined item
        if (typeof o === 'undefined') {
          return;
        }

        // Object item
        else if ((typeof o === 'object') && (o !== null)) {
          $returnObject = o;
        }

        // Id or class item
        else if ((typeof o === 'string') /*&& ((o.charAt(0) == '#') || (o.charAt(0) == '.'))*/) {
          $returnObject = $(o);
        }

        return $returnObject;
      },

      set: function (type) {
        if (type == 'mouse') {
          $('html').removeClass('touch').addClass('mouse');
          s.touch = false;
          s.mouse = true;
          Both.array.add(s.types, "mouse");
          Both.array.remove(s.types, "touch");
        }
        else if (type == 'touch') {
          $('html').removeClass('mouse').addClass('touch');
          s.touch = true;
          s.mouse = false;
          Both.array.add(s.types, "touch");
          Both.array.remove(s.types, "mouse");
        }
      },

      start: function () {
        Both.handleInteractionTypeChange(true);
      },

      handleInteractionTypeChange: function (e) {
        var _text = typeof(e) == "boolean" && e ? 'is setted' : 'has changed'
        if (s.debug) log('---------------------------------------------------');
        if (s.debug) log('Interaction type ' + _text + ': ' + s.types.toString());
        if (s.debug) log('---------------------------------------------------');
        Both.switch();
      },

      store: function (context, selector, event, handler) {
        if (s.debug) log("##################### store()");

        if (s.debug) log("- context", context);
        if (s.debug) log("- selector", selector);
        if (s.debug) log("- event", event);
        if (s.debug) log("- handler", handler);

        s.oHandlersData[context].push({
          selector: selector,
          event: event,
          handler: handler
        });

        if (s.debug) log("s.oHandlersData", s.oHandlersData);

      },

      switch: function () {
        if (s.debug) log("##################### switch()");
        var _oType = {
          on: s.types.indexOf('mouse') > -1 ? 'mouse' : 'touch',
          off: s.types.indexOf('mouse') > -1 ? 'touch' : 'mouse'
        };
        _type = 'mouse' in s.types ? 'mouse' : 'touch';
        if (s.debug) log(s.types);
        Both.on(_oType.on);
        Both.off(_oType.off);
      },

      on: function (type) {
        if (s.debug) log("##################### on()");
        for (var i = 0; i < s.oHandlersData[type].length; i++) {
          var _oHandlerData = {
            selector: s.oHandlersData[type][i]['selector'],
            event: s.oHandlersData[type][i]['event'],
            handler: s.oHandlersData[type][i]['handler']
          }
          _oHandlerData.selector.on(_oHandlerData.event, _oHandlerData.handler);
        }
      },

      off: function (type) {
        if (s.debug) log("##################### off()");
        for (var i = 0; i < s.oHandlersData[type].length; i++) {
          var _oHandlerData = {
            selector: s.oHandlersData[type][i]['selector'],
            event: s.oHandlersData[type][i]['event'],
            handler: s.oHandlersData[type][i]['handler']
          }
          _oHandlerData.selector.off(_oHandlerData.event, _oHandlerData.handler);
        }
      },

      array: {

        add: function (array, item) {
          if (s.debug) log("##################### array.add()");
          array.push(item);
        },

        remove: function (array, item) {
          if (s.debug) log("##################### array.remove()");
          var index = array.indexOf(item);
          if (index > -1) array.splice(index, 1);
        }

      },

      object: {

        add: function (obj, key, item) {
          if (s.debug) log("##################### object.add()");
          if (this.collection[key] != undefined)
            return undefined;
          this.collection[key] = item;
          return ++this.count
        },

        remove: function (obj, key) {
          if (s.debug) log("##################### object.remove()");
          if (this.collection[key] == undefined)
            return undefined;
          delete this.collection[key]
          return --this.count
        },

        iterate: function (obj) {
          for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
              if (typeof obj[property] == "object") {
                Both.iterate(obj[property]);
              }
              else {
                console.log(property + "   " + obj[property]);
              }
            }
          }
        },

        get: function (obj, prop) {
          if (s.debug) log("##################### object.get()");
          for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              return obj[prop];
            }
          }
        }

      },

      destroy: function () {
        if (s.debug) log("##################### destroy()");
        $.removeData(Both.get(0));
      },

      refresh: function () {
        if (s.debug) log("##################### refresh()");
        Both.destroy();
        Both.init();
      }
    }
  window.Both = Both;
})
(window, jQuery);