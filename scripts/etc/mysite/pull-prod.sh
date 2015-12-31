#!/bin/bash

DIR="/home/mysite"

cd $DIR
unset GIT_DIR
git pull origin prod

