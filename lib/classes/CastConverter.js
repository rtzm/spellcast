/**
 * The converter service for turning video into a composed drawing
 * 
 * @param {[type]} video    [description]
 * @param {[type]} analyzer [description]
 * @param {[type]} writer   [description]
 */
export default function CastConverter(videoContext, analyzer, writer) {
	/**
	 * Video context from the input canvas
	 * TODO: figure out how this is going to be read in, and how it is
	 * going to be turned into ImageData
	 * 
	 * @type {CanvasRenderingContext2D}
	 */
	this.videoContext = videoContext;

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

CastConverter.prototype.loadVideo = function(video) {
	this.video = video;
};

CastConverter.prototype.convert = function(imageData) {
	this.writer.write(this.analyzer.parse(imageData));
};
