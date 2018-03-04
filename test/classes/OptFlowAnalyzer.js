import chai from 'chai';
import OptFlowAnalyzer from '../../lib/classes/OptFlowAnalyzer';
import MockImageData from '../testData/MockImageData';
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
      chai.assert.equal(analyzer.point_count, 1);      
  	});
  });

  describe('#parseNext()', function() {
  	xit('should return shifted values', function() {
  		let mockVideo = { test: "value" };
  		let analyzer = new OptFlowAnalyzer(mockVideo);
  		analyzer.init();
  		let uint1DataArray = uint1String.split(",");
      console.log("length of uint1DataArray is " + uint1DataArray.length);
			let image1Data = Uint8ClampedArray.from(uint1DataArray);
  		analyzer.parseNext(image1Data);
  		let reducedInitial = analyzer.curr_xy.reduce(function(total, current) {
  			return total + current;
  		});
			let uint2DataArray = uint2String.split(",");
      console.log("length of uint2DataArray is " + uint2DataArray.length);
			let image2Data = Uint8ClampedArray.from(uint2DataArray);
  		analyzer.parseNext(image2Data);
  		// analyzer.parseNext(image1Data);
  		let reducedEnd = analyzer.curr_xy.reduce(function(total, current) {
  			return total + current;
  		});
  		chai.assert.notEqual(reducedInitial, reducedEnd);
  		chai.assert.notEqual(
  			analyzer.curr_xy.findIndex(x => x === 64), 
  			analyzer.prev_xy.findIndex(x => x === 64)
  		);
    });

    it('should return ___ for image shifted left', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo);
      analyzer.init();

      // Parse first mock frame
      let mockFrame1 = new MockImageData();
      mockFrame1.setData();
      analyzer.parseNext(mockFrame1);

      // Parse second mock frame
      let mockFrame2 = mockFrame1.makeShiftedImage("left");
      console.log(mockFrame2.data);
      analyzer.parseNext(mockFrame2);

      chai.assert.equal(
        analyzer.prev_xy, 
        0
      );
  	});
  });
});
