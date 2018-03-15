export default function Processor(video, converter, width, height) {
	this.video = video;
	this.width = width;
	this.height = height;
	this.offscreenCanvas = document.createElement("canvas");
	this.offscreenCanvas.width = width;
	this.offscreenCanvas.height = height
	this.offscreenContext = this.offscreenCanvas.getContext('2d', { alpha: false });

	/**
	 * Converts frames from video image data into a drawing
	 * @type {CastConverter}
	 */
	this.converter = converter;

	/**
	 * ID for requestAnimationFrame
	 */
	this.requestId;
};

/**
 * Starts the processor converting images frame by frame
 */
Processor.prototype.start = function() {
	// TODO: requesting animation frame should maybe live in the purview of the Spellcast object
	this.requestId = window.requestAnimationFrame(this.start.bind(this));
	this.offscreenContext.drawImage(this.video, 0, 0, this.width, this.height);
	let imageData = this.offscreenContext.getImageData(0, 0, this.width, this.height);
	this.converter.convertFrame(imageData);
};

Processor.prototype.stop = function() {
	// TODO: canceling animation frame should maybe live in the purview of the Spellcast object
	window.cancelAnimationFrame(this.requestId);
}
