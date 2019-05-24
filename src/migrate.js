const program = require('commander');
const { Client } = require('pg');
// const request = require('request-promise-native')

const { run: assessmentMigrator } = require('./migrators/assessment');

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
    await assessmentMigrator(url, client);
  } catch (error) {
    console.log('Error running migrators');
    console.error(error);
  }

  // console.log(res.rows[0]);

  await client.end();
}
