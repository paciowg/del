const request = require('request-promise-native');

const SQL = `
select
  asmt_shrt_name as id,
  asmt_shrt_name as name,
  asmt_name as title,
  asmt_desc as description,
  creat_ts as date
from del_data.asmt
`;

function buildResource({ id, date, name, description, title }) {
  return {
    resourceType: 'Questionnaire',
    id: id,
    url: 'http://cms.gov/impact/Questionnaire/' + id,
    // meta: {
    //   profile: ''
    // },
    status: 'active',
    date, // date last changed
    name,
    title,
    description
  };
}

/**
 * Build all assessments and return then as a list of objects.
 *
 * @param {String} url
 * @param {import('pg').Client} client
 */
async function run(url, client) {
  const result = await client.query(SQL);

  for (const row of result.rows) {
    const res = buildResource(row);

    const resourceUrl = `${url}/${res.resourceType}/${res.id}`;

    console.log('Sending', resourceUrl);

    await request({
      method: 'PUT',
      uri: resourceUrl,
      body: res,
      json: true,
      headers: {},
    });

  }
}

module.exports = { run };
