import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/main.js",
  output: [
    {
      file: "dist/puzzle-player.js",
      format: "iife",
      name: "PuzzlePlayer",
    },
  ],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
  ],
};
