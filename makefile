install-dependencies-music-auth:
	cd ./packages/music-auth && npm install
install-dependencies-music-service:
	cd ./packages/music-service && npm install

install-dependencies-pipelines-music-auth:
	cd ./packages/music-auth && npm ci
install-dependencies-pipelines-music-service:
	cd ./packages/music-service && npm ci

test-music-auth:
	cd ./packages/music-auth && npm run test
test-music-service:
	cd ./packages/music-service && npm run test

lint-music-auth:
	cd ./packages/music-auth && npm run lint
lint-music-service:
	cd ./packages/music-service && npm run lint

npm-audit-music-auth:
	cd ./packages/music-auth && npm audit --audit-level high
npm-audit-music-service:
	cd ./packages/music-service && npm audit --audit-level high
