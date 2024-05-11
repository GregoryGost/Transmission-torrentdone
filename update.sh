#!/bin/bash -e

if [ -z "$1" ]; then
  BRANCH="master"
else
  BRANCH="$1"
fi

if which git 2> /dev/null > /dev/null; then
  echo "Updating source..."
  git pull origin "$BRANCH"
else
  echo "Skipped Updating sources, no GIT found"
  exit 0
fi

echo "Update sources successful!"
exit 0
