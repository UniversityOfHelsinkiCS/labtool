FROM node:24-alpine

ARG NODE_ENV=production

ENV TZ="Europe/Helsinki"
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app-root/src

COPY ./package* ./.npmrc ./
RUN npm ci --only=production
COPY . .

ENV PATH=".:${PATH}"

EXPOSE 3001

CMD [ "sh", "start.sh" ]
