#!/usr/bin/env bash

# Fancy way to prompt a user for Y/N. Source:
# https://gist.github.com/davejamesmiller/1965569
ask() {
    local prompt default reply

    if [[ ${2:-} = 'Y' ]]; then
        prompt='Y/n'
        default='Y'
    elif [[ ${2:-} = 'N' ]]; then
        prompt='y/N'
        default='N'
    else
        prompt='y/n'
        default=''
    fi

    while true; do

        # Ask the question (not using "read -p" as it uses stderr not stdout)
        echo -n "$1 [$prompt] "

        # Read the answer (use /dev/tty in case stdin is redirected from somewhere else)
        read -r reply </dev/tty

        # Default?
        if [[ -z $reply ]]; then
            reply=$default
        fi

        # Check if the reply is valid
        case "$reply" in
            Y*|y*) return 0 ;;
            N*|n*) return 1 ;;
        esac

    done
}

# exit when any command fails
set -e

# set working directory to the ssl dir
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

cd $dir

# Add SSL cert to trust store
echo ""
echo "===== Adding cert to trust store ====="
echo "===== Your system password is required ===="
sudo security add-trusted-cert -d -r trustRoot -p ssl \
    -k /Library/Keychains/System.keychain local.myapp.app.crt
