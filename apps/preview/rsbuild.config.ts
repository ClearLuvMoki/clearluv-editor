import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';

export default defineConfig({
  plugins: [pluginReact(), pluginNodePolyfill()],
  tools: {
    rspack: {
      ignoreWarnings: [/Critical dependency/],
    },
  },
  html: {
    title: 'ClearLuv Editor',
  },
});
