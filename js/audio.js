Game.Audio = {
	_supported: !!window.Audio && !(navigator.userAgent.match(/linux/i) && navigator.userAgent.match(/firefox/i)),
	play: function(name) {
		if (!this._supported) { return; }
		if (!window.Audio) { return; }
		var a = new Audio();
		var ext = (a.canPlayType("audio/ogg") ? "ogg" : "mp3");
		a.src = "sfx/" + name + "." + ext;
		a.play();
	}
}
