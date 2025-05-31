import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import removeAttributes from 'rollup-plugin-jsx-remove-attributes';
import type { PluginOption } from 'vite';

const reactPlugin = react({}) as any[];
const attrPlugin = removeAttributes({ usage: 'vite' });

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,
        minify: false,

    },
    plugins: [
        ...reactPlugin,
        attrPlugin,
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        css: true, // disable for faster test runs if not needed
        exclude: [...configDefaults.exclude],
        include: [
            'src/__test__/App.network.test.tsx',
            'src/__test__/App.normal.user.input.test.tsx',
            'src/__test__/App.ui.test.tsx',
            'src/__test__/App.user.input.test.tsx',
        ],
    },
})