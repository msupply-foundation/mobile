#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2019.
#
# Clean up react native caches.

TMPDIR_PACKAGER=$TMPDIR/react-native-packager-*
TMPDIR_METRO=$TMPDIR/metro-bundler-*

echo "Cleaning up temporary files..."
rm -rf $TMPDIR_PACKAGER $TMPDIR_METRO
echo "Cleaning up watchman files..."
npx watchman watch-del-all
echo "Cleaning up android build files..."
rm -rf android/.gradle
rm -rf android/.idea
rm -rf android/app/build
echo "Reinstalling node modules..."
rm -rf node_modules/ &&
    yarn cache clean &&
    yarn install
