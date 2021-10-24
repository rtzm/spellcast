export default function OptFlowAnalyzer() {
	/**
	 * From jsfeat:
	 * "stop searching after the specified maximum number of iterations"
	 * 
	 * @type {Number}
	 */
	this.max_iterations = 15;

	/**
	 * From jsfeat:
	 * "size of the search window at each pyramid level"
	 * 
	 * @type {Number}
	 */
	this.win_size = 15;

	/**
	 * From jsfeat:
	 * "stop searching when the search window moves by less than eps"
	 * 
	 * @type {Number}
	 */
	this.epsilon = 0.01;

	/**
	 * From jsfeat:
	 * "the algorithm calculates the minimum eigen value of a 2x2
	 * normal matrix of optical flow equations, divided by number of
	 * pixels in a window; if this value is less than min_eigen_threshold,
	 * then a corresponding feature is filtered out and its flow is not
	 * processed, it allows to remove bad points and get a performance boost"
	 * 
	 * @type {Number}
	 */
	this.min_eigen = 0.001;

	/**
	 * Laplacian threshold for YAPE06 corner detection
	 * 
	 * @type {Number}
	 */
	this.laplacian_threshold = 30;

	/**
	 * Min eigen value threshold for YAPE06 corner detection
	 * 
	 * @type {Number}
	 */
	this.min_eigen_value_threshold = 25;

	/**
	 * From jsfeat:
	 * "previous frame 8-bit pyramid_t"
	 *
	 * @type {jsfeat.pyramid_t}
	 */
	this.prev_img_pyr;

	/**
	 * From jsfeat:
	 * "current frame 8-bit pyramid_t"
	 *
	 * @type {jsfeat.pyramid_t}
	 */
	this.curr_img_pyr;

	/**
	 * From jsfeat:
	 * "number of input coordinates"
	 * 
	 * @type {Number}
	 */
	this.point_count;

	/**
	 * From jsfeat:
	 * "each element is set to 1 if the flow for the corresponding features
	 * has been found overwise 0"
	 * 
	 * @type {Uint8Array}
	 */
	this.point_status;

	/**
	 * From jsfeat: 
	 * "Array of 2D coordinates for which the flow needs to be found"
	 * 
	 * @type {Float32Array}
	 */
	this.prev_xy;

	/**
	 * From jsfeat:
	 * "Array of 2D coordinates containing the calculated new positions"
	 * 
	 * @type {Float32Array}
	 */
	this.curr_xy;
};

/**
 * Initialize the jsfeat analysis for optical flow of each frame
 *
 * @param {Int} width Width of video to be analyzed
 * @param {Int} height Height of video to be analyzed
 * @return {OptFlowAnalyzer} this object, for fluid interface
 */
OptFlowAnalyzer.prototype.init = function(width = 64, height = 48) {
	this.prev_img_pyr = new jsfeat.pyramid_t(3);
	this.prev_img_pyr.allocate(width, height, jsfeat.U8_t|jsfeat.C1_t);
	this.curr_img_pyr = new jsfeat.pyramid_t(3);
	this.curr_img_pyr.allocate(width, height, jsfeat.U8_t|jsfeat.C1_t);
	this.point_count = 0;
	this.point_status = new Uint8Array(100);
	this.prev_xy = new Float32Array(100*2);
	this.curr_xy = new Float32Array(100*2);

	return this;
};

/**
 * Parse the next image from the video using jsfeat's Lucas-Kanade
 * optical flow analysis tracker. Mimicking usage in 
 * https://inspirit.github.io/jsfeat/sample_oflow_lk.html
 * 
 * @param  {ImageData} imageData data from a single image of data
 * @return {OptFlowAnalyzer} this object, for fluid interface
 */
OptFlowAnalyzer.prototype.parse = function(imageData) {

  // swap flow data without creating new objects
  let _pt_xy = this.prev_xy;
  this.prev_xy = this.curr_xy;
  this.curr_xy = _pt_xy;
  let _pyr = this.prev_img_pyr;
  this.prev_img_pyr = this.curr_img_pyr;
  this.curr_img_pyr = _pyr;

  // Find all corners
	let matrix = this.prev_img_pyr.data[0];
	let corners = [];
	let i = imageData.width * imageData.height;
	while(i-- >= 0) {
		corners[i] = new jsfeat.keypoint_t(0,0,0,0);
	}
	jsfeat.yape06.laplacian_threshold = this.laplacian_threshold|0;
	jsfeat.yape06.min_eigen_value_threshold = this.min_eigen_value_threshold|0;
	jsfeat.yape06.detect(matrix, corners);

	// Sort corners descending by score
	corners = corners.sort((a, b) => {
		return b.score - a.score;
	});

	// Set top corners to previous coordinates
	let j = 0;
	this.prev_xy.forEach((value, index, array) => {
		if (index % 2 === 0) {
				// if even index, then place x integer
				array[index] = corners[j].x;
			} else {
				// else, place Y vector
				array[index] = corners[j].y;
				j++;
			}
	});
	this.point_count = j;

	// Make image grayscale for easier processing
	jsfeat.imgproc.grayscale(imageData.data, imageData.width, imageData.height, this.curr_img_pyr.data[0]);
	this.curr_img_pyr.build(this.curr_img_pyr.data[0], true);

	// TODO: This algorithm takes longer than anything else on the page. 
	// Attempt to optimize it by shifting the window size, max iterations, 
	// epsilon and min eigen values.
	jsfeat.optical_flow_lk.track(
		this.prev_img_pyr, 
		this.curr_img_pyr, 
		this.prev_xy, 
		this.curr_xy, 
		this.point_count, 
		this.win_size|0, 
		this.max_iterations|0, 
		this.point_status, 
		this.epsilon, 
		this.min_eigen
	);

	return this;
};

OptFlowAnalyzer.prototype.getAverageVector = function() {
	let summedVectors = this.curr_xy.reduce((runningTotals, current, index) => {
		let diff = current - this.prev_xy[index];

		if (index % 2 === 0) {
			// if even index, then this is X vector
			runningTotals[0] += diff;
		} else {
			// else, a Y vector
			runningTotals[1] += diff;
		}
		return runningTotals;
	}, [0,0]);

	return summedVectors.map(x => x/this.point_count);
};
