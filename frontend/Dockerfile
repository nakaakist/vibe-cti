FROM node:18-alpine

WORKDIR /app

# とりあえずダミーのサーバーを起動
RUN npm install -g http-server

EXPOSE 3000

# ダミーのindex.htmlを作成
RUN echo '<!DOCTYPE html><html><head><title>ViBE CTI</title></head><body><h1>ViBE CTI Frontend (Under Construction)</h1></body></html>' > index.html

CMD ["http-server", "-p", "3000", "-c-1"]