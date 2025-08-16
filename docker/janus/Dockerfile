FROM debian:bullseye-slim

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    libmicrohttpd-dev \
    libjansson-dev \
    libssl-dev \
    libsofia-sip-ua-dev \
    libglib2.0-dev \
    libopus-dev \
    libogg-dev \
    libcurl4-openssl-dev \
    liblua5.3-dev \
    libconfig-dev \
    pkg-config \
    gengetopt \
    libtool \
    automake \
    build-essential \
    wget \
    git \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# libnice (ICE実装) のインストール
RUN cd /tmp && \
    git clone https://gitlab.freedesktop.org/libnice/libnice && \
    cd libnice && \
    git checkout 0.1.18 && \
    ./autogen.sh && \
    ./configure --prefix=/usr && \
    make && make install && \
    rm -rf /tmp/libnice

# libsrtp2のインストール
RUN cd /tmp && \
    wget https://github.com/cisco/libsrtp/archive/v2.4.2.tar.gz && \
    tar xfv v2.4.2.tar.gz && \
    cd libsrtp-2.4.2 && \
    ./configure --prefix=/usr --enable-openssl && \
    make shared_library && make install && \
    rm -rf /tmp/libsrtp-2.4.2 /tmp/v2.4.2.tar.gz

# usrsctp (データチャネル用) のインストール
RUN cd /tmp && \
    git clone https://github.com/sctplab/usrsctp && \
    cd usrsctp && \
    ./bootstrap && \
    ./configure --prefix=/usr --disable-programs --disable-inet --disable-inet6 && \
    make && make install && \
    rm -rf /tmp/usrsctp

# libwebsocketsのインストール
RUN cd /tmp && \
    git clone https://github.com/warmcat/libwebsockets.git && \
    cd libwebsockets && \
    git checkout v4.3-stable && \
    mkdir build && \
    cd build && \
    cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" .. && \
    make && make install && \
    rm -rf /tmp/libwebsockets

# Janusのインストール
RUN cd /tmp && \
    git clone https://github.com/meetecho/janus-gateway.git && \
    cd janus-gateway && \
    git checkout v1.1.4 && \
    sh autogen.sh && \
    ./configure --prefix=/opt/janus \
        --enable-websockets \
        --enable-data-channels \
        --disable-rabbitmq \
        --disable-mqtt \
        --disable-unix-sockets && \
    make && make install && \
    rm -rf /tmp/janus-gateway

# 設定ファイルをコピー
COPY conf/ /opt/janus/etc/janus/

# 実行ユーザーの作成
RUN useradd -r -s /bin/false janus && \
    chown -R janus:janus /opt/janus

# ライブラリパスの設定
ENV LD_LIBRARY_PATH=/usr/local/lib:/usr/lib:/opt/janus/lib

USER janus

EXPOSE 8088 8089 8188 8989 7088 10000-10100/udp

CMD ["/opt/janus/bin/janus", "-F", "/opt/janus/etc/janus"]