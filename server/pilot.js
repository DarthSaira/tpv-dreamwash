process.env.WORKSHOP_MODE = "pilot";
process.env.PORT = "4173";
process.env.WORKSHOP_DB_PATH = "data/workshop.sqlite";

await import("./index.js");
