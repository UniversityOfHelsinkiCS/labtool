FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3002

CMD ["node", "index.js"]
