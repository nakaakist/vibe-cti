FROM debian:bullseye-slim

# 依存パッケージのインストール
RUN apt-get update && apt-get install -y \
    wget \
    gnupg2 \
    lsb-release \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# FreeSWITCHリポジトリの追加
RUN wget -O - https://files.freeswitch.org/repo/deb/debian-release/fsstretch-archive-keyring.asc | apt-key add - \
    && echo "deb http://files.freeswitch.org/repo/deb/debian-release/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/freeswitch.list \
    && apt-get update

# FreeSWITCHのインストール
RUN apt-get install -y freeswitch \
    freeswitch-mod-commands \
    freeswitch-mod-conference \
    freeswitch-mod-console \
    freeswitch-mod-dialplan-xml \
    freeswitch-mod-dptools \
    freeswitch-mod-event-socket \
    freeswitch-mod-sofia \
    freeswitch-mod-xml-rpc \
    freeswitch-mod-xml-curl \
    freeswitch-mod-opus \
    freeswitch-mod-spandsp \
    freeswitch-mod-sndfile \
    freeswitch-mod-native-file \
    freeswitch-mod-local-stream \
    freeswitch-mod-tone-stream \
    freeswitch-mod-lua \
    && rm -rf /var/lib/apt/lists/*

# 設定ファイルをコピー
COPY conf/ /etc/freeswitch/

# ポート公開
EXPOSE 5060/tcp 5060/udp 5080/tcp 5080/udp
EXPOSE 8021/tcp
EXPOSE 16384-16484/udp

# FreeSWITCH実行ユーザー設定
RUN groupadd -r freeswitch && useradd -r -g freeswitch freeswitch \
    && chown -R freeswitch:freeswitch /etc/freeswitch \
    && chown -R freeswitch:freeswitch /var/lib/freeswitch \
    && chown -R freeswitch:freeswitch /var/log/freeswitch \
    && chown -R freeswitch:freeswitch /var/run/freeswitch

USER freeswitch

# FreeSWITCHの起動
CMD ["freeswitch", "-nc", "-nonat"]