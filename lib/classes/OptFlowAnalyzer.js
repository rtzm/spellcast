import JsFeat from 'jsfeat';

export default function OptFlowAnalyzer(video, writer) {
	/**
	 * Video to be returned from getUserMedia
	 * TODO: figure out how this is going to be read in, and how it is
	 * going to be turned into ImageData
	 * 
	 * @type {?}
	 */
	this.video = video;

	/**
	 * Writer that handles output to a line-drawn image
	 * @type {GlyphWriter}
	 */
	this.writer = writer;

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

/**
 * Initialize the JsFeat analysis for optical flow of each frame
 * 
 * @return {OptFlowAnalyzer} this object, for fluid interface
 */
OptFlowAnalyzer.prototype.init = function() {
	// TODO: replace magic numbers for width and height with properties
	let width = 64;
	let height = 48;

	this.prev_img_pyr = new JsFeat.pyramid_t(3);
	this.prev_img_pyr.allocate(width, height, JsFeat.U8_t|JsFeat.C1_t);
	this.curr_img_pyr = new JsFeat.pyramid_t(3);
  // TODO: replace magic numbers for width and height with properties
	this.curr_img_pyr.allocate(width, height, JsFeat.U8_t|JsFeat.C1_t);
	this.point_count = 0;
	this.point_status = new Uint8Array(100);
	this.prev_xy = new Float32Array(100*2);
	this.curr_xy = new Float32Array(100*2);

	// use initial corner in center for measuring
	// TODO: make this find best corners instead
	let coords = [
		{
			x: Math.round(width/2),
			y: Math.round(height/2)
		}
	];

	coords.forEach((coord) => {
		this.curr_xy[this.point_count<<1] = coord.x;
		this.curr_xy[(this.point_count<<1)+1] = coord.y;
		this.point_count++;
	});

	return this;
};

OptFlowAnalyzer.prototype.parse = function() {
	// TODO: actually get imageData from this.video
	let imageData = [];

	// TODO: set this up in a loop while there's new imageData
	this.parseNext(imageData);
	
	// TODO: compare this.curr_xy against this.prev_xy and 
	// generalize. Is that the right information to glean here?
};

/**
 * Parse the next image from the video using jsfeat's Lucas-Kanade
 * optical flow analysis tracker. Mimicking usage in 
 * https://inspirit.github.io/jsfeat/sample_oflow_lk.html
 * 
 * @param  {ImageData} imageData data from a single image of data
 * @return {OptFlowAnalyzer} this object, for fluid interface
 */
OptFlowAnalyzer.prototype.parseNext = function(imageData) {

  // swap flow data
  // TODO: add comment to explain what's going on here
  let _pt_xy = this.prev_xy;
  this.prev_xy = this.curr_xy;
  this.curr_xy = _pt_xy;
  let _pyr = this.prev_img_pyr;
  this.prev_img_pyr = this.curr_img_pyr;
  this.curr_img_pyr = _pyr;

  // TODO: replace magic numbers for width and height with properties
	JsFeat.imgproc.grayscale(imageData.data, 64, 48, this.curr_img_pyr.data[0]);
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

	return this;
};

OptFlowAnalyzer.prototype.getVideo = function() {
	return this.video;
};

OptFlowAnalyzer.prototype.getAverageVector = function() {
	let n = this.point_count;

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

	return summedVectors.map(x => x/n);
};