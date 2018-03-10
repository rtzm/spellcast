let CastConverter = require('classes/CastConverter');
let OptFlowAnalyzer = require('classes/OptFlowAnalyzer');
let GlyphWriter = require('classes/GlyphWriter');

let app;

app.load = () => {
	this.video = document.getElementById('video');
	this.input = document.getElementById('input');
	this.ctxInput = this.input.getContext('2d', { alpha: false });
	this.output = document.getElementById('output');
	this.ctxOutput = this.output.getContext('2d', { alpha: false });

	let analyzer = new OptFlowAnalyzer();
	let writer = new GlyphWriter(this.ctxOutput);
	let converter = new CastConverter(
		this.ctxInput, 
		analyzer, 
		writer
	);
	this.video.addEventListener('playing', converter.start, false);
};
