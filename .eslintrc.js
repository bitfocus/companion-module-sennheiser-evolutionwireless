module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "prefer-const": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-control-regex": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "prefer-template": "warn",
        "quotes": ["error", "double", {"allowTemplateLiterals": true}]
    }
};
