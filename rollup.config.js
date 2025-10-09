import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import vue from 'rollup-plugin-vue'; 
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // 第一轮：打包 JS
  {
    input: {
      index: 'src/index.ts',
      rebuild: 'src/utils/rebuild.ts',
      ws: 'src/utils/ws.ts'
    },
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].js',
    },
    plugins: [
      vue(), 
      typescript(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  
  // 打包 UMD 格式，单独打包
  {
    input: 'src/utils/rebuild.ts',
    output: [
      {
        file: 'dist/rebuild.umd.js',
        format: 'umd',
        name: 'r', // 浏览器中全局变量名  
      }
    ],
    plugins: [
      typescript(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  {
    input: 'src/utils/ws.ts',
    output: [
      {
        file: 'dist/ws.umd.js',
        format: 'umd',
        name: 'w', // 浏览器中全局变量名  
      }
    ],
    plugins: [
      typescript(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 's', // 浏览器中全局变量名  
        globals: {
          vue: 'Vue'
        },
      }
    ],
    external: ['vue'],
    plugins: [
      vue(), 
      typescript(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },

  // 第二轮：打包类型
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  },
  {
    input: 'src/utils/rebuild.ts',
    output: {
      file: 'dist/rebuild.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  },
   {
    input: 'src/utils/ws.ts',
    output: {
      file: 'dist/ws.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];

