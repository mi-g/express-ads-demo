# Git-deployed web server

Usage
-----


* push branch *prod* to server, the app is automically updated and restarted
* from the server, as root:
	* stop the server app: `/etc/mysite/stop-prod.sh`
	* start/restart server app: `/etc/mysite/restart-prod.sh` 


Install
-------
For this example, the git/web server is *myserver*, the server app is *mysite*

**Base install (only once for a server)**

* create git account: `adduser git`
* from the client machine, use ssh keys: `ssh-copy-id git@myserver`
* install git on the server: `apt-get install git`
* create git repository directory: `mkdir -p /home/git; chown git.git /home/git; ln -s /home/git /var`
* from the server git account, install nvm as of <https://github.com/creationix/nvm>
	* `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash`
	* `source ~/.profile`
	* `nvm install 4.2.2`
	* `nvm alias default 4.2.2`
	* `npm install -g forever`
	
**Site install**

Following those instructions, you will end up with those files and directories:
* */var/git/mysite.git*: the general server repository for the project
* */home/mysite*: the repository where the site application is run from
* */etc/mysite*: a directory containing scripts to start and stop the site application
* */etc/sudoers.d/mysite*: a system file to allow running the site application (and only that) as a superuser from user *git* (privileges are required
to listen to ports 80 and 443)

***Automated install***

* do a temporary clone of the project to have access to the scripts:
  * `cd /tmp`
  * `git clone https://github.com/mi-g/exskel.git`
  * `cd exskel`
* `cd scripts`
* `./deploy-new-site.sh mysite`
* you can remove the initial repository: `rm -rf /tmp/exskel`

***Manual install***

* create app git repository: `su git -c "cd /home/git; mkdir mysite.git; cd mysite.git; git --bare init"`
* from the client side, the remote url to be used is *git@myserver:/var/git/mysite.git*
* create file */etc/sudoers.d/mysite* (see below)
* create file */home/git/mysite.git/hooks/post-receive* (see below, with execution rights)
* create scripts directory: `mkdir /etc/mysite`
* create files in scripts directory (with execution rights, see below)
* make git app execution repository: `cd /home; mkdir mysite; chown git.git mysite; su git -c "git clone /var/git/mysite.git mysite; cd mysite; git checkout prod"`


Files
-----

### /etc/sudoers.d/mysite

```
git ALL=(ALL) NOPASSWD: /etc/mysite/
```

### /home/git/mysite.git/hooks/post-receive

```
#!/bin/sh

LOGFILE='/var/log/git.log'
echo $(date) >> $LOGFILE
read line
echo $line >> $LOGFILE
BRANCH=$(echo $line | sed 's/^.*\/\([^\/]*$\)/\1/')

if [ "$BRANCH" = "prod" ]; then
    /etc/mysite/pull-prod.sh
    sudo /etc/mysite/do-restart-prod.sh &
fi
```

### /etc/mysite/do-restart-prod.sh

```
#!/bin/bash

DIR="/home/mysite"
LOGFILE="/var/log/mysite.log"
LOGERRFILE="/var/log/mysite.err.log"
FEARGS="--workingDir $DIR --killSignal SIGUSR2 --minUptime 1000 --spinSleepTime 1000 -o $LOGFILE -e $LOGERRFILE -a"
MODE="prod"

(
. /home/git/.nvm/nvm.sh 
cd $DIR;
npm install;
forever $FEARGS -o - stop $DIR/app.js 2> /dev/null
forever $FEARGS start $DIR/app.js
forever list
)
```

### /etc/mysite/do-stop-prod.sh

```
#!/bin/bash

DIR="/home/mysite"
(
. /home/git/.nvm/nvm.sh
forever stop $DIR/app.js
)
```

### /etc/mysite/pull-prod.sh

```
#!/bin/bash

DIR="/home/mysite"
cd $DIR
unset GIT_DIR
git pull origin prod
```

### /etc/mysite/restart-prod.sh

```
#!/bin/bash

su git -c "sudo /etc/mysite/do-restart-prod.sh"
```

### /etc/mysite/stop-prod.sh

```
#!/bin/bash

su git -c "sudo /etc/mysite/do-stop-prod.sh"
```
