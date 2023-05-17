FROM registry.access.redhat.com/ubi8/nodejs-10

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

# Setup
COPY ./labtool2.0 ./
RUN npm ci
RUN npm run build

#Install serve package
RUN npm install -g serve@6.5.8

#Export path properly
ENV PATH=".:${PATH}"

#Expose listen port
EXPOSE 3000

ENTRYPOINT ["serve"]
CMD [ "-p", "3000", "-s", "build" ]
