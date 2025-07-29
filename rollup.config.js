import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    input: {
      index: "src/index.ts",
      rebuild: "src/utils/rebuild.ts",
    },
    output: {
      dir: "dist",
      format: "esm",
      entryFileNames: "[name].js",
    },
    plugins: [typescript()],
  },

  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.umd.js",
        format: "umd",
        name: "s", // 浏览器中全局变量名
      },
    ],
    plugins: [typescript()],
  },

  // 第二轮：打包类型
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
  {
    input: "src/utils/rebuild.ts",
    output: {
      file: "dist/rebuild.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
