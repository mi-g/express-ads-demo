#!/bin/bash

DIR="/home/mysite"
LOGFILE="/var/log/mysite.log"
LOGERRFILE="/var/log/mysite.err.log"
FEARGS="--workingDir $DIR --killSignal SIGUSR2 --minUptime 1000 --spinSleepTime 1000 -o $LOGFILE -e $LOGERRFILE -a"

(
. /home/git/.nvm/nvm.sh 
cd $DIR;
npm install;
forever $FEARGS -o - stop $DIR/app.js 2> /dev/null
forever $FEARGS start $DIR/app.js
forever list
)
