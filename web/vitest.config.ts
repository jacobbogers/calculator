import react from '@vitejs/plugin-react';
import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    plugins: [
        react(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        // you might want to disable it, if you don't have tests that rely on CSS
        // since parsing CSS is slow
        css: true,
        exclude: [
            ...configDefaults.exclude,
        ],
        include: [
            'src/__test__/App.network.test.tsx',
            'src/__test__/App.normal.user.input.test.tsx',
            'src/__test__/App.ui.test.tsx',
            'src/__test__/App.user.input.test.tsx'
        ]
    }
});
