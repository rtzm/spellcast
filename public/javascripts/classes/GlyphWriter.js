/**
 * Writes to canvas element using vectors read into it
 * 
 * @param {canvas} outputCanvas
 */
export default function GlyphWriter(outputCanvas) {
	this.outputCanvas = outputCanvas;
	this.outputContext = outputCanvas.getContext('2d', { alpha: "false" });
	this.outputContext.strokeStyle = "red";
	this.totalWidth = outputCanvas.width;
	this.totalHeight = outputCanvas.height;
	this.currentPosition = [ 
		Math.round(outputCanvas.width/2), 
		Math.round(outputCanvas.height/2)
	];
};

/**
 * Write to the outputContext using the given vector
 *
 * @param  {Array} vector an x and y vector
 */
GlyphWriter.prototype.write = function(vector) {
	// Get current position and subtract vector 
	// (since the vectors are inverted for the image)
	let [startWidth, startHeight] = this.currentPosition;
	let [deltaX, deltaY] = vector;
	this.currentPosition[0] = startWidth - deltaX;
	this.currentPosition[1] = startHeight - deltaY;

	// Draw path
	// TODO: replace drawing with offscreen canvas for optimization
	// See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
	// Or possibly https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
	this.outputContext.beginPath();
	this.outputContext.moveTo(startWidth, startHeight);
	this.outputContext.lineTo(this.currentPosition[0], this.currentPosition[1]);
	this.outputContext.stroke();
};
