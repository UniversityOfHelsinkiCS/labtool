#!/bin/sh
./node_modules/.bin/sequelize db:drop --env $1;
./node_modules/.bin/sequelize db:create --env $1 &&
./node_modules/.bin/sequelize db:migrate --env $1 &&
./node_modules/.bin/mocha -R spec &&
./node_modules/.bin/sequelize db:drop --env $1
