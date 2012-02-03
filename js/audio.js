Game.Audio = {
	play: function(name) {
		return;
		if (!window.Audio) { return; }
		var a = new Audio();
		var ext = (a.canPlayType("audio/ogg") ? "ogg" : "mp3");
		a.src = "sfx/" + name + "." + ext;
		a.play();
	}
}
