/**
 * Reads canvas element and converts it into a symbol if possible
 * 
 * @param {canvas} outputCanvas
 */
export default function GlyphReader(outputCanvas, tesseract) {
	this.outputCanvas = outputCanvas;
	this.tesseract = tesseract;
};

/**
 * Reads the outputContext and converts to a symbol
 */
GlyphReader.prototype.read = function() {
	console.log(this.tesseract);
	this.tesseract.recgonize(this.outputCanvas)
	.then((result) => {
		return result.symbols[0].choices[0];
	})
	.catch((err) => {
		console.error(err);
	})
};
