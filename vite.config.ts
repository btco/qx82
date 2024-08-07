import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: [
        path.resolve(__dirname, 'src/index.ts'),
        path.resolve(__dirname, 'src/qx.ts'),
        path.resolve(__dirname, 'src/qxa.ts'),
        path.resolve(__dirname, 'src/qut.ts'),
      ],
      name: 'qx82',
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    outDir: 'qx82',
    rollupOptions: {
      external: [
        'three',
        "three/addons/postprocessing/RenderPass.js",
        "three/addons/postprocessing/UnrealBloomPass.js",
        "three/addons/postprocessing/OutputPass.js",
        "three/addons/postprocessing/EffectComposer.js",
      ],
      output: {
        globals: {
          three: 'THREE',
          "three/addons/postprocessing/RenderPass.js": 'RenderPass',
          "three/addons/postprocessing/UnrealBloomPass.js": 'UnrealBloomPass',
          "three/addons/postprocessing/OutputPass.js": 'OutputPass',
          "three/addons/postprocessing/EffectComposer.js": 'EffectComposer',
        }
      }
    },
  },
  plugins: []
});
