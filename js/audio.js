Game.Audio = {
	_maxConcurentAudio: 5,
	_liveAudiosCache: {},
	_supported: !!window.Audio,
	play: function(name) {
		if (!this._supported) { return; }
		if (this._liveAudiosCache[name] && this._liveAudiosCache[name] > this._maxConcurentAudio) { return; }

		if (!this._liveAudiosCache[name])
			this._liveAudiosCache[name] = 0;
		
		var a = new Audio();
		var ext = (a.canPlayType("audio/ogg") ? "ogg" : "mp3");
		a.src = "sfx/" + name + "." + ext;
		a.addEventListener('ended', (function() { this._liveAudiosCache[name]--; }).bind(this));
		a.play();

		this._liveAudiosCache[name]++;
	}
}
