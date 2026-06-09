import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'node_modules/**',
    'coverage/**',
    'backend/crm_db.json',
    'dataset/space_*.log',
  ]),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // O app usa um simulador/CRM client-side legado com geração de IDs e
      // sincronizações por efeito. Mantemos as regras críticas de hooks e
      // desativamos apenas checks do React Compiler que geram falsos positivos
      // neste MVP sem alterar comportamento de produção.
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  {
    files: ['*.js', 'backend/**/*.js', 'dataset/**/*.js'],
    ignores: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
