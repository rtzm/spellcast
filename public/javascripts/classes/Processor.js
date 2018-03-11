import CastConverter from './CastConverter.js';
import OptFlowAnalyzer from './OptFlowAnalyzer.js';
import GlyphWriter from './GlyphWriter.js';

export default function Processor(video, input, output) {
	this.video = video;

	this.ctxInput = input.getContext('2d', { alpha: false });
	this.output = output;
	this.converter = new CastConverter(
		new OptFlowAnalyzer().init(), 
		new GlyphWriter(output)
	);
	this.requestId;
	this.video.addEventListener('playing', this.process.bind(this), false);
	this.video.addEventListener('ended', this.stop.bind(this), false);
	this.video.addEventListener('pause', this.stop.bind(this), false);
};

Processor.prototype.process = function() {
	this.requestId = window.requestAnimationFrame(this.process.bind(this));
	this.ctxInput.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
	let imageData = this.ctxInput.getImageData(0, 0, video.videoWidth, video.videoHeight);
	this.converter.convert(imageData);
};

Processor.prototype.stop = function() {
	window.cancelAnimationFrame(this.requestId);
}

document.body.onload = function(event) {
	let video = document.getElementById('video');
	this.video.addEventListener('loadeddata', () => {
		console.log(video.videoHeight);
		// TODO: build these canvases from the video's width and height
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
		new Processor(video, input, output);
	}, false);
};
