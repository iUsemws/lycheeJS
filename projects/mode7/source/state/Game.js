
lychee.define('game.state.Game').requires([
	'game.entity.Background',
	'game.entity.lycheeJS',
	'game.entity.Track'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		lychee.game.State.call(this, game);


		this.camera = game.camera || null;

		this.__autopilot  = false;
		this.__direction  = 1;
		this.__offset     = 0;
		this.__origin     = { bgx: 0, bgy: 0, fgx: 0, fgy: 0 };

		this.__background = null;
		this.__logo       = null;
		this.__track      = null;


		this.deserialize();

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			var data = lychee.game.State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function() {

			var renderer = this.renderer;
			if (renderer !== null) {

				var hwidth  = renderer.width  / 2;
				var hheight = renderer.height / 2;


				this.__origin.bgx = hwidth;
				this.__origin.bgy = hheight + 64;
				this.__origin.fgx = hwidth;
				this.__origin.fgy = hheight + 128;


				this.__background = new game.entity.Background({
					width:  renderer.width,
					height: hheight + 128,
					origin: this.__origin
				});

				this.__logo = new game.entity.lycheeJS({
					position: {
						x: renderer.width - 128,
						y: renderer.height - 24
					}
				});

			}

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);


			this.__track = new game.entity.Track(data.track);


			if (this.__track.length === 0) {
				this.leave();
				return;
			}


			var wait   = 3; // in seconds
			var renderer = this.renderer;
			if (renderer !== null) {

				var camera = this.camera;
				var width  = renderer.width;
				var height = renderer.height;


				camera.position.y = camera.offset + wait * 10 * height;


				var start = null;

				var handle = this.loop.setInterval(1000 / 60, function(clock, delta, step) {

					if (start === null) start = clock;


					var t = (clock - start) / (wait * 1000);
					var y = camera.offset + (1 - (Math.pow(t - 1, 3) + 1)) * wait * 10 * height;
					if (y < camera.offset) {

						camera.position.y = camera.offset;
						this.__autopilot  = true;
						this.__offset     = camera.offset;

						this.loop.removeInterval(handle);

					} else {

						camera.position.y = y;

					}

				}, this);

			}

		},

		leave: function() {

			this.__autopilot = false;
			this.__track     = null;


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			var camera = this.camera;
			var position = camera.position;

			var background = this.__background;
			var origin     = this.__origin;
			var track      = this.__track;

			var autopilot  = this.__autopilot === true;
			if (autopilot) {

				var length = track.length;
				if (position.z + 200 > length * 200) {
					position.z = 0;
				} else {
					position.z += 200;
				}

			}


			var segment = track.getSegment(position.z);
			if (autopilot) {
				position.y = segment.from.y + this.__offset;
			}


			var bgw = background.width;
			var bgh = background.height;

			var orx = (bgw / 2 - (segment.rotation / 180) * 1024) | 0;
			var ory = (bgh + (segment.from.y - bgh * 2) / 160000 * bgh) | 0;

			origin.fgx = orx;
			origin.fgy = ory;

			origin.bgx = orx + (clock / 1000) * 8;
			origin.bgy = bgh + Math.sin((clock / 10000) * Math.PI) * 16;


			background.setOrigin(origin);

		},

		render: function(clock, delta) {

			var renderer = this.renderer;
			if (renderer !== null) {

				renderer.clear();

				var bgx = renderer.width / 2;
				var bgy = this.__background.height / 2;
				renderer.renderEntity(this.__background, bgx, bgy);

				renderer.renderEntity(this.__track,      0, 0);
				renderer.renderEntity(this.__logo,       0, 0);

				renderer.flush();

			}

		}

	};


	return Class;

});
