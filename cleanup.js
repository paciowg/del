const request = require('request-promise-native');

const username = process.env.FHIR_USERNAME;
const password = process.env.FHIR_PASSWORD;

const headers = {};
if (username && password) {
    headers['Authorization'] = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
}

const BASE_URL = 'https://impact-fhir.mitre.org/r4';
// const BASE_URL = 'http://hapi.fhir.org/baseR4';

async function cleanup(uri) {
    const response = await request({
        method: 'GET',
        uri,
        json: true,
        resolveWithFullResponse: true,
    });

    console.log(`URL: ${uri}`);

    if (response.body.entry) {
        for (const res of response.body.entry) {
            console.log(res.fullUrl);
            await request({
                method: 'DELETE',
                uri: `${res.fullUrl}?_cascade=delete`,
                json: true,
                headers,
                resolveWithFullResponse: true,
            });
        }
    }

    let nextPage;
    if (response.body.link) {
        nextPage = response.body.link.find(link => link.relation === 'next');
    }

    if (nextPage) {
        await cleanup(nextPage.url);
    }
}

async function cleanupResource(resource, profile) {
    const uri = `${BASE_URL}/${resource}?_count=50&_profile=${profile}`;

    return cleanup(uri);
}

async function main() {
    await cleanupResource('Questionnaire', 'https://impact-fhir.mitre.org/r4/StructureDefinition/del-StandardForm');
}

main();
