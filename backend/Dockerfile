FROM node:8
ADD ./ /code
WORKDIR /code
COPY ./package.json ./
RUN npm install
ENV PATH=".:${PATH}"
EXPOSE 3001
CMD [ "sh", "start.sh" ]
