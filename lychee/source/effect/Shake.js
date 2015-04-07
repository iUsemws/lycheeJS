
lychee.define('lychee.effect.Shake').exports(function(lychee, global, attachments) {

	var Class = function(settings) {

		this.type     = Class.TYPE.easeout;
		this.delay    = 0;
		this.duration = 250;
		this.shake    = { x: null, y: null, z: null };

		this.__origin = { x: null, y: null, z: null };
		this.__start  = null;


		// No data validation garbage allowed for effects

		var type     = lychee.enumof(Class.TYPE, settings.type) ? settings.type           : null;
		var delay    = typeof settings.delay === 'number'       ? (settings.delay | 0)    : null;
		var duration = typeof settings.duration === 'number'    ? (settings.duration | 0) : null;
		var shake    = settings.shake instanceof Object         ? settings.shake          : null;

		if (type !== null) {
			this.type = type;
		}

		if (delay !== null) {
			this.delay = delay;
		}

		if (duration !== null) {
			this.duration = duration;
		}

		if (shake !== null) {
			this.shake.x = typeof shake.x === 'number' ? (shake.x | 0) : null;
			this.shake.y = typeof shake.y === 'number' ? (shake.y | 0) : null;
			this.shake.z = typeof shake.z === 'number' ? (shake.z | 0) : null;
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


			if (this.shake.x !== null || this.shake.y !== null || this.shake.z !== null) {

				settings.shake = {};

				if (this.shake.x !== null) settings.shake.x = this.shake.x;
				if (this.shake.y !== null) settings.shake.y = this.shake.y;
				if (this.shake.z !== null) settings.shake.z = this.shake.z;

			}


			return {
				'constructor': 'lychee.effect.Shake',
				'arguments':   [ settings ]
			};

		},

		render: function(renderer, offsetX, offsetY) {

		},

		update: function(entity, clock, delta) {

			if (this.__start === null) {

				this.__start    = clock + this.delay;
				this.__origin.x = entity.position.x;
				this.__origin.y = entity.position.y;
				this.__origin.z = entity.position.z;

			}


			var t = (clock - this.__start) / this.duration;
			if (t < 0) {
				return true;
			}


			var origin   = this.__origin;
			var originx  = origin.x;
			var originy  = origin.y;
			var originz  = origin.z;

			var shake    = this.shake;
			var shakex   = shake.x;
			var shakey   = shake.y;
			var shakez   = shake.z;

			var x        = originx;
			var y        = originy;
			var z        = originz;

			if (t <= 1) {

				var f   = 0;
				var pi2 = Math.PI * 2;
				var dx  = shakex;
				var dy  = shakey;
				var dz  = shakez;


				var type = this.type;
				if (type === Class.TYPE.linear) {

					x += Math.sin(t * pi2) * dx;
					y += Math.sin(t * pi2) * dy;
					z += Math.sin(t * pi2) * dz;

				} else if (type === Class.TYPE.easein) {

					f = 1 * Math.pow(t, 3);

					x += Math.sin(f * pi2) * dx;
					y += Math.sin(f * pi2) * dy;
					z += Math.sin(f * pi2) * dz;

				} else if (type === Class.TYPE.easeout) {

					f = Math.pow(t - 1, 3) + 1;

					x += Math.sin(f * pi2) * dx;
					y += Math.sin(f * pi2) * dy;
					z += Math.sin(f * pi2) * dz;

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

					x += Math.sin((1 - f) * pi2) * dx;
					y += Math.sin((1 - f) * pi2) * dy;
					z += Math.sin((1 - f) * pi2) * dz;

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

					x += Math.sin(f * pi2) * dx;
					y += Math.sin(f * pi2) * dy;
					z += Math.sin(f * pi2) * dz;

				}


				if (shakex !== null) entity.position.x = x;
				if (shakey !== null) entity.position.y = y;
				if (shakez !== null) entity.position.z = z;


				return true;

			} else {

				if (shakex !== null) entity.position.x = originx;
				if (shakey !== null) entity.position.y = originy;
				if (shakez !== null) entity.position.z = originz;


				return false;

			}

		}

	};


	return Class;

});

