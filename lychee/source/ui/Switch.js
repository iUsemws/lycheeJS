
lychee.define('lychee.ui.Switch').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font    = null;
		this.options = [ 'on', 'off' ];
		this.type    = Class.TYPE.horizontal;
		this.value   = 'off';

		this.__pulse = {
			active:   false,
			duration: 250,
			start:    null,
			alpha:    0.0
		};


		this.setFont(settings.font);
		this.setOptions(settings.options);
		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.options;
		delete settings.type;
		delete settings.value;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 128;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {

			if (this.options.length === 0) return;


			var index = -1;
			var size  = 0;
			var pos   = 0;


			var type = this.type;
			if (type === Class.TYPE.horizontal) {

				size = this.width / this.options.length;
				pos  = (position.x + this.width / 2);

				if (pos > 0) {
					index = (pos / size) | 0;
				}

			} else if (type === Class.TYPE.vertical) {

				size = this.height / this.options.length;
				pos  = (position.y + this.height / 2);

				if (pos > 0) {
					index = (pos / size) | 0;
				}

			}


			if (index >= 0) {

				var value = this.options[index] || null;
				if (value !== null) {

					if (value !== this.value) {

						var result = this.setValue(value);
						if (result === true) {
							this.trigger('change', [ this.value ]);
						}

					}

				}

			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		settings = null;

	};


	Class.TYPE = {
		horizontal: 0,
		vertical:   1
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Switch';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.options.length !== 0)           settings.options = [].slice.call(this.options, 0);
			if (this.type !== Class.TYPE.horizontal) settings.type    = this.type;
			if (this.value !== '')                   settings.value   = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.alpha = (1 - t) * 0.6;
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var color2 = this.state === 'active' ? '#0099cc' : '#575757';
			var alpha  = this.state === 'active' ? 0.6       : 0.3;


			var options = this.options;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;

			var x1 = x - hwidth;
			var y1 = y - hheight;
			var x2 = x + hwidth;
			var y2 = y + hheight;


			renderer.drawBox(
				x1,
				y1,
				x2,
				y2,
				color2,
				false,
				2
			);


			var pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawBox(
					x1,
					y1,
					x2,
					y2,
					color,
					true
				);

				renderer.setAlpha(1.0);

			}


			var font = this.font;
			if (font !== null && options.length > 0) {


				var o, ol, option, size;

				var type = this.type;
				if (type === Class.TYPE.horizontal) {

					size = this.width / options.length;


					for (o = 0, ol = options.length; o < ol; o++) {

						option = options[o];

						if (option === this.value) {

							renderer.setAlpha(alpha);

							renderer.drawBox(
								x1 + o * size,
								y1,
								x1 + (o + 1) * size,
								y2,
								color,
								true
							);

							renderer.setAlpha(1.0);

						}


						renderer.drawText(
							x1 + o * size + size / 2,
							y,
							option,
							font,
							true
						);

					}


				} else if (type === Class.TYPE.vertical) {

					size = this.height / options.length;


					for (o = 0, ol = options.length; o < ol; o++) {

						option = options[o];

						if (option === this.value) {

							renderer.setAlpha(alpha);

							renderer.drawBox(
								x1,
								y1 + o * size,
								x2,
								y1 + (o + 1) * size,
								color,
								true
							);

							renderer.setAlpha(1.0);

						}


						renderer.drawText(
							x,
							y1 + o * size + size / 2,
							option,
							font,
							true
						);

					}

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		},

		setOptions: function(options) {

			options = options instanceof Array ? options : null;


			if (options !== null) {

				this.options = options.map(function(option) {
					return '' + option;
				});

				return true;

			}


			return false;

		},

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var pulse = this.__pulse;


				if (id === 'active') {

					pulse.alpha  = 0.6;
					pulse.start  = null;
					pulse.active = true;

				}


				return true;

			}


			return false;

		},

		setType: function(type) {

			if (lychee.enumof(Class.TYPE, type)) {

				this.type = type;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				if (this.options.indexOf(value) !== -1) {

					this.value = value;

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

