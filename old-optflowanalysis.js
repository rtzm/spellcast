const cv = require('opencv');
const path = require('path');

// relies heavily on the optical flow example from node-opencv: https://github.com/peterbraden/node-opencv/blob/master/examples/optical-flow.js

// TODO: currently hardcoded video, grab video from user in future
const cap = new cv.VideoCapture(path.join(__dirname, 'lib', 'test_videos', 'letter_w_small.m4v'));

// Parameters for lucas kanade optical flow
const lk_params = {
  winSize: [15, 15],
  maxLevel: 2,
  criteria: [cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 30, 0.03]
};

const feature_params = {
  maxCorners: 100,
  qualityLevel: 0.1,
  minDistance: 10
};

// Create some random colors
let color = [255, 0, 0];


// to generate camera:
// try {
//   var camera = new cv.VideoCapture(0);
//   var window = new cv.NamedWindow('Video', 0)

//   setInterval(function() {
//     camera.read(function(err, im) {
//       if (err) throw err;
//       console.log(im.size())
//       if (im.size()[0] > 0 && im.size()[1] > 0){
//         window.show(im);
//       }
//       window.blockingWaitKey(0, 50);
//     });
//   }, 20);

// } catch (e){
//   console.log("Couldn't start camera:", e)
// }
flow_vectors = {};
let i = 0;

// Take first frame and find corners in it
cap.read(function(err, firstFrame) {
  if (err) throw err;

  let old_frame = firstFrame;
  // var window = new cv.NamedWindow('Video', 0)

  // Create a mask image for drawing purposes
  function read() {
    let out = old_frame.copy();
    cap.read(function(err, newFrame) {
      if (err) throw err;

      let frameSize = newFrame.size();

      if ( frameSize[0] > 0 && frameSize[1] > 0) {
        let goodFeatures = old_frame.goodFeaturesToTrack(feature_params.maxCorners, feature_params.qualityLevel, feature_params.minDistance);

        // calculate optical flow
        let flow = old_frame.calcOpticalFlowPyrLK(newFrame, goodFeatures, lk_params.winSize, lk_params.maxLevel, lk_params.criteria);
        flow_vectors[i] = [];
        // compute average differences
        for(let j = 0; j < flow.old_points.length; j++){
          if(flow.found[j]){
            flow_vectors[i].push({ x: flow.new_points[j][0] - flow.old_points[j][0],
                                   y: flow.new_points[j][0] - flow.old_points[j][0] });
          }
        }
        let totalX = flow_vectors[i].reduce((acc, vector) => {
          return acc + vector['x'];
        }, 0);
        let totalY = flow_vectors[i].reduce((acc, vector) => {
          return acc + vector['y'];
        }, 0);
        console.log([ totalX/flow_vectors[i].length, totalY/flow_vectors[i].length ]);
        i++;

        // Select good points

        // draw the tracks
        // for(let i = 0; i < flow.old_points.length; i++){
        //   if(flow.found[i]){
        //     out.line(flow.old_points[i], flow.new_points[i], color);
        //   }
        // }

        // window.show(out);
        // window.blockingWaitKey(0, 50);


        old_frame = newFrame.copy();
        read();
      }
    });
  }

  read();
});
