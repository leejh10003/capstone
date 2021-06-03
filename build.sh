#!/bin/bash
mv /home/ubuntu/frontend.zip /home/ubuntu/deploy/frontend.zip
cd /home/ubuntu/deploy
unzip frontend.zip
rm frontend.zip
\. ~/.nvm/nvm.sh
\. ~/.profile
\. ~/.bashrc
nvm use 14.7.0
yarn install
yarn build