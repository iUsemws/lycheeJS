
lychee.define('lychee.event.Flow').includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _process_stack = function() {

		var entry = this.___stack.shift() || null;
		if (entry !== null) {

			var that  = this;
			var data  = entry.data;
			var event = entry.event;
			var args  = data !== null ? [ event, data ] : [ event, [function(result) {

				if (result === true) {
					_process_stack.call(that);
				} else {
					that.trigger('error', [ event ]);
				}

			}]];


			var result = this.trigger.apply(this, args);
			if (result === false) {
				this.trigger('error', [ event ]);
			}

		} else {

			this.trigger('complete');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.___init  = false;
		this.___stack = [];

		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.event.Flow';

			var blob = (data['blob'] || {});


			if (this.___stack.length > 0) {

				blob.stack = [];

				for (var s = 0, sl = this.___stack.length; s < sl; s++) {

					var entry = this.___stack[s];

					blob.stack.push({
						event: entry.event,
						data:  lychee.serialize(entry.data)
					});

				}

			}


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		then: function(event, data) {

			event = typeof event === 'string' ? event : null;
			data  = data instanceof Array     ? data  : null;


			if (event !== null) {

				this.___stack.push({
					event: event,
					data:  data
				});

				return true;

			}


			return false;

		},

		init: function() {

			if (this.___init === false) {

				this.___init = true;


				if (this.___stack.length > 0) {

					_process_stack.call(this);

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

