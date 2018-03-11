/**
 * Reads canvas element and converts it into a symbol if possible
 *
 * @todo this class currently isn't being used, since TesseractWorker
 * does not like bing loaded in through a module like I'm doing with my
 * other classes. Need to either clean that up or remove this file.
 * @param {canvas} outputCanvas
 * @param {Tesseract} tesseract the Tesseract OCR service
 */
export default function GlyphReader(outputCanvas, tesseract) {
	this.outputCanvas = outputCanvas;
	this.tesseract = tesseract;
};

/**
 * Reads the outputContext and converts to a symbol
 * @todo currently not used, see todo above
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
