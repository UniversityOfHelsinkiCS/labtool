FROM registry.access.redhat.com/ubi7/nodejs-8

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

#Install serve package
RUN npm install -g serve@6.5.8

# Setup
COPY ./labtool2.0/package* ../
RUN npm ci
COPY ./labtool2.0 ./
RUN npm run build

#Export path properly
ENV PATH=".:${PATH}"

#Expose listen port
EXPOSE 3000

ENTRYPOINT ["serve"]
CMD [ "-p", "3000", "-s", "build" ]
