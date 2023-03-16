import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
/*
// cannot use this with modern vite versions, please check
import VitePluginReactRemoveAttributes from 'vite-plugin-react-remove-attributes';
*/

import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        /*
          VitePluginReactRemoveAttributes({
              attributes: ['ATTRIBUTES TO REMOVE'],
          }),µ
        */
        eslint(),
        svgr({
            svgrOptions: {
                // svgr options
            }
        })
    ]
});
