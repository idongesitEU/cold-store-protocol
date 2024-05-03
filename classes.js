class Runtime {
	start() {
		this.start = new Date().getTime() / 1000;
	}
	end () {
		this.end = new Date().getTime() / 1000;
		this.duration = this.end - this.start;
		return this.duration;
	}
	constructor() {
		this.start();
	}
}
module.exports = {
Runtime
}