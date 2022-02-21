FROM node:16-alpine
WORKDIR /app
RUN apk add --no-cache git
COPY . .
RUN rm -rf app/
RUN npm install
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "start-server"]