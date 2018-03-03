import chai from 'chai';
import OptFlowAnalyzer from '../../lib/classes/OptFlowAnalyzer';
import {uint1String, uint2String} from '../testData/uints';

describe('OptFlowAnalyzer', function() {
  describe('#getVideo()', function() {
    it('should return the video passed in', function() {
    	let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo);
      chai.assert.equal(mockVideo, analyzer.getVideo());
    });
  });

  describe('#init()', function() {
  	it('should set default value for point count', function() {
    	let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo);
      analyzer.init();
      chai.assert.equal(analyzer.point_count, 0);      
  	});
  });

  describe('#parseNext()', function() {
  	it('should return ', function() {
  		let mockVideo = { test: "value" };
  		let analyzer = new OptFlowAnalyzer(mockVideo);
  		analyzer.init();
  		let uint1DataArray = uint1String.split(",");
			let image1Data = Uint8ClampedArray.from(uint1DataArray);
  		analyzer.parseNext(image1Data);
			let uint2DataArray = uint2String.split(",");
			let image2Data = Uint8ClampedArray.from(uint2DataArray);
  		analyzer.parseNext(image2Data);
  		analyzer.parseNext(image1Data);
  		let reduced = analyzer.curr_xy.reduce(function(total, current) {
  			return total + current;
  		});
  		chai.assert.equal(reduced, "something else");
  	});
  });
});
