const { groupBy, putResource } = require('../helpers');
// const { writeFileSync } = require('fs');

const ASSESSMENT_SQL = `
select
  concat(asmt_shrt_name, '-', asmt_vrsn_id) as id,
  asmt_vrsn_id as version,
  case asmt_vrsn.asmt_stus_id
    when 1 then 'active'
    when 4 then 'retired'
    else 'draft'
    end as status,
  to_char(pblctn_dt, 'YYYY-MM-DD') as approvaldate,
  to_char(efctv_strt_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as startdate,
  to_char(efctv_end_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as enddate,
  regexp_replace(asmt_shrt_name, '[^a-zA-Z0-9]', '') as name,
  asmt_name as title,
  asmt_desc as description,
  asmt.creat_ts as date,
  org_name as publisher
from del_data.asmt
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_id = asmt.asmt_id
inner join del_data.org on asmt.ownr_org_id = org.org_id
`;

const SECTION_SQL = `
select distinct
  concat(asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as asmtid,
  -- asmt_vrsn.asmt_id,
  -- asmt_vrsn.asmt_vrsn_id,
  asmt_sect_rfrnc.asmt_sect_id as id,
  asmt_sect_rfrnc.asmt_sect_name as name
from del_data.asmt_qstn
inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
inner join del_data.asmt_sect_rfrnc on asmt_sect_rfrnc.asmt_sect_id = asmt_qstn.asmt_sect_id
`;


function buildResource({ id, version, status, date, name, description, title, publisher, startdate, enddate, approvaldate }) {
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
    status, // active, draft, retired
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

function applySections(resource, sections) {
  if (!sections) {
    return;
  }

  resource.item = [];

  for (const section of sections) {
    resource.item.push({
      linkId: `Section-${section.id}`,
      text: section.name,
      type: 'group',
      readOnly: true,
      // TODO: fill in with actual question
      item: [{ linkId: `Placeholder-${section.id}`, type: 'display', text: 'This is a placeholder.' }]
    });
  }
}


/**
 * Build all assessments and return then as a list of objects.
 *
 * @param {String} url
 * @param {import('pg').Client} client
 */
async function run(url, client) {
  const assessmentResults = await client.query(ASSESSMENT_SQL);

  const sectionResults = await client.query(SECTION_SQL);

  const sectionGroups = groupBy(sectionResults.rows, 'asmtid');

  for (const row of assessmentResults.rows) {
    const resource = buildResource(row);

    applySections(resource, sectionGroups[resource.id]);

    await putResource(url, resource);

    // writeFileSync(`out/temp/questionnaire-${resource.id}.json`, JSON.stringify(resource));
  }
}

module.exports = { run };
