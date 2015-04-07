
lychee.define('lychee.ui.Label').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.label = null;
		this.font  = null;


		this.setFont(settings.font);
		this.setLabel(settings.label);

		delete settings.font;
		delete settings.label;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = this.width;
		settings.height = this.height;


		lychee.ui.Entity.call(this, settings);

		settings = null;

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
			data['constructor'] = 'lychee.ui.Label';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.label !== null) settings.label = this.label;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var label = this.label;
			var font  = this.font;

			if (label !== null && font !== null) {

				renderer.drawText(
					x,
					y,
					label,
					font,
					true
				);

			}

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				// refresh the layout
				if (this.label !== null) {
					this.setLabel(this.label);
				}

				return true;

			}


			return false;

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				var font = this.font;
				if (font !== null) {

					var dim = font.measure(label);

					this.width  = dim.realwidth;
					this.height = dim.realheight;

				}

				this.label = label;

				return true;

			}


			return false;

		}

	};


	return Class;

});

