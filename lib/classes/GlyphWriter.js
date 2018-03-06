export default function GlyphWriter(glyph) {
	this.glyph = glyph;
	this.currentPosition = [ 
		Math.round(glyph.width/2), 
		Math.round(glyph.height/2)
	]
};

GlyphWriter.prototype.write = function(vectors) {

}
