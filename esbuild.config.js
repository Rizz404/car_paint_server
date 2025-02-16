const esbuild = require("esbuild");
const { Clean } = require("esbuild-plugin-clean");
const alias = require("esbuild-plugin-alias");
const path = require("path");

const config = {
  entryPoints: ["./src/index.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  target: ["node20"],
  format: "cjs",
  outfile: "./dist/bundle.js",
  external: [
    "express",
    "bcrypt",
    "prom-client",
    "express-prom-bundle",
    "response-time",
    "@prisma/client",
  ],
  plugins: [
    Clean({
      patterns: ["./dist/*"],
    }),
    alias({
      "@": path.resolve(__dirname, "./src"),
    }),
  ],
};

if (process.argv.includes("--watch")) {
  config.watch = {
    onRebuild(error) {
      if (error) console.error("Watch build failed:", error);
      else console.log("Watch build succeeded");
    },
  };
}

esbuild.build(config).catch(() => process.exit(1));
