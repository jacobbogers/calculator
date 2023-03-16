import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                // svgr options
            }
        })
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        // you might want to disable it, if you don't have tests that rely on CSS
        // since parsing CSS is slow
        css: true
    }
});
