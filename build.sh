#!/bin/bash
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