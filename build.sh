#!/bin/sh

cd v2.source
npx gitbook build
mv _book ../v2
