/**
 * Writes to canvas element using vectors read into it
 * 
 * @param {canvas} outputCanvas
 */
export default function GlyphWriter(outputCanvas, reticleImg, drawingImgPath, notDrawingImgPath) {
	this.outputCanvas = outputCanvas;
	this.outputContext = outputCanvas.getContext('2d', { alpha: "false" });
	this.outputContext.strokeStyle = "red";
	this.reticleImg = reticleImg;
	this.totalWidth = outputCanvas.width;
	this.totalHeight = outputCanvas.height;
	this.drawingImgPath = drawingImgPath;
	this.notDrawingImgPath = notDrawingImgPath;
	this.currentPosition = [ 
		Math.floor(outputCanvas.width/2), 
		Math.floor(outputCanvas.height/2)
	];
	this.useRecordingReticle = false;
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
	let changeReticle = false;
	if (this.useRecordingReticle !== recording) {
		this.useRecordingReticle = recording;
		this.reticleImg.src = recording ? this.drawingImgPath : this.notDrawingImgPath;
	}
	// TODO: this is kludgey. Make the reticle image into a value object and abstract 
	// this into there
	this.reticleImg.style.left = `${this.currentPosition[0] - 7}px`;
	this.reticleImg.style.top = `${this.currentPosition[1] - 7}px`;
}
