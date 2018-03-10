FROM node:8-wheezy
ADD ./labtool2.0 /code
WORKDIR /code
COPY ./labtool2.0/package.json ../
RUN npm install
RUN npm run build
RUN npm install -g serve
ENV PATH=".:${PATH}"
EXPOSE 3000
CMD [ "./node_modules/.bin/serve", "-p", "3000", "-s", "build" ]
