import CastConverter from './CastConverter.js';
import OptFlowAnalyzer from './OptFlowAnalyzer.js';
import GlyphWriter from './GlyphWriter.js';

export default function Processor() {
};

Processor.prototype.process = function() {
	window.requestAnimationFrame(this.process.bind(this));
	this.ctxInput.drawImage(video, 0, 0, 64, 48);
	let imageData = this.ctxInput.getImageData(0, 0, 64, 48);
	this.converter.convert(imageData);
};

Processor.prototype.load = function() {
	this.video = document.getElementById('video');

	// TODO: build these canvases from the video's width and height
	this.input = document.getElementById('input');
	this.ctxInput = this.input.getContext('2d', { alpha: false });
	this.output = document.getElementById('output');
	this.ctxOutput = this.output.getContext('2d', { alpha: false });

	this.converter = new CastConverter(
		new OptFlowAnalyzer().init(), 
		new GlyphWriter(this.ctxOutput)
	);

	this.video.addEventListener('playing', this.process.bind(this), false);
};

document.addEventListener("DOMContentLoaded", function(event) {
	let processor = new Processor();
	processor.load();
});
