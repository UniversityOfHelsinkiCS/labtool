FROM node:8-wheezy
ADD ./labtool2.0 /code
WORKDIR /code
COPY ./labtool2.0/package.json ../
COPY ./labtool2.0/package.json ../package-lock.json
RUN npm install
ENV PATH=".:${PATH}"
EXPOSE 3000
CMD [ "npm", "start" ]
