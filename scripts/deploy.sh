#!/bin/bash

debug_tool_game_id=foo
asset_upload_access_token=bar
current_branch=$(git rev-parse --abbrev-ref HEAD)
version=$(git describe --abbrev=0 --tags)
cdn_id=cdn-rgames-jp-lb
gs_path_root=gs://rgames-portal-jp-production.appspot.com/static/libs/viber-play-sdk # TODO: move to another bucket and set up CDN

mkdir -p build

run_test() {
  yarn test
}

build_lib() {
  echo "Cleaning up existing builds..."
  rm -rf lib

  if [[ $1 == 'node' ]]; then
    yarn run build:node
  else
    yarn run build
  fi
}

build_and_deploy_unstable() {
  i=next

  build_lib

  echo "Copying lib to build/$i..."
  cp -r lib/ build/$i

  echo "Uploading $i..."
  gsutil -m -h 'Cache-Control: no-cache, no-store, must-revalidate' \
    cp -a public-read build/$i/* $gs_path_root/$i/

  echo "Invalidating cache..."
  gcloud --project rgames-portal-jp-production compute url-maps invalidate-cdn-cache $cdn_id --path "/static/libs/viber-play-sdk/$i/bundle.js" &
}

build_and_deploy_stable() {
  semver_re="^v([0-9]+)\.([0-9]+)\.([0-9]+)$"
  if [[ $version =~ $semver_re ]]; then
    major=${BASH_REMATCH[1]}
    minor=${BASH_REMATCH[2]}
    patch=${BASH_REMATCH[3]}
  else
    echo "The version is invalid, check if it's align with semver."
    exit 1
  fi

  build_lib

  echo "Cleaning up existing builds..."
  rm -rf build/*

  output_paths=(latest $major $major.$minor $major.$minor.$patch)

  echo "Copying lib to build/$version..."
  cp -r lib/ build/$version

  for i in ${output_paths[@]}; do
    echo "Uploading $version to $i..."
    gsutil -m cp -a public-read build/$version/* $gs_path_root/$i/

    echo "Invalidating cache..."
    gcloud --project rgames-portal-jp-production compute url-maps invalidate-cdn-cache $cdn_id --path "/static/libs/viber-play-sdk/$i/bundle.js" &
  done
}

build_and_deploy_npm() {
  build_lib 'node'

  echo "Ready to run npm publish"
}

releasable_branch_re="^release/.*|master$"
if [[ $current_branch =~ $releasable_branch_re ]]; then
  # for release branch
  if [ -n $version ]; then
    run_test &&
    build_and_deploy_stable &&
    build_and_deploy_npm
  else
    echo "Please tag the release commit and try again"
    return 1
  fi
else
  # for develop branch
  run_test &&
  build_and_deploy_unstable
fi
