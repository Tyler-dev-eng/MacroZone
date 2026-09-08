export default function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Drizzle migrations import .sql files. This plugin inlines them as strings
    // so Metro can bundle them (JS can't import SQL otherwise).
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
}
