extern crate image;
extern crate console_error_panic_hook;

use std::panic;
use wasm_bindgen::prelude::*;
use web_sys::console;
use js_sys;
use correlation_flow::micro_rfft;

// Borrowing from https://coaxion.net/blog/2018/01/speeding-up-rgb-to-grayscale-conversion-in-rust-by-a-factor-of-2-2-and-various-other-multimedia-related-processing-loops/
const RGB_Y: [u32; 4] = [19595, 38470, 7471, 0];
const IMAGE_WIDTH: usize = 64;
const IMAGE_WIDTH_STRIDE: usize = IMAGE_WIDTH * 4;

pub fn bgrx_to_gray_exact_chunks_cropped(
    in_data: &[u8]
) -> [u8; 4096] {
    let mut out_data: [u8; 4096] = [0; 4096];
    assert_eq!(in_data.len() % 4, 0);
    assert_eq!(out_data.len() % 4, 0);
    assert_eq!(out_data.len() / IMAGE_WIDTH_STRIDE, in_data.len() / IMAGE_WIDTH_STRIDE);

    let in_line_bytes = IMAGE_WIDTH_STRIDE;
    let out_line_bytes = IMAGE_WIDTH_STRIDE;

    assert!(in_line_bytes <= IMAGE_WIDTH_STRIDE);
    assert!(out_line_bytes <= IMAGE_WIDTH_STRIDE);

    for (in_line, out_line) in in_data
        .chunks_exact(IMAGE_WIDTH_STRIDE)
        .zip(out_data.chunks_exact_mut(IMAGE_WIDTH_STRIDE))
    {
        for (in_p, out_p) in in_line[..in_line_bytes]
            .chunks_exact(4)
            .zip(out_line[..out_line_bytes].chunks_exact_mut(4))
        {
            assert!(in_p.len() == 4);
            assert!(out_p.len() == 4);

            let b = u32::from(in_p[0]);
            let g = u32::from(in_p[1]);
            let r = u32::from(in_p[2]);
            let x = u32::from(in_p[3]);

            let grey = ((r * RGB_Y[0]) + (g * RGB_Y[1]) + (b * RGB_Y[2]) + (x * RGB_Y[3])) / 65536;
            let grey = grey as u8;
            out_p[0] = grey;
            out_p[1] = grey;
            out_p[2] = grey;
            out_p[3] = grey;
        }
    }

    out_data 
}


#[wasm_bindgen]
pub fn draw(img_array1: &[u8], img_array2: &[u8]) -> Result<js_sys::Int16Array, JsValue> {
    // TODO: Remove this debugging:
    panic::set_hook(Box::new(console_error_panic_hook::hook));


    let img_array_crop1 = &img_array1[0..4095];
    let img_array_crop2 = &img_array2[0..4095];
    // console::log_1(&format!("{:?}", img_array_crop1).into());
    // console::log_1(&format!("{:?}", img_array_crop2).into());

    // let output1: [u8; 4096] = bgrx_to_gray_exact_chunks_cropped(&img_array_crop1);
    // let output2: [u8; 4096] = bgrx_to_gray_exact_chunks_cropped(&img_array_crop2);
    // TODO: get grayscale to work
    // let img1 = colorops::grayscale(
    //     &match image::load_from_memory_with_format(img_array1, image::ImageFormat::Png) {
    //         Ok(img) => img,
    //         Err(error) => {
    //             console::log_1(&format!("{:?}", error).into());
    //             image::DynamicImage::new_rgba8(64, 64)
    //         }
    //     }
    // );
    // let img2 = colorops::grayscale(
    //     &match image::load_from_memory_with_format(img_array2, image::ImageFormat::Png) {
    //         Ok(img) => img,
    //         Err(error) => {
    //             console::log_1(&format!("{:?}", error).into());
    //             image::DynamicImage::new_rgba8(64, 64)
    //         }
    //     }
    // );

    // TODO: take in downsample and calculate width/height in here (slice length = 4096)

    let mut correlator = micro_rfft::MicroFftContext::new();
    let mut last_flow = (0i16, 0i16);

    last_flow = correlator.measure_translation(&img_array_crop1, &img_array_crop2);
    console::log_1(&format!("flow: {:?}", last_flow).into());

    let output = js_sys::Int16Array::new_with_length(2);
    js_sys::Int16Array::set_index(&output, 0, last_flow.0);
    js_sys::Int16Array::set_index(&output, 1, last_flow.1);
    Ok(output)
}
