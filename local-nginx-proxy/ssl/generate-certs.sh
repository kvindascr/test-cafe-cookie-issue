#!/usr/bin/env bash

# exit when any command fails
set -e

# set working directory to the ssl dir
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

cd $dir

echo ""
echo "===== Generating SSL cert + key ====="

echo "You may be prompted for your root password for certificate installation"

echo ""

FILE=/usr/local/etc/ssl/certs/local.myapp.app.crt
if test -f "$FILE"; then
  if ! ask "You have existing certificates installed, create new ones?" N; then
      echo "===== Finish ====="
      [[ "$0" = "$BASH_SOURCE" ]] && exit 0 || return 0 # handle exits from shell or function but don't exit interactive shell
  fi
fi

openssl req \
-x509 \
-newkey rsa:4096 \
-sha256 \
-days 356 \
-nodes \
-keyout local.myapp.app.key \
-out local.myapp.app.crt \
-subj '/CN=local.myapp.app' \
-extensions san \
-config <( \
  echo '[req]'; \
  echo 'distinguished_name=req'; \
  echo '[san]'; \
  echo 'subjectAltName=DNS:localhost,DNS:myapp.local,DNS:myapp.app,DNS:local.myapp.app')

cp local.myapp.app.crt ~/Downloads

echo ""
echo "===== Finish ====="
echo "A copy of the certificate has been made in ~/Downloads for use with a mobile device if necessary."

if test -f "$FILE"; then
  echo ""
  echo "You have re-initialized the SSL setup."
  echo ""
  echo "Please follow instructions starting at 'Register the certificate on mobile' in the mobile developer guide to register the new certificates."
fi
