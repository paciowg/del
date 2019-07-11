const { mkdirSync, existsSync, writeFileSync } = require('fs');

const program = require('commander');
const { Client } = require('pg');

const { logError, putResource } = require('./helpers');
const { run: questionnaireMigrator } = require('./migrators/questionnaire');
const { run: measureMigrator } = require('./migrators/measure');
const { run: libraryMigrator } = require('./migrators/library');

const DEFAULT_URL = 'http://localhost:8080/r4';
const DATABASE = {
  user: 'postgres',
  database: 'postgres',
  password: 'welcome123',
  port: 5432,
  host: 'localhost',
};

let baseUrl;
program
  .usage('<host>')
  .arguments('<host>')
  .action((host) => baseUrl = host)
  .parse(process.argv);
baseUrl = baseUrl || DEFAULT_URL;
if (!baseUrl.startsWith('http')) {
  baseUrl = `http://${baseUrl}`;
}

main(baseUrl);

/**
 * Run the main process.
 * @param {*} url
 */
async function main(url) {
  const client = new Client(DATABASE);
  await client.connect();

  // Make all the output directories.
  for (const dir of ['questionnaires', 'libraries', 'measures']) {
    if (!existsSync(`out/json/${dir}`)) {
      mkdirSync(`out/json/${dir}`, { recursive: true });
    }
  }

  try {
    const questionnaires = await questionnaireMigrator(url, client);
    for (const resource of questionnaires) {
      writeFileSync(`out/json/questionnaires/${resource.id}.json`, JSON.stringify(resource, null, 2));
      // await putResource(url, resource);
    }

    // const libraries = await libraryMigrator(client);
    // for (const resource of libraries) {
    //   await putResource(url, resource);
    // }

    // const measures = await measureMigrator(client);
    // let idx = 1;
    // for (const resource of measures) {
    //   await putResource(url, resource);
    // }

  } catch (error) {
    logError(error);
  }

  await client.end();
}
