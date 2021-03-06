#!/bin/sh
if [ -e /data/scripts_labtool_2018k/setup.sh ] # will fail if setup.sh is not found. setup.sh should only be found on the test server.
then
echo "running setup.sh"
/data/scripts_labtool_2018k/setup.sh
fi
NPM=`which npm`
# $NPM dropdb # not sure if ok since production server db data should persist.
$NPM run createdb # should fail if db already exists.
$NPM run migrate  # Also should find out how I get docker env.. ahh lol.. lets build.
if [ -e /data/scripts_labtool_2018k/before_start.sh ] # Same idea as with setup.sh.
then
echo "running before_start.sh"
/data/scripts_labtool_2018k/before_start.sh
fi
$NPM start #
