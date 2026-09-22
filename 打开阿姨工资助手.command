#!/bin/zsh
cd "$(dirname "$0")"
open -a "Google Chrome" "http://127.0.0.1:4399"
node serve.js
