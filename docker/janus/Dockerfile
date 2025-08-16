FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# ビルド要件のインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git pkg-config cmake \
    libglib2.0-dev libssl-dev libjansson-dev libconfig-dev \
    libnice-dev libsrtp2-dev libmicrohttpd-dev \
    libwebsockets-dev libsofia-sip-ua-dev zlib1g-dev \
    ca-certificates wget curl && \
    rm -rf /var/lib/apt/lists/*

# Autotoolsをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf automake libtool && \
    rm -rf /var/lib/apt/lists/*

# Janusのビルド
ARG JANUS_TAG=v1.1.4
WORKDIR /opt
RUN git clone https://github.com/meetecho/janus-gateway.git && \
    cd janus-gateway && git checkout ${JANUS_TAG} && \
    sh autogen.sh && \
    ./configure --prefix=/usr \
                --enable-websockets \
                --disable-data-channels && \
    make -j$(nproc) && make install && make configs && ldconfig && \
    cd / && rm -rf /opt/janus-gateway

# 設定ファイルをコピー
COPY conf/ /usr/etc/janus/

EXPOSE 8088 8089 8188 8989 7088 10000-10100/udp

# デフォルト設定で起動（HTTPとWebSocketsを有効化）
CMD ["janus"]