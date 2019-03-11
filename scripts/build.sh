# setup env
set -e

# Install node and modules
# TBD
npm install

# Version of node and npm
npm -v
node -v

#run eslint
npx eslint ./src/
npx eslint ./test/

# test
npm test

# Code coverage
# TBD
