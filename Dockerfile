FROM node:8-wheezy
ADD ./labtool2.0 /code
WORKDIR /code
COPY ./labtool2.0/package.json ../
RUN npm install
RUN npm run build
ENV PATH=".:${PATH}"
EXPOSE 3000
CMD [ "npm", "start" ]
