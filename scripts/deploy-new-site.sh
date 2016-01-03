#!/bin/bash

PWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPTSDIR=$PWD

if [ "x$1" = "x" ]; then
	echo "Usage: deploy-new-site <site name>"
	exit 0
fi

SITE=$1
VARGIT=/var/git
REPO=$VARGIT/$SITE.git
SITEREPO=/home/$SITE
TMPREPO=/tmp/$SITE

if [ -e "/etc/$SITE" ]; then
	echo "/etc/$SITE already exists"
	exit 0
fi

if [ -e "$REPO" ]; then
	echo "$REPO already exists"
	exit 0
fi

if [ -e "/etc/sudoers.d/$SITE" ]; then
	echo "/etc/sudoers.d/$SITE already exists"
	exit 0
fi

if [ -e "$SITEREPO" ]; then
	echo "$SITEREPO already exists"
	exit 0
fi

if [ -e "$TMPREPO" ]; then
	echo "$TMPREPO already exists"
	exit 0
fi

echo "Creating project repository at $REPO"
mkdir -p $VARGIT
chown git.git $VARGIT
cd $VARGIT; mkdir $SITE.git; chown git.git $SITE.git; cd $SITE.git; su git -c "git --bare init"
echo "Created project repository at $REPO"

if [ ! -e "$REPO/HEAD" ]; then
	echo "Could not init git repository $REPO"
	exit 0
fi

echo "Creating site repository at $SITEREPO"
su git -c "cd $(dirname $TMPREPO); git clone $REPO $SITE"
if [[ $? != 0 ]]; then exit -1; fi
mv $TMPREPO $SITEREPO
echo "Created site repository at $SITEREPO"

if [ ! -e "$SITEREPO/.git" ]; then
	echo "Could not clone git repository to $SITEREPO"
	exit 0
fi

function CopyFileToSite {
	echo "Creating $2 from $1"
	mkdir -p $(dirname $2)
	if [[ $? != 0 ]]; then exit -1; fi
	sed "s/mysite/$SITE/g" $1 > $2
}

FILES="
	/etc/mysite/do-restart-prod.sh \
	/etc/mysite/do-stop-prod.sh \
	/etc/mysite/pull-prod.sh \
	/etc/mysite/restart-prod.sh \
	/etc/mysite/stop-prod.sh \
	/etc/sudoers.d/mysite \
	/var/git/mysite.git/hooks/post-receive
	"

for FILE in $FILES; do
	DEST=$(echo $FILE | sed "s/mysite/$SITE/g")
	CopyFileToSite $SCRIPTSDIR/$FILE $DEST
done

chmod a+x $REPO/hooks/post-receive /etc/$SITE/*

