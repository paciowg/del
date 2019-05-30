const putResource = require('../helpers').putResource;

const SQL = `
select
  concat(asmt_shrt_name, '-', asmt_vrsn_id) as id,
  asmt_vrsn_id as version,
  regexp_replace(asmt_shrt_name, '[^a-zA-Z0-9]', '') as name,
  asmt_name as title,
  asmt_desc as description,
  asmt.creat_ts as date,
  org_name as publisher,
  to_char(pblctn_dt, 'YYYY-MM-DD') as approvaldate,
  to_char(efctv_strt_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as startdate,
  to_char(efctv_end_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as enddate,
  efctv_end_dt is null or efctv_end_dt > current_date as active
from del_data.asmt
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_id = asmt.asmt_id
inner join del_data.org on asmt.ownr_org_id = org.org_id

`;

function buildResource({ id, version, active, date, name, description, title, publisher, startdate, enddate, approvaldate }) {
  const resource = {
    resourceType: 'Questionnaire',
    id: id,
    url: 'http://cms.gov/impact/Questionnaire/' + id,
    // meta: {
    //   profile: ''
    // },
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">${name} Assessment Version ${version}</div>`
    },
    status: active ? 'active' : 'retired',
    date, // date last changed
    name,
    version,
    publisher,
    title,
    description,
    effectivePeriod: { start: startdate }
  };

  if (approvaldate) {
    resource.approvalDate = approvaldate;
  }

  if (enddate) {
    resource.effectivePeriod.end = enddate;
  }

  if (resource.effectivePeriod.end < resource.effectivePeriod.start) {
    delete resource.effectivePeriod.end;
  }

  return resource;
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
    const resource = buildResource(row);
    await putResource(url, resource);
  }
}

module.exports = { run };
