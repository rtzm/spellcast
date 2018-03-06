export default function MockImageData(width = 8, height = 6) {
	this.perPixel = 4;
	this.width = width;
	this.height = height;
	this.length = this.width * this.height * this.perPixel;
	this.data = new Uint8ClampedArray(this.length);
};

/**
 * Set the the mockImageData.data property to random value or 
 * to match data passed in.
 * 
 * @param {Uint8ClampedArray} data optional data to be set; will
 *                                 set to random colors if empty
 * @return {MockImageData} fluid return of this object
 */
MockImageData.prototype.setData = function(data = null) {
	
	// no data given, make random data
	// TODO: check that this isn't creating too much noise and causing false
	// negatives for our test, make it slightly less randomized
	if (!data) {
		data = this.data.map(this.randomColor);
	}

	if (!(data instanceof Uint8ClampedArray)) {
		if ((data.hasOwnProperty('length')) &&
			  (data.length === this.length)) {
			data = Uint8ClampedArray.from(data);
		} else {
			throw "Data cannot be set";
		}
	}
	this.data = data;
	return this;
};

/**
 * Random value for a 256-color subpixel RBGA value
 * 
 * @return {Int} Number between 0 and 255
 */
MockImageData.prototype.randomColor = function() {
	return Math.floor(Math.random() * 256);
}

/**
 * Makes another mock for an image shifted 1 pixel in 
 * this direction
 * 
 * @param  {string} direction "left", "right", "up", 
 *                            or "down"
 * @return {MockImageData}    The new shifted image
 */
MockImageData.prototype.makeShiftedImage = function(direction = null) {
	let newImageObject =  new MockImageData(this.width, this.height);
	
	let lengthOfPixel = this.perPixel;
	let lengthOfRow = lengthOfPixel * this.width;

	// Make array from existing data that can be manipulated
	let newDataArray = this.data.toString().split(",");
	newDataArray = newDataArray.map(x => parseInt(x, 10));

	switch (direction) {
		case "right":
			for (let i = 0; i < lengthOfPixel; i++) {
				let subpixel = newDataArray.shift();
				newDataArray.push(subpixel);
			}
			break;
		case "left":
			for (let i = 0; i < lengthOfPixel; i++) {
				let subpixel = newDataArray.pop();
				newDataArray.unshift(subpixel);
			}
			break;
		case "up":
			for (let i = 0; i < lengthOfRow; i++) {
				let subpixel = newDataArray.pop();
				newDataArray.unshift(subpixel);
			}
			break;
		case "down":
			for (let i = 0; i < lengthOfRow; i++) {
				let subpixel = newDataArray.shift();
				newDataArray.push(subpixel);
			}
			break;
	}
	newImageObject.setData(newDataArray);
	return newImageObject;
}
