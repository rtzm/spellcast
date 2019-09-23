import chai from 'chai';
import GlyphWriter from '../../public/javascripts/classes/GlyphWriter';

describe('GlyphWriter', function() {
	describe('constructor', function() {
		it("instantiates with correct width and height", function() {
			let glyphWidth = 128;
			let glyphHeight = 96;
			let mockGlyph = {
				width: glyphWidth,
				height: glyphHeight,
				getContext: function() {
					return {};
				}
			};
			let writer = new GlyphWriter(mockGlyph);

			chai.assert(writer.currentPosition, [ 64, 48 ]);
		});
	});
});
