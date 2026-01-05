import { join } from 'node:path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
    plugins: [pluginReact()],
    resolve: {
        alias: {
            '@/*': join(__dirname, './src/core/*'),
        },
    },
    server: {
        port: 3033,
    },
})
