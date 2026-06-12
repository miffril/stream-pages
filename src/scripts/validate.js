const fs = require("node:fs");
const path = require("node:path");
const Ajv = require("ajv");

const dataPath = path.resolve(__dirname, "../data/commands.json");
const schemaPath = path.resolve(__dirname, "../data/schema.json");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function formatAjvErrors(errors) {
  return (errors || [])
    .map((error) => `${error.instancePath || "/"} ${error.message}`)
    .join("\n");
}

function validateBusinessRules(data) {
  const categoryIds = new Set();
  const allTriggers = new Set();

  for (const category of data.categories) {
    const normalizedCategoryId = category.id.toLowerCase();
    if (categoryIds.has(normalizedCategoryId)) {
      throw new Error(`Duplicate category id: ${category.id}`);
    }
    categoryIds.add(normalizedCategoryId);

    for (const command of category.commands) {
      for (const trigger of command.triggers) {
        const normalizedTrigger = trigger.toLowerCase();
        if (allTriggers.has(normalizedTrigger)) {
          throw new Error(`Duplicate trigger or alias detected: ${trigger}`);
        }
        allTriggers.add(normalizedTrigger);
      }
    }
  }
}

function run() {
  const schema = readJson(schemaPath);
  const data = readJson(dataPath);

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    throw new Error(`Schema validation failed:\n${formatAjvErrors(validate.errors)}`);
  }

  validateBusinessRules(data);
  console.log("Validation passed");
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
