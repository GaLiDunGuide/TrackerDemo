import path from "path";
import ts from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    input: "./src/core/index.ts",
    output: [
      {
        file: path.resolve(__dirname, "./dist/esm/index.esm.js"),
        format: "es",
      },
      {
        file: path.resolve(__dirname, "./dist/cjs/index.cjs.js"),
        format: "cjs",
      },
      {
        file: path.resolve(__dirname, "./dist/index.js"),
        format: "umd",
        name: "tracker",
      },
    ],
    plugins: [ts()],
  },
  {
    input: "./src/core/index.ts",
    output: [
      {
        file: path.resolve(__dirname, "./dist/index.d.js"),
        format: "es",
      },
    ],
    plugins: [dts()],
  },
];
