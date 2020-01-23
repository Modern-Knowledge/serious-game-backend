module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.json'
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	testMatch: [
		'**/test/**/*.test.(ts|js)'
	],
	setupFiles: [
		"./src/migrater.js"
	],
	testEnvironment: 'node',
	coveragePathIgnorePatterns: [
		'/node_modules/',
		'/src/lib',
		'/src/migrationHelper.ts',
		'/src/util/db/databaseConnection.ts',
		'/src/util/mail/mailTransport.ts',
		"./src/migrater.js"
	]
};
