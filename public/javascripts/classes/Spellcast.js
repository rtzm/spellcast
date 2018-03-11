import CastConverter from './CastConverter.js';
import OptFlowAnalyzer from './OptFlowAnalyzer.js';
import GlyphWriter from './GlyphWriter.js';
import GlyphReader from './GlyphReader.js';
import Processor from './Processor.js';

export default function Spellcast() {
	/**
	 * The video element that will be sourced through getUserMedia
	 */
	this.video;

	/**
	 * The glyph div element that will hold the final OCR'ed symbol
	 */
	this.glyph;

	/**
	 * The canvas element through which the video will be passed for 
	 * processing. This will be hidden.
	 */
	this.inputCanvas;

	/**
	 * The canvas element that the outcome of all the processing will
	 * be written to.
	 */
	this.outputCanvas;

	/**
	 * Media constraints for the call to getUserMedia
	 * @type {Object}
	 */
	this.mediaConstraints = { 
		audio: false, 
		video: { 
			facingMode: 
			{ exact: 
				"environment" 
			} 
		}
	};
};

/**
 * Initialize the app when document has loaded
 */
Spellcast.prototype.boot = function() {
	this.video = document.getElementById('video');
	this.glyph = document.getElementById('glyph');

	// TODO: add handling for making this work on all mobile browsers
	navigator.mediaDevices.getUserMedia(this.mediaConstraints)
	.then(this.handleStream.bind(this))
	.catch(this.handleGetUserMediaError.bind(this));	
};

/**
 * Handle error from getUserMedia
 * 
 * @param  {Error} error
 */
Spellcast.prototype.handleGetUserMediaError = function(error) {
	let warning = document.createTextNode("Unable to run with your browser/camera.");
	this.glyph.appendChild(warning);
	console.error(error);
}

/**
 * Handle stream when received from getUserMedia
 * 
 * @param  {MediaStream} stream
 */
Spellcast.prototype.handleStream = function(stream) {

	this.video.srcObject = stream;
	this.video.onloadedmetadata = this.loadAndProcess.bind(this);
}

/**
 * Create canvases and objects for processing, and attach event listeners
 */
Spellcast.prototype.loadAndProcess = function() {
	this.createCanvases();

	let processor = this.generateVideoProcessor();

	// Bind processor to video playback and begin playback
	video.addEventListener('playing', processor.start.bind(processor), false);
	video.addEventListener('ended', processor.stop.bind(processor), false);
	video.addEventListener('pause', processor.stop.bind(processor), false);
	video.play();

	// Bind transcription event when video pauses
	video.addEventListener('pause', this.transcribeGlyph.bind(this), false);	
};

/**
 * Make input and output canvases for processing video
 */
Spellcast.prototype.createCanvases = function() {
	this.input = document.createElement("canvas")
	this.input.setAttribute("id", "input")
	this.input.setAttribute("width", video.videoWidth)
	this.input.setAttribute("height", video.videoHeight);
	this.output = document.createElement("canvas")
	this.output.setAttribute("id", "output")
	this.output.setAttribute("width", video.videoWidth)
	this.output.setAttribute("height", video.videoHeight);
	let container = document.getElementById("output-container");
	container.appendChild(this.output);
}

/**
 * Make objects for processing video
 * 
 * @return {Processor}
 */
Spellcast.prototype.generateVideoProcessor = function() {
	let converter = new CastConverter(
		new OptFlowAnalyzer().init(), 
		new GlyphWriter(this.output)
	);
	let reader = new GlyphReader(this.output);
	return new Processor(this.video, this.input, converter, reader);
}

/**
 * Use Tesseract.js service worker to read in the output canvas and 
 * turn it into a piece of text, and place that on the screen.
 * 
 * @todo right now this is dependent on the external Tesseract service,
 *       but should look into creating a custom client-side service running
 *       locally to optimize processing and possibly create a custom
 *       dictionary of symbols
 */
Spellcast.prototype.transcribeGlyph = function() {
	Tesseract.recognize(this.output)
	.then((result) => {
		let text = document.createTextNode(result.symbols[0].text);
		this.glyph.appendChild(text);
	})
	.catch(err => console.error(err));
}

let spellcast = new Spellcast();
document.body.onload = spellcast.boot.bind(spellcast);

