#!/bin/sh
NPM=`which npm`
# $NPM dropdb # not sure if ok since production server db data should persist.
NODE_ENV='test' $NPM createdb # should fail if db already exists.
NODE_ENV='test' $NPM migrate  # Also should find out how I get docker env.. ahh lol.. lets build.
NODE_ENV='test' $NPM start    #
