FROM node:24-alpine

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

COPY ./package* ./.npmrc ./
RUN npm ci --only=production
COPY . .

ENV PATH=".:${PATH}"

EXPOSE 3001

CMD [ "sh", "start.sh" ]
