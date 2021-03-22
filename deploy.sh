#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/src/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git remote add origin https://github.com/frasermcc9/overcord
git push -f -u origin master:gh-pages

cd -
