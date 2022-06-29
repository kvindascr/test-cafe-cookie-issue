# test-cafe-cookie-issue
Test cafe cookie issue reproduction repo

## Setup

- Add `local.myapp.app` to your hosts file pointing to `127.0.0.1`
- `npm install` at dirs `frontend` / `backend` / `testing`
- Go to `local-nginx-proxy/ssh` and run `init.sh` to install the https certificates

## Run

- Exec `docker-compose up` at repo root
- Exec `npm run start` at `frontend` dir
- Exec `npm run start` at `backend` dir
- Exec `npm run e2e` at `testing` dir

