const request = require('request-promise-native');

const BASE_URL = 'https://api.logicahealth.org/PACIO/open/';

async function cleanup(resource, page = 1) {
  const response = await request({
    method: 'GET',
    uri: `${BASE_URL}/${resource}?_count=50`,
    json: true,
    resolveWithFullResponse: true
  });

  console.log(`${resource} Page ${page}`);

  if (response.body.entry) {
    for (const res of response.body.entry) {
      console.log(res.fullUrl);
      await request({
        method: 'DELETE',
        uri: res.fullUrl,
        json: true,
        resolveWithFullResponse: true
      });
    }
  }

  let nextPage;
  if (response.body.link) {
    nextPage = response.body.link.find(link => link.relation === 'next');
  }

  if (nextPage) {
    await cleanup(nextPage.url, ++page);
  }
}

async function main() {
  await cleanup('Questionnaire');
  await cleanup('Measure');
  await cleanup('Library');
  await cleanup('StructureDefinition');
}

main();
