FROM node:8-wheezy
WORKDIR /code
COPY labtool2.0/package.json .
COPY labtool2.0/package.json package-lock.json ./
RUN npm install
COPY ./labtool2.0 .
ENV PATH=".:${PATH}"
EXPOSE 3000
CMD [ "npm", "run" ]
