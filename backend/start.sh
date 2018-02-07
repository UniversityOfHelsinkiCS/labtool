#!/bin/sh
NPM=`which npm`
# $NPM dropdb # not sure if ok since production server db data should persist.
$NPM createdb # should fail if db already exists.
$NPM migrate
$NPM start
