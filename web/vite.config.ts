import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import removeTestIdAttribute from './tools/vite-jsx-remove-attributes';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        removeTestIdAttribute({ attributes: ['data-testid'] }),
        eslint(),
        svgr({
            svgrOptions: {
                // svgr options
            }
        })
    ]
});
