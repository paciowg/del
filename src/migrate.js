const { mkdirSync, existsSync, writeFileSync, readdirSync } = require('fs');

const program = require('commander');
const { Client } = require('pg');

const { fhirURL: profileUrl } = require('../spec/config.json');
const { logError, putResource } = require('./helpers');
const { run: questionnaireMigrator } = require('./migrators/questionnaire');

const DEFAULT_URL = 'http://localhost:8080/r4';
const DATABASE = {
    user: 'postgres',
    database: 'postgres',
    password: 'welcome123',
    port: 5432,
    host: 'impact-fhir.mitre.org',
};

let serverUrl;

program
    .usage('<host>')
    .arguments('<host>')
    .action((host) => {
        serverUrl = host;
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

    if (!existsSync('out/json/questionnaires')) {
        mkdirSync('out/json/questionnaires', { recursive: true });
    }

    try {
        const questionnaires = await questionnaireMigrator(client, profileUrl, serverUrl);
        for (const resource of questionnaires) {

            writeFileSync(`out/json/questionnaires/${resource.id}.json`, JSON.stringify(resource, null, 2));
        }

        const jsonFiles = readdirSync('out/json/questionnaires/');
        for (const filename of jsonFiles) {
            const resource = require(`../out/json/questionnaires/${filename}`);
            await putResource(serverUrl, resource);
        }

    } catch (error) {
        logError(error);
    }

    await client.end();
}