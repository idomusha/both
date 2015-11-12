#both

## detects in real time user interaction type (mouse, touch or keyboard) and switches linked events
Because [the user may have touch AND a mouse](http://www.html5rocks.com/en/mobile/touchandmouse/).

## Demo

[See both in action](http://idomusha.github.io/both/)

## Usage

1. Include jQuery:

	```html
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	```

2. Include plugin's code:

	```html
	<script src="dist/both.min.js"></script>
	```

3. Call the plugin:

	```javascript
	both();
	```

4. Add your mouse and touch events

#### That...
```js
// mouse
$('.button-blue').on('mouseenter', function() {
   alert("Mickey");
});

// touch
$('.button-blue').on('touchend', function() {
   alert("Tacchi");
});
```

#### ... becomes this!
```js
    $(window).data('both').store('mouse', $('.button-blue'), 'mouseenter', function (e) {
        alert("Mickey");
    });
    $(window).data('both').store('touch', $('.button-blue'), 'touchend', function (e) {
        alert("Tacchi");
    });
```

#### After that, all event handlers are added/removed according to the interaction type detected. :)

## You can also grab both using bower:
```
    bower install both --save
```

#### Authors

[![idomusha](https://fr.gravatar.com/userimage/43584317/49cfb592a2054e9c39c5dc195e5ea419.png?size=70)](https://github.com/idomusha) |
--- |
[idomusha](https://github.com/idomusha) |

## License

MIT: [http://idomusha.mit-license.org/](http://idomusha.mit-license.org/)
