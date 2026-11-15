import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'
import jest from 'eslint-plugin-jest'

const baseConfig = await generateEslintConfig({
	enableJest: true,
	enableTypescript: true,
})

const testFilePatterns = ['src/**/*spec.ts', 'src/**/*test.ts']
const testHelperPatterns = ['src/**/__tests__/**/*.ts', 'src/**/__mocks__/**/*.ts']

const allTestFilePatterns = [...testFilePatterns, ...testHelperPatterns]

/** @type {import('eslint').Linter.Config<import('eslint').Linter.RulesRecord>[]} */
const customConfig = [
	...baseConfig,

	{
		files: allTestFilePatterns,
		plugins: {
			jest,
		},
		rules: {
			// The TypeScript eslint rule that flags references to unbound
			// functions that discard a proper `this`, also flags
			// `expect(obj.nonStaticFunc).toHaveBeenCalled()` and similar test
			// patterns.  Disable the rule in tests in favor of a Jest-specific
			// rule that doesn't flag valid `expect`-related operations.
			'@typescript-eslint/unbound-method': 'off',
			'jest/unbound-method': 'error',
		},
	},
]

export default customConfig
