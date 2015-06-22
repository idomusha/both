#both

## detects in real time user interaction type (Mouse or Touch) and switches linked events
Because [the user may have touch AND a mouse](http://www.html5rocks.com/en/mobile/touchandmouse/).

* **Authors**: idomusha

## Usage

### Add both.min.js before your closing <body> tag, after jQuery (requires jQuery 1.7 +)
    <script type="text/javascript" src="//code.jquery.com/jquery-1.11.0.min.js"></script>
    <script type="text/javascript" src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
    <script type="text/javascript" src="both/both.min.js"></script>

### Define mobile device on load (if you know) [OPTIONAL]
On load the default behavior is to load mouse events.
If you use a detecting mobile devices solution (like Mobile Detect or Device.js), you can define the device variable to get touch events as soon as the page is loaded.
```js
    if (device.tablet()) {
        Both.options = {
            device: 'tablet'
        };
    }
    else if (device.mobile()) {
        Both.options = {
            device: 'mobile'
        };
    }
```

### Initialize Both
```js
    Both.init();
```

### Add your mouse and touch events

#### That...
```js
// mouse
$('.your-class').on('mouseenter', function() {
   alert("Mickey");
});

// touch
$('.your-class').on('touchend', function() {
   alert("Tacchi");
});
```

#### ... becomes this!
```js
    Both.store('mouse', $('.your-class'), 'mouseenter', function (e) {
        alert("Mickey");
    }
    Both.store('touch', $('.your-class'), 'touchend', function (e) {
        alert("Tacchi");
    }
```

### Get your events according to interaction type detected or defined on load
```js
    Both.start();
```

#### After that, all event handlers are added/removed according to the interaction type detected. :)

## You can also grab Both using bower:
```
    bower install both --save
```