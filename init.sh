#!/bin/sh
ls -alh /app
which Xvfb
which node
Xvfb :99 -screen 0 1024x768x16 & node ./apiserver.js
