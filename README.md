# spellcast

This project uses an algorithm to turn video from smart phones into lines drawn on the screen. It then tries to read the symbol you've just drawn with your phone and puts that down on the screen too. The idea is that it sort of turns your phone into a wand that you can use to trace computer-readable symbols which can then be used maybe for a game, for remote input, or whatever.

All of the video and image processing happens on your phone, so no video or image data is sent over any networks. Only the line drawing that you've drawn is sent over a network. Because this relies so heavily on the technology in your browser, it might not work on some older or unsupported mobile browsers. This project is, obviously, currently under development.

## Algorithm

When you click the Start button, the algorithm begins reading the images from your camera into a canvas element. It then finds the best points for analysis in the image using YAPE06 corner detection, and reads those corners into a frame-by-frame analysis called Lukas-Kanade optical flow. (Both the corner detection and the optical flow analysis are supplied by a library called [jsfeat](https://inspirit.github.io/jsfeat/). This gives the general flow of 100 or so points in the image, which can be averaged to give the overall directional movement of the camera. This is then read back into a canvas element on the screen as the red line drawing you see. When you click the Stop button, that drawing is processed by an OCR library called [Tesseract.js](http://tesseract.projectnaptha.com/), which returns the first (farthest to the left) symbol that it can read.

## Developing

Right, the proof of concept is being served statically from the index.html, but there is also an express app. You can clone the repo down and run it locally using: `DEBUG=spellcast:* npm start`.
