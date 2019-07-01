#!/bin/bash

GAME_ID=arrQ8wIzzfBHsR0Cerroqns8ledhtug5

cleanup() {
  rv=$?
  echo "Clean up"
  if [ -e ./build/viber-play-demo.zip ]; then
    rm ./build/viber-play-demo.zip
  fi
  exit $rv
}

trap "cleanup" INT TERM EXIT

echo "Packaging..."
pushd examples/viber-play-demo
zip -r ../../build/viber-play-demo.zip .
popd

echo "Uploading to Viber Play..."

version=$(curl -s -X POST \
  https://api.rgames.jp/joker/developers/game/upload \
  -H "APIKEY: $VIBER_PLAY_HTTP_API_APIKEY" \
  -F "type=BUNDLE" \
  -F "game_id=$GAME_ID" \
  -F "asset=@./build/viber-play-demo.zip" \
  -F "comment=API upload" | \
  jq --raw-output ".data.version_id")

curl -s -X POST \
  https://api.rgames.jp/joker/developers/game/deploy \
  -H "APIKEY: $VIBER_PLAY_HTTP_API_APIKEY" \
  -F "game_id=$GAME_ID" \
  -F "version_id=$version" \
  -F "environment=production" > /dev/null

echo ""
echo "Done"
echo ""
echo "Current version: $version"
echo "Check it out on Viber Play: https://vbrpl.io/play/$GAME_ID"
