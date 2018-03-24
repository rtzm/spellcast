/**
 * Writes to canvas element using vectors read into it
 * 
 * @param {canvas} outputCanvas
 */
export default function GlyphWriter(outputCanvas, reticleContainer, drawingImg, notDrawingImg) {
	this.outputCanvas = outputCanvas;
	this.outputContext = outputCanvas.getContext('2d', { alpha: "false" });
	this.outputContext.strokeStyle = "red";
	this.reticleContainer = reticleContainer;
	this.totalWidth = outputCanvas.width;
	this.totalHeight = outputCanvas.height;
	this.drawingImg = drawingImg;
	this.notDrawingImg = notDrawingImg;
	this.currentPosition = [ 
		Math.floor(outputCanvas.width/2), 
		Math.floor(outputCanvas.height/2)
	];
};

/**
 * Write to the outputContext using the given vector
 *
 * @param  {Array} vector an x and y vector
 * @param  {Boolean} whether actually drawing to context or just moving reticle
 */
GlyphWriter.prototype.write = function(vector, recording) {
	// Get current position and subtract vector 
	// (since the vectors are inverted for the image)
	let [startWidth, startHeight] = this.currentPosition;
	let [deltaX, deltaY] = vector;
	this.currentPosition[0] = startWidth - deltaX;
	this.currentPosition[1] = startHeight - deltaY;

	// Prevent position from moving past frame
	if (this.currentPosition[0] > this.totalWidth) {
		this.currentPosition[0] = this.totalWidth;
	}
	if (this.currentPosition[0] < 0) {
		this.currentPosition[0] = 0;
	}
	if (this.currentPosition[1] > this.totalHeight) {
		this.currentPosition[1] = this.totalHeight;
	}
	if (this.currentPosition[1] < 0) {
		this.currentPosition[1] = 0;
	}

	if (recording) {
		// Draw path
		// TODO: replace drawing with offscreen canvas for optimization
		// See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
		// Or possibly https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
		this.outputContext.beginPath();
		this.outputContext.moveTo(startWidth, startHeight);
		this.outputContext.lineTo(this.currentPosition[0], this.currentPosition[1]);
		this.outputContext.stroke();		
	}

	this.moveRecticle(recording);
};

/**
 * Draw the reticle on the reticle canvas
 * 
 * @param  {Boolean} recording Whether currently recording writing as a line drawing
 */
GlyphWriter.prototype.moveRecticle = function(recording) {
	// TODO: this is kludgey. Make the reticle image into a value object and abstract 
	// this into there
	let currentReticleLeft = `${this.currentPosition[0] - 7}px`;
	let currentReticleTop = `${this.currentPosition[1] - 7}px`;
	let offscreen = "-15px";

	this.drawingImg.style.position = "absolute";
	this.drawingImg.style.left = currentReticleLeft;
	this.drawingImg.style.top = currentReticleTop;
	this.drawingImg.hidden = !recording;
	
	this.notDrawingImg.style.position = "absolute";
	this.notDrawingImg.style.left = currentReticleLeft;
	this.notDrawingImg.style.top = currentReticleTop;
	this.notDrawingImg.hidden = recording;
}
