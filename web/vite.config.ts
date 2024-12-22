import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import removeTestIdAttribute from 'rollup-plugin-jsx-remove-attributes';

// https://vitejs.dev/config/
export default defineConfig({
    build: { sourcemap: true , minify: false },
    plugins: [
        react(),
        removeTestIdAttribute({
            //include:['**/**/App.tsx'],
            attributes: ['data-testid'],
            usage: 'vite'
        }),
        eslint({ fix: true, emitError: true }),
    ]
});
