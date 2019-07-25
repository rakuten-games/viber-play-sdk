#!/bin/bash

cleanup() {
  rv=$?
  echo "Clean up"
  if [ -e ./build/viber-play-demo.zip ]; then
    rm ./build/viber-play-demo.zip
  fi
  exit $rv
}

trap "cleanup" INT TERM EXIT

deploy() {
  echo "Packaging..."
  pushd examples/viber-play-demo
  zip -r ../../build/viber-play-demo.zip .
  popd

  echo "Uploading to Viber Play..."

  version=$(curl -s -X POST \
    $api_root/joker/developers/game/upload \
    -H "APIKEY: $api_key" \
    -F "type=BUNDLE" \
    -F "game_id=$game_id" \
    -F "asset=@./build/viber-play-demo.zip" \
    -F "comment=API upload" | \
    jq --raw-output ".data.version_id")

  curl -s -X POST \
    $api_root/joker/developers/game/deploy \
    -H "APIKEY: $api_key" \
    -F "game_id=$game_id" \
    -F "version_id=$version" \
    -F "environment=production" > /dev/null

  echo ""
  echo "Done"
  echo ""
  echo "Current version: $version"
  echo "Check it out on Viber Play: $viber_play_root/games/$game_id"
}

api_key=$TEST_VIBER_PLAY_HTTP_API_APIKEY \
api_root=$TEST_VIBER_PLAY_HTTP_API_ROOT \
game_id=$TEST_GAME_ID \
viber_play_root=$TEST_VIBER_PLAY_ROOT \
deploy

echo ""

api_key=$VIBER_PLAY_HTTP_API_APIKEY \
api_root=$VIBER_PLAY_HTTP_API_ROOT \
game_id=$GAME_ID \
viber_play_root=$VIBER_PLAY_ROOT \
deploy
