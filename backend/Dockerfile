FROM node:8
ADD ./ /code
WORKDIR /code
COPY ./package.json ./
RUN npm ci --only=production
ENV PATH=".:${PATH}"
EXPOSE 3001
CMD [ "sh", "start.sh" ]
