#!/bin/bash -e

BRANCH="$1"

if [[ -n "$BRANCH" ]]; then
	BRANCH="master"
fi

if which git 2>/dev/null >/dev/null; then
	echo "Updating source..."
	git pull origin "$BRANCH"
else
	echo "Skipped Updating sources, no GIT found"
	exit 0
fi

echo "Update sources successful!"
exit 0
