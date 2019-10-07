const request = require('request-promise-native');

const BASE_URL = 'https://api.logicahealth.org/PACIO/open/';

async function pageCount(uri) {
  const response = await request({
    method: 'GET',
    uri,
    json: true,
    resolveWithFullResponse: true
  });

  let total = 0;

  let nextPage;
  if (response.body.link) {
    nextPage = response.body.link.find(link => link.relation === 'next');
  }

  if (nextPage) {
    const subTotal = await pageCount(nextPage.url);
    total = total + subTotal;
  }

  if (response.body.entry) {
    total = total + response.body.entry.length;
  }

  return total;
}

async function count(resource) {
  const count = await pageCount(`${BASE_URL}/${resource}?_count=50&_summary=text`);
  console.log(`${resource}: ${count}`);
}

async function main() {
  await count('Measure');
  await count('Library');
  await count('Questionnaire');
  await count('StructureDefinition');
}

main();
