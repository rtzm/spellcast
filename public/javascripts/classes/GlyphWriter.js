/**
 * Writes to canvas element using vectors read into it
 * 
 * @param {canvas} outputCanvas
 */
export default function GlyphWriter(outputCanvas, reticleCanvas) {
	this.outputCanvas = outputCanvas;
	this.outputContext = outputCanvas.getContext('2d', { alpha: "false" });
	this.outputContext.strokeStyle = "red";
	this.reticleCanvas = reticleCanvas;
	this.reticleContext = reticleCanvas.getContext('2d', { alpha: "false" });
	this.reticleContext.strokeStyle = "black";
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

	this.drawReticle(recording);
};

/**
 * Draw the reticle on the reticle canvas
 * 
 * @param  {Boolean} recording Whether to draw recording reticle or rest reticle
 */
GlyphWriter.prototype.drawReticle = function(recording) {
	this.reticleContext.clearRect(0, 0, this.totalWidth, this.totalHeight)
	this.reticleContext.beginPath();

	if (recording) {
		// Draw a circle around the point
		this.reticleContext.arc(this.currentPosition[0], this.currentPosition[1], 5, 0, 2 * Math.PI);

	} else {
		// Draw a horizontal line
		this.reticleContext.moveTo(this.currentPosition[0]-5, this.currentPosition[1]);
		this.reticleContext.lineTo(this.currentPosition[0]+5, this.currentPosition[1]);

		// And a vertical line
		this.reticleContext.moveTo(this.currentPosition[0], this.currentPosition[1]-5);
		this.reticleContext.lineTo(this.currentPosition[0], this.currentPosition[1]+5);
	}

	this.reticleContext.stroke();
}
