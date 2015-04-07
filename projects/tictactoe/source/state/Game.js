
lychee.define('game.state.Game').requires([
	'lychee.effect.Shake',
	'lychee.game.Background',
	'game.entity.Board',
	'game.ui.Button',
	'game.ui.Label'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob  = attachments["json"].buffer;
	var _music = attachments["msc"];
	var _sound = attachments["snd"];



	/*
	 * HELPERS
	 */

	var _on_touch = function(entity) {

		if (this.__locked === true) return false;


		var player = this.__player;
		var result = entity.setState('active-' + player);
		if (result === true) {

			if (_is_game_won.call(this, player) === true) {

				this.__locked = true;
				this.__scores[player]++;

				_reset_game.call(this);

			} else if (_is_game_draw.call(this) === true) {

				this.__locked = true;

				_reset_game.call(this);

			} else {

				this.__player = player === 'x' ? 'o' : 'x';

			}

		}

	};

	var _is_game_draw = function() {

		var empty = this.queryLayer('ui', 'board').entities.filter(function(tile) {
			return tile.state === 'default';
		});

		if (empty.length === 0) {
			return true;
		}


		return false;

	};

	var _is_game_won = function(player) {

		var tiles  = this.queryLayer('ui', 'board').entities;
		var state  = 'active-' + player;


        for (var y = 1; y <= 3; y++) {

            var horizontal = tiles.filter(function(tile) {
                return tile.y === y && tile.state === state;
            });

            if (horizontal.length === 3) {
                return true;
            }

        }

        for (var x = 1; x <= 3; x++) {

            var vertical = tiles.filter(function(tile) {
                return tile.x === x && tile.state === state;
            });

            if (vertical.length === 3) {
                return true;
            }

        }

        var diagonal_tlbr = tiles.filter(function(tile) {
            return tile.x === tile.y && tile.state === state;
        });

        var diagonal_trbl = tiles.filter(function(tile) {
            return tile.x === (4 - tile.y) && tile.state === state;
        });

        if (diagonal_trbl.length === 3 || diagonal_tlbr.length === 3) {
            return true;
        }


        return false;

	};

	var _reset_game = function() {

		this.__player = 'x';


		var board = this.queryLayer('ui', 'board');
		if (board !== null) {

			board.entities.forEach(function(entity) {

				entity.addEffect(new lychee.effect.Shake({
					type:     lychee.effect.Shake.TYPE.bounceeaseout,
					delay:    (100 + Math.random() * 100) | 0,
					duration: 500,
					shake:    {
						x: (Math.random() * 8) | 0,
						y: (Math.random() * 4) | 0
					}
				}));

			});


			this.jukebox.play(_sound);

			this.loop.setTimeout(700, function() {

				board.entities.forEach(function(entity) {
					entity.setState('default');
				});

				this.__locked = false;

			}, this);

		} else {

			this.__locked = false;

		}


		var score = this.queryLayer('ui', 'score');
		if (score !== null) {
			score.setLabel(this.__scores.x + ' : ' + this.__scores.o);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.__player = 'x';
		this.__scores = { x: 0, o: 0 };


		this.deserialize(_blob);



		/*
		 * INITIALIZATION
		 */

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				var renderer = this.renderer;
				if (renderer !== null) {

					var entity = null;
					var width  = renderer.width;
					var height = renderer.height;


					entity = this.queryLayer('background', 'background');
					entity.width  = width;
					entity.height = height;

				}

			}, this);

		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.game.State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			this.queryLayer('ui', 'board').entities.forEach(function(entity) {
				entity.bind('#touch', _on_touch, this);
			}.bind(this));

			this.queryLayer('ui', 'back').bind('touch', function() {
				this.main.changeState('menu');
			}, this);

		},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

			lychee.game.State.prototype.update.call(this, clock, delta);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);


			this.__player   = 'x';
			this.__scores.x = 0;
			this.__scores.o = 0;


			this.jukebox.play(_music);


			var board = this.queryLayer('ui', 'board');
			if (board !== null) {
				board.entities.forEach(function(entity) {
					entity.setState('default');
				});
			}

			var score = this.queryLayer('ui', 'score');
			if (score !== null) {
				score.setLabel('0 : 0');
			}

		},

		leave: function() {

			lychee.game.State.prototype.leave.call(this);


			this.jukebox.stop(_music);

		}

	};


	return Class;

});
