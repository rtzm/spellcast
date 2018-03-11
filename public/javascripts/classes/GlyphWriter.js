export default function GlyphWriter(outputContext) {
	this.outputContext = outputContext;
	this.currentPosition = [ 
		Math.round(outputContext.width/2), 
		Math.round(outputContext.height/2)
	]
};

/**
 * Write to the outputContext using the given vector
 *
 * @todo Make this actually do something
 * @param  {Array} vector an x and y vector
 */
GlyphWriter.prototype.write = function(vector) {
	console.log(vector);
}
