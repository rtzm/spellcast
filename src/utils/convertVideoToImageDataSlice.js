/**
 * ID for requestAnimationFrame
 */
let requestId;

export const convertVideoToImageDataSlices = () => {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = width;
  offscreenCanvas.height = height
  const offscreenContext = offscreenCanvas.getContext('2d', { alpha: false });
  
  requestId = window.requestAnimationFrame(convertVideoToImageDataSlices.bind(this));
	offscreenContext.drawImage(video, 0, 0, width, height);
	console.log(offscreenContext.getImageData(0, 0, width, height));
};
