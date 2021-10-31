extern crate console_error_panic_hook;

use std::panic;
use wasm_bindgen::prelude::*;
use web_sys::console;
use js_sys;
use correlation_flow::micro_rfft;
use image::io::Reader as ImageReader;
use rustflow::coarse2fine_flow;

#[wasm_bindgen]
pub fn draw(img_array1: &[u8], img_array2: &[u8]) -> Result<js_sys::Int16Array, JsValue> {
    // TODO: Remove this debugging:
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    /**
     * TODO: crop this smarter (I think the phase correlation library
     * expects each pixel to be one entry in this slice. Either change the underlying library
     * (opencv?) or determine how to represent RGBA array as correct grayscale values in array.
     * Or should we make one channel for each color, find phase correlations for each channel,
     * and average?
     * 
     * Or maybe this would be more accurate by cropping in a way that maintains the aspect ratio?
     * 
     * Or, again, should we grayscale using algorithms from here: https://coaxion.net/blog/2018/01/speeding-up-rgb-to-grayscale-conversion-in-rust-by-a-factor-of-2-2-and-various-other-multimedia-related-processing-loops
     */
    let img_array_crop1 = &img_array1[0..4095];
    let img_array_crop2 = &img_array2[0..4095];

    // TODO: replace this with image from javascript
    let img1 = match ImageReader::open(img1_path).unwrap().decode() {
        Ok(img) => img,
        Err(err) => Err(err),
    };
    let img2 = match ImageReader::open(img2_path).unwrap().decode() {
        Ok(img) => img,
        Err(err) => Err(err),
    };

    let flow = coarse2fine_flow(&img1, &img2, 0.012, 0.75, 20, 7, 1, 30);

    Ok(get_average_flow_vector(flow));
    let mut correlator = micro_rfft::MicroFftContext::new();
    let mut last_flow = (0i16, 0i16);
    last_flow = correlator.measure_translation(&img_array_crop1, &img_array_crop2);

    let output = js_sys::Int16Array::new_with_length(2);
    js_sys::Int16Array::set_index(&output, 0, last_flow.0);
    js_sys::Int16Array::set_index(&output, 1, last_flow.1);
    Ok(output)
}
