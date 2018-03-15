import CastConverter from './CastConverter.js';
import OptFlowAnalyzer from './OptFlowAnalyzer.js';
import GlyphWriter from './GlyphWriter.js';
import GlyphReader from './GlyphReader.js';
import Processor from './Processor.js';

export default function Spellcast() {
	/**
	 * The video element that will be sourced with getUserMedia's MediaStream
	 */
	this.video = document.createElement('video');
	this.video.setAttribute("playsinline", true);

	/**
	 * The text output div element that will hold the final OCR'ed symbol
	 */
	this.textOutput;

	/**
	 * The canvas element that the outcome of all the processing will
	 * be written to.
	 */
	this.glyph;

	this.capturing = false;

	/**
	 * How much the video size should be reduced by
	 * 
	 * @type {Number}
	 */
	this.downsampleRate = 4;

	/**
	 * Media constraints for the call to getUserMedia
	 * @type {Object}
	 */
	this.mediaConstraints = { 
		audio: false, 
		video: { 
			// TODO: make this exact when ready for mobile
			facingMode: "environment",
			// TODO: add frame rate for better mobile processing
			frameRate: {
				ideal: 10,
				max: 15
			}
		}
	};
};

/**
 * Initialize the app when document has loaded
 */
Spellcast.prototype.boot = function() {
	this.videoControl = document.getElementById('video-control');
	this.glyph = document.getElementById('glyph');
	this.textOutput = document.getElementById('text-output');

	// TODO: add handling for making this work on all mobile browsers
	if (navigator.mediaDevices) {
		navigator.mediaDevices.getUserMedia(this.mediaConstraints)
		.then(this.handleStream.bind(this)) 
		.catch(this.handleGetUserMediaError.bind(this));
	} else {
		navigator.getUserMedia(
			this.mediaConstraints,
			this.handleStream.bind(this), 
			this.handleGetUserMediaError.bind(this)
		);	
	}
};

/**
 * Handle error from getUserMedia
 * 
 * @param  {Error} error
 */
Spellcast.prototype.handleGetUserMediaError = function(error) {
	let warning = document.createTextNode("Unable to run with your browser/camera.");
	this.textOutput.appendChild(warning);
	console.error(error);
}

/**
 * Handle stream when received from getUserMedia
 * 
 * @param  {MediaStream} stream
 */
Spellcast.prototype.handleStream = function(stream) {

	// Make sure not audio tracks disabled
	let audioTracks = stream.getAudioTracks();
	audioTracks.forEach(track => track.enabled = false);

	this.video.srcObject = stream;
	this.video.onloadedmetadata = this.loadProcessorsAndListeners.bind(this);
}

/**
 * Create canvases and objects for processing, and attach event listeners
 */
Spellcast.prototype.loadProcessorsAndListeners = function() {
	let processor = this.generateVideoProcessor();

	// Bind processor to video playback and begin playback
	this.video.addEventListener('playing', processor.start.bind(processor), false);
	this.video.addEventListener('ended', processor.stop.bind(processor), false);
	this.video.addEventListener('pause', processor.stop.bind(processor), false);
	this.videoControl.addEventListener('click', this.toggleCapture.bind(this), false);

	// Bind transcription event when video pauses
	this.video.addEventListener('pause', this.transcribeGlyph.bind(this), false);	
};

Spellcast.prototype.toggleCapture = function() {
	if (this.capturing) {
		this.video.pause();
	} else {
		this.video.play();
	}
	this.capturing = !this.capturing;
}

/**
 * Make objects for processing video
 * 
 * @return {Processor}
 */
Spellcast.prototype.generateVideoProcessor = function() {
	let converter = new CastConverter(
		new OptFlowAnalyzer().init(), 
		new GlyphWriter(this.glyph)
	);
	let reader = new GlyphReader(this.glyph);
	return new Processor(
		this.video, 
		converter, 
		reader, 
		Math.floor(this.video.videoWidth)/this.downsampleRate, 
		Math.floor(this.video.videoHeight)/this.downsampleRate
	);
}

/**
 * Use Tesseract.js service worker to read in the glyph canvas and 
 * turn it into a piece of text, and place that on the screen.
 * 
 * @todo right now this is dependent on the external Tesseract service,
 *       but should look into creating a custom client-side service running
 *       locally to optimize processing and possibly create a custom
 *       dictionary of symbols
 */
Spellcast.prototype.transcribeGlyph = function() {
	Tesseract.recognize(this.glyph)
	.then((result) => {
		let text = document.createTextNode(result.symbols[0].text);
		this.textOutput.appendChild(text);
	})
	.catch(err => console.error(err));
}

let spellcast = new Spellcast();
document.body.onload = spellcast.boot.bind(spellcast);

