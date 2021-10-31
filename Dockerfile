FROM rust:1.56.0

RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

RUN echo "deb-src http://httpredir.debian.org/debian unstable main" >> /etc/apt/sources.list && \
    apt-get update && apt-get -y install curl cmake g++ unzip pkg-config libgexiv2-dev libssl-dev

RUN mkdir -p /tmp/opencv && cd /tmp/opencv && \
    curl -O https://codeload.github.com/Itseez/opencv/zip/2.4.12 && unzip 2.4.12 && mkdir opencv-2.4.12/build && cd opencv-2.4.12/build && \
    cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local -DWITH_JPEG=ON -DBUILD_JPEG=OFF -DJPEG_INCLUDE_DIR=/opt/libjpeg-turbo/include/ -DJPEG_LIBRARY=/opt/libjpeg-turbo/lib64/libjpeg.a .. && \
    make && make install && pkg-config --cflags opencv && pkg-config --libs opencv && rm -rf /tmp/opencv


VOLUME [ "/usr/src/spellcast" ]
WORKDIR /usr/src/spellcast/wasm/draw-from-video

COPY ./wasm/draw-from-video /usr/src/spellcast/wasm/draw-from-video

CMD [ "wasm-pack", "build", "--target", "bundler" ]