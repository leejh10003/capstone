#!/bin/bash
set -euo pipefail

: "${VUE_APP_GRAPHQL_HTTP:?VUE_APP_GRAPHQL_HTTP must be set before the production build}"
: "${VUE_APP_GRAPHQL_WS:?VUE_APP_GRAPHQL_WS must be set before the production build}"
: "${VUE_APP_S3_PUBLIC_URL:?VUE_APP_S3_PUBLIC_URL must be set before the production build}"

if [ ! -f /home/ubuntu/aws-exports.js ]; then
  echo '/home/ubuntu/aws-exports.js is required and must be provisioned outside Git.' >&2
  exit 1
fi

mv /home/ubuntu/frontend.zip /home/ubuntu/deploy/frontend.zip
cd /home/ubuntu/deploy
unzip frontend.zip
rm frontend.zip
cp /home/ubuntu/aws-exports.js /home/ubuntu/deploy/src
\. ~/.nvm/nvm.sh
\. ~/.profile
\. ~/.bashrc
nvm use 14.7.0
yarn install
yarn build
