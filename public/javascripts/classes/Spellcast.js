import CastConverter from './CastConverter.js';
import OptFlowAnalyzer from './OptFlowAnalyzer.js';
import GlyphWriter from './GlyphWriter.js';
import Processor from './Processor.js';

export default function Spellcast() {
	/**
	 * The video element that will be sourced with getUserMedia's MediaStream.
	 * Set playsinline to true so that iOS doesn't make it go full screen on play.
	 * Also mute it, just in case.
	 */
	this.video = document.createElement('video');
	this.video.setAttribute("playsinline", true);
	this.video.setAttribute("muted", true);

	/**
	 * The text output div element that will hold the final OCR'ed symbol
	 */
	this.textOutput;

	/**
	 * The canvas element that the outcome of all the processing will
	 * be written to.
	 */
	this.glyph;
	
	/**
	 * The div element that holds the reticle for drawing
	 */
	this.reticleContainer;

	/**
	 * Currently capturing video
	 * 
	 * @type {Boolean}
	 */
	this.capturing = false;

	/**
	 * Currently transcribing the drawn glyph into text
	 * 
	 * @type {Boolean}
	 */
	this.transcribing = false;

	/**
	 * Transcribed text already on the page
	 * 
	 * @type {Boolean}
	 */
	this.transcribed = false;

	/**
	 * How much the video size should be reduced by
	 * 
	 * @type {Number}
	 * @default 4
	 */
	this.downsampleRate = 4;

	this.idealWidth = 120;
	this.idealHeight = 90;

	/**
	 * Media constraints for the call to getUserMedia
	 * @type {Object}
	 */
	this.mediaConstraints = { 
		audio: false, 
		video: {
			// TODO: make this exact when ready for mobile-only
			facingMode: "environment",
			// TODO: add frame rate for better mobile processing
			frameRate: 24
		}
	};
};

/**
 * Initialize the app when document has loaded
 */
Spellcast.prototype.boot = function() {
	this.videoControl = document.getElementById('video-control');
	this.glyph = document.getElementById('glyph');
	this.reticleContainer = document.getElementById('reticle-container');
	this.textOutput = document.getElementById('text-output');

	// TODO: add handling for making this work on all mobile browsers
	if (navigator.mediaDevices) {
		navigator.mediaDevices.getUserMedia(this.mediaConstraints)
		.then(this.handleStream.bind(this)) 
		.catch(this.handleGetUserMediaError.bind(this));
	} else {
		// TODO: Chrome for iOS can't use this: http://www.openradar.me/33571214
		this.displayBrowserIncompatibleErrorToPage();
	}
};

/**
 * Handle error from getUserMedia
 * 
 * @param  {Error} error
 */
Spellcast.prototype.handleGetUserMediaError = function(error) {
	this.displayBrowserIncompatibleErrorToPage();
	console.error(error);
}

Spellcast.prototype.displayBrowserIncompatibleErrorToPage = function() {
	let warning = document.createTextNode("Unable to run with your browser/camera.");
	this.textOutput.appendChild(warning);
}

/**
 * Handle stream when received from getUserMedia
 * 
 * @param  {MediaStream} stream
 */
Spellcast.prototype.handleStream = function(stream) {
	// Make sure all audio tracks disabled
	let audioTracks = stream.getAudioTracks();
	audioTracks.forEach(track => track.enabled = false);
	this.video.srcObject = stream;
	this.video.onloadedmetadata = this.loadProcessorAndListeners.bind(this);
}

/**
 * Create canvases and objects for processing, and attach event listeners
 */
Spellcast.prototype.loadProcessorAndListeners = function() {
	let processor = this.generateVideoProcessor();

	this.downsampleRate = this.updatedDownsampleRate();

	// Bind processor to video playback and begin playback
	this.video.addEventListener('playing', processor.start.bind(processor), false);
	this.video.addEventListener('ended', processor.stop.bind(processor), false);
	this.video.addEventListener('pause', processor.stop.bind(processor), false);	
	this.videoControl.addEventListener('click', this.toggleControl.bind(this), false);

	// Bind touch or mouse events in glyph canvas to drawing 
	this.reticleContainer.addEventListener('touchstart', processor.toggleRecording.bind(processor), false);
	this.reticleContainer.addEventListener('touchend', processor.toggleRecording.bind(processor), false);
	this.reticleContainer.addEventListener('click', processor.toggleRecording.bind(processor), false);
	
	// Bind transcription event when video pauses
	this.video.addEventListener('pause', this.transcribeGlyph.bind(this), false);	
};

/**
 * This would be preferable to set using WebRTC constraints, but those are 
 * inconsistently applied across browsers, especially Safari iOS.
 *
 * @return {Float} The rate at which video should be downsampled to achieve ideal
 */
Spellcast.prototype.updatedDownsampleRate = function() {
	let widthDownsample = this.video.videoWidth / this.idealWidth;
	let heightDownsample = this.video.videoHeight / this.idealHeight;
	return (widthDownsample > heightDownsample) ? 
		heightDownsample : 
		widthDownsample;
};

Spellcast.prototype.toggleControl = function() {
	if (this.transcribed) {
		window.location.reload();
	} else if (this.capturing) {
		this.video.pause();
		this.capturing = !this.capturing;
		this.videoControl.innerHTML = "Transcribing...";
	} else {
		if (this.transcribing) {
			// no-op
		} else {
			this.video.play();
			this.capturing = !this.capturing;
			this.videoControl.innerHTML = "Stop";
		}
	}
}

/**
 * Make objects for processing video
 * 
 * @return {Processor}
 */
Spellcast.prototype.generateVideoProcessor = function() {

	// TODO: replace path without public directory once serving this through Express
	let drawingImg = document.createElement('img');
	drawingImg.src = 'public/images/drawing.png';
	drawingImg.hidden = true;

	let notDrawingImg = document.createElement('img');
	notDrawingImg.src = 'public/images/notDrawing.png';
	notDrawingImg.hidden = true;

	this.reticleContainer.appendChild(drawingImg);
	this.reticleContainer.appendChild(notDrawingImg);

	let converter = new CastConverter(
		new OptFlowAnalyzer().init(), 
		new GlyphWriter(
			this.glyph, 
			this.reticleContainer,
			drawingImg,
			notDrawingImg
		)
	);
	return new Processor(
		this.video, 
		converter, 
		Math.floor(this.video.videoWidth/this.downsampleRate), 
		Math.floor(this.video.videoHeight/this.downsampleRate)
	);
}

/**
 * Use Tesseract.js service worker to read in the glyph canvas and 
 * turn it into a piece of text, and place that on the screen.
 * 
 * @todo right now this is dependent on the external Tesseract service,
 *       but should look into creating a custom client-side service running
 *       locally to optimize processing and possibly create a custom
 *       dictionary of symbols. The network request alone takes a long time on 
 *       mobile, so this would drastically optimize performance.
 */
Spellcast.prototype.transcribeGlyph = function() {
	this.transcribing = true;
	Tesseract.recognize(this.glyph)
	.then((result) => {

		if (result.symbols[0]) {

			// TODO: improve how we're parsing the text. We might want to provide all the symbols 
			// in the image and allow the user to select the "right" one
			// let symbols = result.symbols;

			// Put it on the page
			let text = document.createTextNode(result.text.trim());
			this.textOutput.appendChild(text);
			this.videoControl.innerHTML = "Reload page";
		} else {
			this.videoControl.innerHTML = "Can't parse symbol or text, try again";
		}
		
		this.transcribing = false;
		this.transcribed = true;
	})
	.catch(err => console.error(err));
}

let spellcast = new Spellcast();
document.body.onload = spellcast.boot.bind(spellcast);

