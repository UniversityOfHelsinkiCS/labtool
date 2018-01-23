FROM node:8-wheezy
ADD ./labtool2.0 /code
WORKDIR /code
RUN npm install
ENV PATH=".:${PATH}"
EXPOSE 3000
CMD [ "npm", "run" ]
