FROM node:24-alpine

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

# Setup
COPY ./labtool2.0 ./
RUN npm ci
RUN npm run build

# Static file server; security headers (CSP etc.) are in serve.json
RUN npm install -g serve@14.2.6

#Export path properly
ENV PATH=".:${PATH}"

#Expose listen port
EXPOSE 3000

ENTRYPOINT ["serve"]
# the config path is relative to the served directory
CMD [ "-l", "3000", "-s", "build", "-c", "../serve.json" ]
