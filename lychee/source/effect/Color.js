
lychee.define('lychee.effect.Color').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _is_color = function(color) {

		if (typeof color === 'string') {

			if (color.match(/(#[AaBbCcDdEeFf0-9]{6})/) || color.match(/(#[AaBbCcDdEeFf0-9]{8})/)) {
				return true;
			}

		}


		return false;

	};

	var _rgba_to_color = function(r, g, b) {

		var strr = r > 15 ? (r).toString(16) : '0' + (r).toString(16);
		var strg = g > 15 ? (g).toString(16) : '0' + (g).toString(16);
		var strb = b > 15 ? (b).toString(16) : '0' + (b).toString(16);

		return '#' + strr + strg + strb;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.type     = Class.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.color    = '#000000';

		this.__origin = null;
		this.__start  = null;


		// No data validation garbage allowed for effects

		var type     = lychee.enumof(Class.TYPE, settings.type) ? settings.type           : null;
		var delay    = typeof settings.delay === 'number'       ? (settings.delay | 0)    : null;
		var duration = typeof settings.duration === 'number'    ? (settings.duration | 0) : null;
		var color    = _is_color(settings.color)                ? settings.color          : null;

		if (type !== null) {
			this.type = type;
		}

		if (delay !== null) {
			this.delay = delay;
		}

		if (duration !== null) {
			this.duration = duration;
		}

		if (color !== null) {
			this.color = color;
		}

	};


	Class.TYPE = {
		linear:        0,
		easein:        1,
		easeout:       2,
		bounceeasein:  3,
		bounceeaseout: 4
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.type !== Class.TYPE.easeout) settings.type     = this.type;
			if (this.delay !== 0)                 settings.delay    = this.delay;
			if (this.duration !== 250)            settings.duration = this.duration;
			if (this.color !== '#000000')         settings.color    = this.color;


			return {
				'constructor': 'lychee.effect.Color',
				'arguments':   [ settings ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

		},

		update: function(entity, clock, delta) {

			if (this.__start === null) {

				this.__start  = clock + this.delay;
				this.__origin = entity.color || '#000000';

			}


			var origin  = this.__origin;
			var color   = this.color;

			var originr = parseInt(origin.substr(1, 2), 16) || 0;
			var origing = parseInt(origin.substr(3, 2), 16) || 0;
			var originb = parseInt(origin.substr(5, 2), 16) || 0;

			var colorr  = parseInt(color.substr(1, 2), 16) || 0;
			var colorg  = parseInt(color.substr(3, 2), 16) || 0;
			var colorb  = parseInt(color.substr(5, 2), 16) || 0;

			var r       = originr;
			var g       = origing;
			var b       = originb;


			var t = (clock - this.__start) / this.duration;
			if (t < 0) {
				return true;
			}

			if (t <= 1) {

				var f  = 0;
				var dr = colorr - originr;
				var dg = colorg - origing;
				var db = colorb - originb;


				var type = this.type;
				if (type === Class.TYPE.linear) {

					r += t * dr;
					g += t * dg;
					b += t * db;

				} else if (type === Class.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					r += f * dr;
					g += f * dg;
					b += f * db;

				} else if (type === Class.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					r += f * dr;
					g += f * dg;
					b += f * db;

				} else if (type === Class.TYPE.bounceeasein) {

					var k = 1 - t;

					if ((k /= 1) < ( 1 / 2.75 )) {
						f = 1 * ( 7.5625 * Math.pow(k, 2) );
					} else if (k < ( 2 / 2.75 )) {
						f = 7.5625 * ( k -= ( 1.5   / 2.75 )) * k + 0.75;
					} else if (k < ( 2.5 / 2.75 )) {
						f = 7.5625 * ( k -= ( 2.25  / 2.75 )) * k + 0.9375;
					} else {
						f = 7.5625 * ( k -= ( 2.625 / 2.75 )) * k + 0.984375;
					}

					r += (1 - f) * dr;
					g += (1 - f) * dg;
					b += (1 - f) * db;

				} else if (type === Class.TYPE.bounceeaseout) {

					if ((t /= 1) < ( 1 / 2.75 )) {
						f = 1 * ( 7.5625 * Math.pow(t, 2) );
					} else if (t < ( 2 / 2.75 )) {
						f = 7.5625 * ( t -= ( 1.5   / 2.75 )) * t + 0.75;
					} else if (t < ( 2.5 / 2.75 )) {
						f = 7.5625 * ( t -= ( 2.25  / 2.75 )) * t + 0.9375;
					} else {
						f = 7.5625 * ( t -= ( 2.625 / 2.75 )) * t + 0.984375;
					}

					r += f * dr;
					g += f * dg;
					b += f * db;

				}


				entity.color = _rgba_to_color(r | 0, g | 0, b | 0);


				return true;

			} else {

				entity.color = _rgba_to_color(colorr | 0, colorg | 0, colorb | 0);


				return false;

			}

		}

	};


	return Class;

});

