window.onload = function () {

    //start crafty
	var GAME_WIDTH = 800;
	var GAME_HEIGHT = 600;
    var SPRITE_SIZE = 32;
	var TILE_SIZE = 32;

    Crafty.init(GAME_WIDTH, GAME_HEIGHT);
    Crafty.sprite(SPRITE_SIZE, "img/player-scaled.png", {
        player_east_1: [0, 0],
        player_east_2: [1, 0],
        player_east_3: [2, 0],
        player_west_1: [0, 1],
        player_west_2: [1, 1],
		player_west_3: [2, 1],
		player_south_1: [0, 2],
		player_south_2: [1, 2],
        player_south_3: [2, 2],
        player_north_1: [0, 3],
        player_north_2: [1, 3],
		player_north_3: [2, 3]
    });

	Crafty.sprite(TILE_SIZE, "img/tiles-scaled.png", {
        grass: [0, 0],
        cave_floor: [1, 0],
        tree: [0, 1],
        stone: [1, 1]
    });

	function generate_chunk() {
		var chunk = new Array();
		for (y=0; y<16; y++) {
			chunk.push([]);
			for(x=0; x<16; x++) {
				var chance = Math.random();
				if (chance < .33) {
					chunk[y].push(Crafty.e("2D, DOM, tree, solid")
					.attr({
						x: x * TILE_SIZE,
						y: y * TILE_SIZE,
						w: TILE_SIZE,
						h: TILE_SIZE
					}));
				} else {
					chunk[y].push(Crafty.e("2D, DOM, grass")
					.attr({
						x: x * TILE_SIZE,
						y: y * TILE_SIZE,
						w: TILE_SIZE,
						h: TILE_SIZE
					}));
				}
			}
		}
		return chunk;
	}

    Crafty.scene("loading", function() {
        Crafty.background("#000");
		Crafty.e("2D, DOM, Text")
        .attr({
            w: 100,
            h: 20,
            x: 150,
            y: 120
        })
        .text("Loading")
        .css({"text-align": "center"});
		Crafty.load(["img/tiles-scaled.png", "img/player-scaled.png"], function() {
		    Crafty.scene("main");
		});
    });

    Crafty.scene("main", function() {
        Crafty.background("#000");

		var chunk = generate_chunk();

        var player = Crafty.e("2D, DOM, SpriteAnimation, player_east_1, Collision, TileCollision, CustomControls")
        .attr({
            x: 0,
            y: 0,
			x_velocity: 0,
			y_velocity: 0,
			w: SPRITE_SIZE,
			h: SPRITE_SIZE
        })
		.animate("stand_east", 0, 0, 0)
		.animate("stand_west", 0, 1, 0)
		.animate("stand_south", 0, 2, 0)
		.animate("stand_north", 0, 3, 0)
		.animate("walk_east", [[1, 0], [0, 0], [2, 0], [0, 0]])
		.animate("walk_west", [[1, 1], [0, 1], [2, 1], [0, 1]])
		.animate("walk_south", [[1, 2], [0, 2], [2, 2], [0, 2]])
		.animate("walk_north", [[1, 3], [0, 3], [2, 3], [0, 3]])
		.animate("stand_east", 30, -1)
		.collision()
		.onHit("solid", function(tiles) {
			if (tiles !== false) {
				for (i=0; i<tiles.length; i++) {
					this.handle_collision(tiles[i].obj);
				}
			}
		});
		player.CustomControls();
		console.log(player);
    });


    Crafty.c("CustomControls", {
        CustomControls: function() {
            this.bind("EnterFrame", function() {
				var up = Crafty.keydown[Crafty.keys.UP_ARROW];
				var down = Crafty.keydown[Crafty.keys.DOWN_ARROW];
				var left = Crafty.keydown[Crafty.keys.LEFT_ARROW];
				var right = Crafty.keydown[Crafty.keys.RIGHT_ARROW];
                if (up) {
                    this.y_velocity = -2;
					if (!this.isPlaying("walk_north")) {
						this.stop().animate("walk_north", 30, -1);
					}
                }
				if (down) {
                    this.y_velocity = 2;
					if (!this.isPlaying("walk_south")) {
						this.stop().animate("walk_south", 30, -1);
					}
                }
				if (left) {
                    this.x_velocity = -2;
					if (!this.isPlaying("walk_west")) {
						this.stop().animate("walk_west", 30, -1);
					}
                }
				if (right) {
                    this.x_velocity = 2;
					if (!this.isPlaying("walk_east")) {
						this.stop().animate("walk_east", 30, -1);
					}
                }
				if (!left && !right) {
					this.x_velocity = 0;
				}
				if (!up && !down) {
					this.y_velocity = 0;
				}
				if (!(up | down | left | right)) {
					this.stop();
				}

				this.x += this.x_velocity;
				this.y += this.y_velocity;
            });
        }
    });

	Crafty.c("TileCollision", {
		handle_collision: function(tile) {
			var overlap_x = Math.min(this.x + this.w, tile.x + tile.w) - Math.max(this.x, tile.x);
		    var overlap_y = Math.min(this.y + this.h, tile.y + tile.h) - Math.max(this.y, tile.y);
			//console.log("x: " + overlap_x + ", y: " + overlap_y);
		    if (Math.abs(overlap_y) < Math.abs(overlap_x)) {
		        if (this.y < tile.y) {
			        this.y -= overlap_y;
		        } else { 
			        this.y += overlap_y;
		        }
		    } else {
		        if (this.x < tile.x) {
			        this.x -= overlap_x;
		        } else {
			        this.x += overlap_x;
		        }
		    }
		}
	});

    Crafty.scene("loading");
}
