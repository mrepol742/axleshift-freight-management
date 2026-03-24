import { defineConfig } from 'eslint/config'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jest from 'eslint-plugin-jest'
import prettier from 'eslint-plugin-prettier'

export default defineConfig([
    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        settings: {
            react: {
                version: 'detect',
            },
        },

        plugins: {
            react,
            'react-hooks': reactHooks,
            jest,
            prettier,
        },

        rules: {
            ...react.configs.recommended.rules,
            ...jest.configs.recommended.rules,

            'prettier/prettier': 'error',
        },
    },
])
