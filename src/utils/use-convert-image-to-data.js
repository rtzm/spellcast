export const generateOffscreenContext = (width, height) => {
  let offscreenCanvas = document.getElementById("offscreen-canvas");
  // TODO: change order of operations so that we don't check for this repeatedly
  if (!!offscreenCanvas) {
    return offscreenCanvas.getContext('2d', { alpha: false });
  }
  offscreenCanvas = document.createElement("canvas");
  document.getElementById("text-output").appendChild(offscreenCanvas);
  offscreenCanvas.id = "offscreen-canvas";
  offscreenCanvas.width = width;
  offscreenCanvas.height = height
  return offscreenCanvas.getContext('2d', { alpha: false });
};

export const useConvertImageToData = (width, height) => {
  const offscreenContext = generateOffscreenContext(width, height);
	return (image) => {
    offscreenContext.drawImage(image, 0, 0, width, height)
    return offscreenContext.getImageData(0, 0, width, height).data;
  };
};
