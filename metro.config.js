const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Metro is the bundler. By default it only resolves JS/TS/JSON.
// Adding "sql" lets drizzle/migrations.js import the .sql files.
// babel.config.js then inlines those files as strings.
config.resolver.sourceExts.push("sql");

module.exports = config;
