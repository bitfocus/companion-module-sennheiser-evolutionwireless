export default {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	verbose: true,
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }],
	},
}
