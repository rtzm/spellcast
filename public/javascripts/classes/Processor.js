export default function Processor(video, input, converter, reader) {
	this.video = video;
	this.ctxInput = input.getContext('2d', { alpha: false });

	/**
	 * Converts frames from video image data into a drawing
	 * @type {CastConverter}
	 */
	this.converter = converter;

	/**
	 * Reader that reads output from line-drawn image
	 * @type {GlyphReader}
	 */
	this.reader = reader;

	/**
	 * ID for requestAnimationFrame
	 */
	this.requestId;
};

/**
 * Starts the processor converting images frame by frame
 */
Processor.prototype.start = function() {
	this.requestId = window.requestAnimationFrame(this.start.bind(this));
	this.ctxInput.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
	let imageData = this.ctxInput.getImageData(0, 0, video.videoWidth, video.videoHeight);
	this.converter.convertFrame(imageData);
};

Processor.prototype.stop = function() {
	window.cancelAnimationFrame(this.requestId);
}
