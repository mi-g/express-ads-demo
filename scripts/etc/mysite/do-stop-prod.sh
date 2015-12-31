#!/bin/bash

DIR="/home/mysite"

(
. /home/git/.nvm/nvm.sh
forever stop $DIR/app.js
)
