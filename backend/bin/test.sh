#!/bin/sh
node_modules/.bin/sequelize db:drop --env test
node_modules/.bin/sequelize db:create --env test
node_modules/.bin/mocha -R spec
node_modules/.bin/sequelize db:drop --env test
