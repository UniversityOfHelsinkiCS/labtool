FROM node:8-wheezy
ADD ./ /code
WORKDIR /code
COPY ./package.json ./
RUN npm install
ENV PATH=".:${PATH}"
EXPOSE 3000
CMD [ "sh", "start.sh" ]
