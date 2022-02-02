FROM tr1-docker.jfrog.io/node:16-alpine
WORKDIR /app
RUN apk add --no-cache git
COPY . .
RUN npm install
RUN npm run verify
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "start-server"]