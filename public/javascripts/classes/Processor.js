import CastConverter from './CastConverter.js';
import OptFlowAnalyzer from './OptFlowAnalyzer.js';
import GlyphWriter from './GlyphWriter.js';
import GlyphReader from './GlyphReader.js';

export default function Processor(video, input, converter, reader) {
	this.video = video;
	this.ctxInput = input.getContext('2d', { alpha: false });

	/**
	 * Converts frames from video image data into a drawing
	 * @type {CastConverter}
	 */
	this.converter = converter;

	/**
	 * Reader that reads output from line-drawn image
	 * @type {GlyphReader}
	 */
	this.reader = reader;

	/**
	 * ID for requestAnimationFrame
	 */
	this.requestId;
};

/**
 * Starts the processor converting images frame by frame
 */
Processor.prototype.start = function() {
	this.requestId = window.requestAnimationFrame(this.start.bind(this));
	this.ctxInput.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
	let imageData = this.ctxInput.getImageData(0, 0, video.videoWidth, video.videoHeight);
	this.converter.convertFrame(imageData);
};

Processor.prototype.stop = function() {
	window.cancelAnimationFrame(this.requestId);
}

// TODO: move this into a main.js file or
// integrate into object-oriented architecture
// as much as possible
document.body.onload = function(event) {
	let video = document.getElementById('video');
	let glyph = document.getElementById('glyph');
	navigator.mediaDevices.getUserMedia({ 
		audio: false, 
		video: true
			// TODO: make this exact when ready to reliably work on mobile browsers
		// { 
			// facingMode: 
			// { exact: 
				// "environment" 
			// } 
		// }
	}).then((stream) => {
		video.srcObject = stream;
		video.onloadedmetadata = () => {
			// Make input and output canvases for processing video
			let input = document.createElement("canvas")
			input.setAttribute("id", "input")
			input.setAttribute("width", video.videoWidth)
			input.setAttribute("height", video.videoHeight);
			let output = document.createElement("canvas")
			output.setAttribute("id", "output")
			output.setAttribute("width", video.videoWidth)
			output.setAttribute("height", video.videoHeight);
			let container = document.getElementById("output-container");
			container.appendChild(output);

			// Make objects for processing canvases
			let converter = new CastConverter(
				new OptFlowAnalyzer().init(), 
				new GlyphWriter(output)
			);
			let reader = new GlyphReader(output);
			let processor = new Processor(video, input, converter, reader);

			// Bind processor to video playback
			video.addEventListener('playing', processor.start.bind(processor), false);
			video.addEventListener('ended', processor.stop.bind(processor), false);
			video.addEventListener('pause', processor.stop.bind(processor), false);

			video.play();

			// Tesseract doesn't play well with my current module set-up
			// TODO: make it work nicer and move this into GlyphReader
			// see https://github.com/naptha/tesseract.js#local-installation
			// Would also allow creating a custom dictionary of symbols
			// to speed up processing time possibly
			video.addEventListener('pause', () => {
				Tesseract.recognize(output)
				.then((result) => {
					let text = document.createTextNode(result.symbols[0].text);
					glyph.appendChild(text);
				})
				.catch(err => console.error(err));
			}, false);
		};
	}).catch((e) => {
		let warning = document.createTextNode("Unable to run with your browser/camera.");
		glyph.appendChild(warning);
		console.error(e);
	});
};

