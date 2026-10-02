import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/main.js",
  output: [
    {
      file: "dist/chess-puzzler.js",
      format: "iife",
      name: "ChessPuzzler",
    },
  ],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
  ],
};
