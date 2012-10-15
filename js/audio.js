(function() {
	// Load audio files
	var manifest = [
				{ id:"shot", src:"sfx/shot.mp3|sfx/shot.ogg", data:20 },
				{ id:"explosion", src:"sfx/explosion.mp3|sfx/explosion.ogg", data:6 },
				{ id:"neointro", src:"sfx/neointro.mp3|sfx/neointro.ogg" }
			];

	preload = new createjs.PreloadJS();
	preload.installPlugin(createjs.SoundJS);
	preload.loadManifest(manifest);
})();


Game.Audio = {
	play: function(name) {
		
		createjs.SoundJS.play(name);
	}
}
