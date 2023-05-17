FROM registry.access.redhat.com/ubi8/nodejs-10

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

SHELL ["/usr/bin/bash", "-c"]

COPY ./package* ./
RUN npm ci --only=production
COPY . .

ENV PATH=".:${PATH}"

EXPOSE 3001

CMD [ "sh", "start.sh" ]
