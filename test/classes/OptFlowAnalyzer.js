import chai from 'chai';
import OptFlowAnalyzer from '../../lib/classes/OptFlowAnalyzer';
import MockImageData from '../testData/MockImageData';
import {uint1String, uint2String} from '../testData/uints';

let mockWriter = function() {
  this.writer = function(input) { return input; };
};

describe('OptFlowAnalyzer', function() {
  describe('#getVideo()', function() {
    it('should return the video passed in', function() {
    	let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter);
      chai.assert.equal(mockVideo, analyzer.getVideo());
    });
  });

  describe('#init()', function() {
  	it('should set default value for point count', function() {
    	let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();
      chai.assert.equal(analyzer.point_count, 1);      
  	});
  });

  describe('#parseNext()', function() {

    // TODO: why do points get dropped if this is too many new frames?
    it('should not drop points', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      // make a bunch of new frames and shift
      for (let i = 0; i < 12; i++) {
        let nextFrame = current.makeShiftedImage("left");
        analyzer.parseNext(nextFrame);
        current = nextFrame;
      }

      let indexOfPoint = (analyzer.point_count<<1)-2;
      chai.assert.equal(analyzer.point_status[indexOfPoint], 1);
    });

    it('should return correctly shifted coordinates for corner on an image shifted left', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a bunch of new frames and shift
      for (let i = 0; i < 12; i++) {
        let nextFrame = current.makeShiftedImage("left");
        analyzer.parseNext(nextFrame);
        current = nextFrame;
      }

      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // The algorithm can be off slightly, so let's see if it matches 
      // to 5 decimal places
      let sigFigs = 2;
      let factor = Math.pow(10, sigFigs);
      chai.assert.equal(        
        Math.round(analyzer.curr_xy[indexOfFirstY] * factor) / factor, 
        Math.round(initialXY[indexOfFirstY] * factor) / factor
      );

      chai.assert.isAbove(
        analyzer.curr_xy[indexOfFirstX], 
        initialXY[indexOfFirstX]
      );
  	});

    it('should return correctly shifted coordinates for corner on an image shifted right', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a bunch of new frames and shift
      for (let i = 0; i < 12; i++) {
        let nextFrame = current.makeShiftedImage("right");
        analyzer.parseNext(nextFrame);
        current = nextFrame;
      }

      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // The algorithm can be off slightly, so let's see if it matches 
      // to 5 decimal places
      let sigFigs = 2;
      let factor = Math.pow(10, sigFigs);
      chai.assert.equal(        
        Math.round(analyzer.curr_xy[indexOfFirstY] * factor) / factor, 
        Math.round(initialXY[indexOfFirstY] * factor) / factor
      );

      chai.assert.isBelow(
        analyzer.curr_xy[indexOfFirstX], 
        initialXY[indexOfFirstX]
      );
    });

    it('should return correctly shifted coordinates for corner on an image shifted up', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a bunch of new frames and shift
      for (let i = 0; i < 12; i++) {
        let nextFrame = current.makeShiftedImage("up");
        analyzer.parseNext(nextFrame);
        current = nextFrame;
      }
      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // The algorithm can be off slightly, so let's see if it matches 
      // to 5 decimal places
      let sigFigs = 2;
      let factor = Math.pow(10, sigFigs);
      chai.assert.equal(        
        Math.round(analyzer.curr_xy[indexOfFirstX] * factor) / factor, 
        Math.round(initialXY[indexOfFirstX] * factor) / factor
      );

      chai.assert.isAbove(        
        analyzer.curr_xy[indexOfFirstY], 
        initialXY[indexOfFirstY]
      );
    });

    it('should return correctly shifted coordinates for corner on an image shifted down', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();
      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a bunch of new frames and shift
      for (let i = 0; i < 12; i++) {
        let nextFrame = current.makeShiftedImage("down");
        analyzer.parseNext(nextFrame);
        current = nextFrame;
      }

      // The algorithm can be off slightly, so let's see if it matches 
      // to 5 decimal places
      let sigFigs = 2;
      let factor = Math.pow(10, sigFigs);
      chai.assert.equal(        
        Math.round(analyzer.curr_xy[indexOfFirstX] * factor) / factor, 
        Math.round(initialXY[indexOfFirstX] * factor) / factor
      );

      chai.assert.isBelow(
        analyzer.curr_xy[indexOfFirstY], 
        initialXY[indexOfFirstY]
      );
    });
  });

  describe('#getAverageVector()', function() {
    it('should return give negative X vector on right-shifted frames', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();
      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a new frame and shift
      let nextFrame = current.makeShiftedImage("right");
      let avg = analyzer.parseNext(nextFrame).getAverageVector();

      chai.assert.isBelow(avg[0], 0, "x vector should be negative");
      chai.assert.equal(Math.round(avg[1]), 0, "y vector should be zero");
    });

    it('should return give positive X vector on left-shifted frames', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();
      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a new frame and shift
      let nextFrame = current.makeShiftedImage("left");
      let avg = analyzer.parseNext(nextFrame).getAverageVector();

      chai.assert.isAbove(avg[0], 0, "x vector should be positive");
      chai.assert.equal(Math.round(avg[1]), 0, "y vector should be zero");
    });

    it('should return give positive Y vector on up-shifted frames', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();
      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a new frame and shift
      let nextFrame = current.makeShiftedImage("up");
      let avg = analyzer.parseNext(nextFrame).getAverageVector();

      chai.assert.equal(Math.round(avg[0]), 0, "x vector should be zero");
      chai.assert.isAbove(avg[1], 0, "y vector should be positive");
    });

    it('should return give negative Y vector on down-shifted frames', function() {
      let mockVideo = { test: "value" };
      let analyzer = new OptFlowAnalyzer(mockVideo, mockWriter).init();
      let indexOfFirstX = (analyzer.point_count<<1)-2;
      let indexOfFirstY = (analyzer.point_count<<1)-1;

      // Parse first mock frame
      let current = new MockImageData(64, 48);
      current.setData();
      analyzer.parseNext(current);

      let initialXY = analyzer.prev_xy;

      // make a new frame and shift
      let nextFrame = current.makeShiftedImage("down");
      let avg = analyzer.parseNext(nextFrame).getAverageVector();

      chai.assert.equal(Math.round(avg[0]), 0, "x vector should be zero");
      chai.assert.isBelow(avg[1], 0, "y vector should be negative");
    });


  });
});
