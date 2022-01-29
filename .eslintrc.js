module.exports = {
    root: true,
    plugins: ['jest'],
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        'jest/globals': true
    },
    extends: [
        'airbnb-base',
        'airbnb-typescript/base'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        indent: [2, 4],
        'arrow-parens': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'max-len': ['error', { code: 250 }],
        'object-curly-newline': ['error', { consistent: true }],
        'operator-linebreak': ['error', 'after'],
        'no-console': 'off',
        'prefer-destructuring': 'off',
        'global-require': 0,
        'arrow-body-style': 0,
        radix: 0,
        '@typescript-eslint/indent': [2, 4],
        '@typescript-eslint/comma-dangle': ['error', 'never'],
        'import/prefer-default-export': "off"
    },
    parserOptions: {
        project: './tsconfig.eslint.json'
    },
    ignorePatterns: ['.eslintrc.js', 'setupTests.js', 'babel.config.js', 'jest.config.js', '/infrastructure/**', "/build/**", "/app/**"]
};