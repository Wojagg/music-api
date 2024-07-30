install-all:
	(cd ./packages/music-auth && npm install)
	(cd ./packages/music-service && npm install)

test-all:
	(cd ./packages/music-auth && npm run test)
	(cd ./packages/music-service && npm run test)
