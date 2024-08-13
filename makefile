install-dependencies-all:
	(cd ./packages/music-auth && npm install)
	(cd ./packages/music-service && npm install)

install-dependencies-pipelines-all:
	(cd ./packages/music-auth && npm ci)
	(cd ./packages/music-service && npm ci)

test-all:
	(cd ./packages/music-auth && npm run test)
	(cd ./packages/music-service && npm run test)

lint-all:
	(cd ./packages/music-auth && npm run lint)
	(cd ./packages/music-service && npm run lint)

npm-audit-all:
	(cd ./packages/music-auth && npm audit --audit-level high)
	(cd ./packages/music-service && npm audit --audit-level high)
