import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import htmlMinifier from 'vite-plugin-html-minifier'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
    return {
        base: '/',
        build: {
            outDir: 'build',
            chunkSizeWarningLimit: 800,
            minify: 'terser',
            sourcemap: false,
            rollupOptions: {
                onwarn(warning, warn) {
                    if (warning.plugin === 'vite:esbuild') {
                        throw new Error(`Vite ESBuild error: ${warning.message}`)
                    }
                    warn(warning)
                },
                output: {
                    entryFileNames: 'assets/[hash].js',
                    chunkFileNames: 'assets/[hash].js',
                    assetFileNames: 'assets/[hash].[ext]',
                    manualChunks(id) {
                        // this thing fixes issues with vite build minif of sentry
                        if (id.includes('node_modules') && !id.includes('sentry')) {
                            return id.toString().split('node_modules/')[1].split('/')[0]
                        }
                    },
                },
            },
        },
        css: {
            postcss: {
                plugins: [
                    autoprefixer({}), // add options if needed
                ],
                sass: {
                    sassOptions: {
                        quietDeps: true,
                    },
                },
            },
        },
        esbuild: {
            loader: 'jsx',
            include: /src\/.*\.jsx?$/,
            exclude: [],
            target: 'esnext',
        },
        optimizeDeps: {
            force: true,
            esbuildOptions: {
                treeShaking: true,
                minify: true,
                loader: {
                    '.js': 'jsx',
                },
            },
        },
        plugins: [
            react(),
            htmlMinifier({
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
            }),
        ],
        resolve: {
            alias: [
                {
                    find: 'src/',
                    replacement: `${path.resolve(__dirname, 'src')}/`,
                },
            ],
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
        },
        server: {
            port: 3000,
            proxy: {
                // https://vitejs.dev/config/server-options.html
            },
        },
    }
})
