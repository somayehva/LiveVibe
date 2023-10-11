FROM node:alpine3.18
WORKDIR /usr/src/live-vibe
COPY . .
RUN npm install
CMD ["node", "server.js"]
EXPOSE 3000

