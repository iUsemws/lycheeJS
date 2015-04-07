
lychee.define('lychee.effect.Alpha').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _is_alpha = function(alpha) {

		if (typeof alpha === 'number') {
			return alpha >= 0 && alpha <= 1;
		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.type     = Class.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.alpha    = 1;

		this.__origin = null;
		this.__start  = null;


		// No data validation garbage allowed for effects

		var type     = lychee.enumof(Class.TYPE, settings.type) ? settings.type           : null;
		var delay    = typeof settings.delay === 'number'       ? (settings.delay | 0)    : null;
		var duration = typeof settings.duration === 'number'    ? (settings.duration | 0) : null;
		var alpha    = _is_alpha(settings.alpha)                ? settings.alpha          : null;

		if (type !== null) {
			this.type = type;
		}

		if (delay !== null) {
			this.delay = delay;
		}

		if (duration !== null) {
			this.duration = duration;
		}

		if (alpha !== null) {
			this.alpha = alpha;
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
			if (this.alpha !== 1)                 settings.alpha    = this.alpha;


			return {
				'constructor': 'lychee.effect.Alpha',
				'arguments':   [ settings ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

		},

		update: function(entity, clock, delta) {

			if (this.__start === null) {

				this.__start  = clock + this.delay;
				this.__origin = entity.alpha || 1;

			}


			var t = (clock - this.__start) / this.duration;
			if (t < 0) {
				return true;
			}


			var origin = this.__origin;
			var alpha  = this.alpha;

			var a      = origin;

			if (t <= 1) {

				var f  = 0;
				var da = alpha - origin;


				var type = this.type;
				if (type === Class.TYPE.linear) {

					a += t * da;

				} else if (type === Class.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					a += f * da;

				} else if (type === Class.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					a += f * da;

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

					a += (1 - f) * da;

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

					a += f * da;

				}


				entity.alpha = a;


				return true;

			} else {

				entity.alpha = alpha;


				return false;

			}

		}

	};


	return Class;

});

