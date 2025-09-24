#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# place .nojekyll to bypass Jekyll processing
echo > .nojekyll

# init git inside dist
git init
git add -A
git commit -m "deploy"

# push to your repository (main branch)
git push -f https://github.com/wens20005/wens20005.github.io.git main

cd -