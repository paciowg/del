const request = require('request-promise-native');

const username = process.env.FHIR_USERNAME;
const password = process.env.FHIR_PASSWORD;

async function putResource(url, resource) {
    const resourceUrl = `${url}/${resource.resourceType}/${resource.id}`;

    console.log('Uploading', resourceUrl);

    const headers = {};
    if (username && password) {
        headers['Authorization'] = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
    }

    const response = await request({
        method: 'PUT',
        uri: resourceUrl,
        body: resource,
        json: true,
        headers,
        resolveWithFullResponse: true,
    });

    return response.body;
}

function logError(error) {
    if (error.error && error.error.issue) {
        for (const issue of error.error.issue) {
            console.log(issue);
        }
    } else {
        console.error(error);
    }
}

module.exports = { putResource, logError };
