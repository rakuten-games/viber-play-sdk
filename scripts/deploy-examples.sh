#!/bin/bash

cleanup() {
  rv=$?
  echo "Clean up"
  if [ -e ./examples/bundle.zip ]; then
    rm ./examples/bundle.zip
  fi
  exit $rv
}

trap "cleanup" INT TERM EXIT

deploy() {
  echo "Packaging..."
  pushd examples/viber-play-demo
  zip -r ../bundle.zip .
  popd

  echo "Uploading to Viber Play..."

  # TODO: vputil

  echo ""
  echo "Done"
}

deploy
