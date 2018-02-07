#!/bin/sh
NPM=`which npm`
$NPM dropdb
$NPM createdb
$NPM migrate
$NPM start
