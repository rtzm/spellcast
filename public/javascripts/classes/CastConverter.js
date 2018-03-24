/**
 * The converter service for turning video into a composed drawing
 * 
 * @param {CanvasRenderingContext2D}	videoContext
 * @param {OptFlowAnalyzer}						analyzer
 * @param {GlyphWriter}								writer
 */
export default function CastConverter(analyzer, writer) {
	/**
	 * Optical flow analyzer that will provide composite data for 
	 * the video
	 * 
	 * @type {OptFlowAnalyzer}
	 */
	this.analyzer = analyzer;

	/**
	 * Writer that handles output to a line-drawn image
	 * @type {GlyphWriter}
	 */
	this.writer = writer;
};

/**
 * Converts the image into vectors and passes them to the writer
 * 
 * @param  {ImageData} imageData from input context for video
 * @param  {Boolean} whether should be writing or just moving reticle
 */
CastConverter.prototype.convertFrame = function(imageData, recording) {
	this.analyzer.parse(imageData);
	this.writer.write(this.analyzer.getAverageVector(), recording);
};
