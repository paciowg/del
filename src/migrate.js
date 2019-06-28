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

  try {
    const questionnaires = await questionnaireMigrator(url, client);
    for (const resource of questionnaires) {
      // await putResource(url, resource);
      console.log(resource.url);
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

  // console.log(res.rows[0]);

  await client.end();
}
