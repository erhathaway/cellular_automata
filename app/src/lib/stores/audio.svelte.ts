let playing = $state(false);

export const audioStore = {
	get playing() { return playing; },
	set playing(v: boolean) { playing = v; }
};
