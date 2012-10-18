Game.Audio = {
	_maxConcurentAudio: 5,
	_concurentAudio: 0,
	_supported: !!window.Audio && !(navigator.userAgent.match(/linux/i) && navigator.userAgent.match(/firefox/i)),
	play: function(name) {
		if (!this._supported) { return; }
		if (this._maxConcurentAudio < this._concurentAudio) { return; }

		var a = new Audio();
		var ext = (a.canPlayType("audio/ogg") ? "ogg" : "mp3");
		a.src = "sfx/" + name + "." + ext;
		a.addEventListener('ended', (function() { this._concurentAudio--; }).bind(this));
		a.play();

		this._concurentAudio++;
	}
}
