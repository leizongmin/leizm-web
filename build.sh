#!/bin/sh

cd v2.source
npx gitbook build
rm -rf ../v2
mv _book ../v2
