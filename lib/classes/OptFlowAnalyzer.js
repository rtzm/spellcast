import JsFeat from 'jsfeat';

export default function OptFlowAnalyzer(video) {
	this.video = video;

	// default configurations
	/**
	 * From jsfeat:
	 * "stop searching after the specified maximum number of iterations"
	 * 
	 * @type {Number}
	 */
	this.max_iterations = 30;

	/**
	 * From jsfeat:
	 * "size of the search window at each pyramid level"
	 * 
	 * @type {Number}
	 */
	this.win_size = 20;

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
	 * From jsfeat:
	 * "previous frame 8-bit pyramid_t"
	 *
	 * @type {JsFeat.pyramid_t}
	 */
	this.prev_img_pyr;

	/**
	 * From jsfeat:
	 * "current frame 8-bit pyramid_t"
	 *
	 * @type {JsFeat.pyramid_t}
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

OptFlowAnalyzer.prototype.init = function() {
	this.prev_img_pyr = new JsFeat.pyramid_t(3);
	this.prev_img_pyr.allocate(640, 480, JsFeat.U8_t|JsFeat.C1_t);
	this.curr_img_pyr = new JsFeat.pyramid_t(3);
	this.curr_img_pyr.allocate(640, 480, JsFeat.U8_t|JsFeat.C1_t);
	this.point_count = 0;
	this.point_status = new Uint8Array(100);
	this.prev_xy = new Float32Array(100*2);
	this.curr_xy = new Float32Array(100*2);
	this.curr_xy[this.point_count<<1] = 64;
	this.curr_xy[(this.point_count<<1)+1] = 48;
	this.point_count = 1;

};

OptFlowAnalyzer.prototype.parse = function() {
	// TODO: actually get imageData from this.video
	let imageData = [];

	this.parseNext(imageData);
	
	// TODO: compare this.curr_xy against this.prev_xy and 
	// generalize. Is that the right information to glean here?
};

/**
 * Parse the next image from the video using jsfeat's Lucas-Kanade
 * optical flow analysis tracker. Mimicking usage in 
 * https://inspirit.github.io/jsfeat/sample_oflow_lk.html
 *
 * @todo Finish this function, using TDD, and matching the example
 * from jsfeat. What is the return value that it is supposed to return?
 * 
 * @param  {ImageData} imageData data from a single image of data
 */
OptFlowAnalyzer.prototype.parseNext = function(imageData) {

  // swap flow data
  var _pt_xy = this.prev_xy;
  this.prev_xy = this.curr_xy;
  this.curr_xy = _pt_xy;
  var _pyr = this.prev_img_pyr;
  this.prev_img_pyr = this.curr_img_pyr;
  this.curr_img_pyr = _pyr;

	JsFeat.imgproc.grayscale(imageData, 640, 480, this.curr_img_pyr.data[0]);
	this.curr_img_pyr.build(this.curr_img_pyr.data[0], true);
	JsFeat.optical_flow_lk.track(
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
};

OptFlowAnalyzer.prototype.getVideo = function() {
	return this.video;
};
