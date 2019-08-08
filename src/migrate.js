const { mkdirSync, existsSync, writeFileSync } = require('fs');

const program = require('commander');
const { Client } = require('pg');

const { fhirURL: profileUrl } = require('../spec/config.json');
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

let serverUrl;
let resourceList = ['measure', 'questionnaire', 'library'];

program
  .usage('<host> [resources]')
  .arguments('<host> [resources]')
  .action((host, resources) => {
    serverUrl = host;
    if (resources) {
      resourceList = resources.split(',');
    }
  })
  .parse(process.argv);

serverUrl = serverUrl || DEFAULT_URL;
if (!serverUrl.startsWith('http')) {
  serverUrl = `http://${serverUrl}`;
}

main(profileUrl, serverUrl);

/**
 * Run the main process.
 * @param {String} profileUrl
 * @param {String} serverUrl
 */
async function main(profileUrl, serverUrl) {
  const client = new Client(DATABASE);
  await client.connect();

  // Make all the output directories.
  for (const dir of ['questionnaires', 'libraries', 'measures']) {
    if (!existsSync(`out/json/${dir}`)) {
      mkdirSync(`out/json/${dir}`, { recursive: true });
    }
  }

  try {
    if (resourceList.includes('questionnaire')) {
      const questionnaires = await questionnaireMigrator(profileUrl, serverUrl, client);
      for (const resource of questionnaires) {
        writeFileSync(`out/json/questionnaires/${resource.id}.json`, JSON.stringify(resource, null, 2));
        await putResource(serverUrl, resource);
      }
    }

    if (resourceList.includes('library')) {
      const libraries = await libraryMigrator(profileUrl, serverUrl, client);
      for (const resource of libraries) {
        writeFileSync(`out/json/libraries/${resource.id}.json`, JSON.stringify(resource, null, 2));
        await putResource(serverUrl, resource);
      }
    }

    if (resourceList.includes('measure')) {
      const measures = await measureMigrator(profileUrl, serverUrl, client);
      for (const resource of measures) {
        writeFileSync(`out/json/measures/${resource.id}.json`, JSON.stringify(resource, null, 2));
        await putResource(serverUrl, resource);
      }
    }

  } catch (error) {
    logError(error);
  }

  await client.end();
}
