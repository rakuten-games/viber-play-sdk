#!/bin/bash

GAME_ID=arrQ8wIzzfBHsR0Cerroqns8ledhtug5

echo "Cleaning up..."

if [ -e ./build/viber-play-demo.zip ]; then
  rm ./build/viber-play-demo.zip
fi

echo "Packaging..."

pushd examples/viber-play-demo
zip -r ../../build/viber-play-demo.zip .
popd

echo "Uploading to Viber Play..."

curl -X POST \
  https://api.rgames.jp/joker/developers/game/upload \
  -H "APIKEY: $VIBER_PLAY_HTTP_API_APIKEY" \
  -F "type=BUNDLE" \
  -F "game_id=$GAME_ID" \
  -F "asset=@./build/viber-play-demo.zip" \
  -F "comment=API upload"

echo ""
echo "Done."
echo ""
echo "Next steps on Viber Play:"
echo "1. Activate the version at: https://developers.rgames.jp/games/$GAME_ID/versions/"
echo "2. Then check it out at: https://vbrpl.io/play/$GAME_ID"
