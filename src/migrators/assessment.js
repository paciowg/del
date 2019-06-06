const { writeFileSync } = require('fs');
const groupBy = require('lodash.groupby');

const { putResource } = require('../helpers');

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
order by asmtid, name
`;

const QUESTION_SQL = `
select
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as asmtid,
  asmt_sect_rfrnc.asmt_sect_id as sectionid,
  asmt_sect_rfrnc.asmt_sect_name as sectionname,
  asmt_sect_rfrnc.sect_desc as sectiondesc,
--   asmt_qstn.asmt_qstn_id,
--   asmt_qstn.asmt_itm_id,
--   asmt_qstn.asmt_sect_id,
--   asmt_qstn.qstn_lkbck_days_cnt,
  lower(rspns_dtype_name) as datatype,
  lower(rspns_type_name) as typename,
  rspns_lngth_amt as maxlength,
  data_ele_qstn.data_ele_qstn_id as id,
  data_ele_qstn.prnt_data_ele_qstn_id as parentid,
  data_ele_qstn.qstn_label_name as label,
  data_ele_qstn.qstn_shrt_name as name,
  data_ele_qstn.qstn_txt as text
-- data_ele_qstn.asmt_sect_id, -- what the heck is this one?
from del_data.asmt_qstn
inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
inner join del_data.asmt_sect_rfrnc on asmt_sect_rfrnc.asmt_sect_id = asmt_qstn.asmt_sect_id
left join del_data.data_ele_rspns on data_ele_rspns.data_ele_rspns_id = data_ele_qstn.data_ele_qstn_id
where data_ele_qstn.qstn_stus_id = 1 -- only active questions
order by
  asmt_vrsn.asmt_vrsn_id,
  asmt_sect_rfrnc.asmt_sect_name,
  regexp_replace(asmt_qstn.asmt_itm_id, '[^0-9]+', '', 'g')::int,
  asmt_qstn.asmt_itm_id
`;

// quesiton linkId is Section-${sectionid}


function buildQuestionnaire({ id, version, status, date, name, description, title, publisher, startdate, enddate, approvaldate }) {
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

// function applySections(resource, sections) {
//   if (!sections) {
//     return;
//   }

//   resource.item = [];

//   for (const section of sections) {
//     const item = {
//       linkId: `Section-${section.id}`,
//       text: section.name.trim(),
//       type: 'group',
//       readOnly: true,
//       // TODO: fill in with actual question
//       item: [{ linkId: `Placeholder-${section.id}`, type: 'display', text: 'This is a placeholder.' }]
//     };

//     resource.item.push(item);
//   }
// }

function buildQuestion(question) {
  let type = 'group';
  if (question.datatype === 'character') type = 'text';
  if (question.datatype === 'number') type = 'integer';
  if (question.datatype === 'date') type = 'date';

  // icd and checklist are choices. checklist allows multiple?

  // Allow only letters, numbers, and dashes
  const label = question.label.replace(/[^a-z0-9\-]/gi, '');

  const item = {
    linkId: label,
    prefix: label,
    text: question.text.trim(),
    type,
    repeats: question.typename == 'checklist',
    readOnly: type === 'group',
  };

  if (question.maxlength) {
    item.maxLength = question.maxlength;
  }

  return item;
}



function applyQuestions(resource, questions) {
  if (!questions) {
    return;
  }

  const questionMap = {};
  const sectionMap = {};

  for (const question of questions) {
    // Check to see if we already have this section.
    // Create a new one if not.
    if (!sectionMap[question.sectionid]) {
      sectionMap[question.sectionid] = {
        linkId: `Section-${question.sectionid}`,
        text: question.sectionname.trim(),
        type: 'group',
        readOnly: true,
        item: []
      };
    }
    const section = sectionMap[question.sectionid];

    // This is a root question. Place directly in the section.
    if (!question.parentid) {
      const item = buildQuestion(question);
      item.item = [];
      questionMap[question.id] = item;
      section.item.push(item);
      // TODO: might have answersSet
      continue;
    }

    // Otherwise we need to find the parent!
    const parent = questionMap[question.parentid];

    // If parent is not found, skip!
    // TODO: this is broken!
    if (!parent) {
      continue;
    }

    const stupid = buildQuestion(question);
    parent.item.push(stupid);


    // console.log('LOOKING FOR PARENT', question.parentid);
    // console.log(question.);
    // if (question.id === 2500) console.log('got em');


    // console.log('parent', parent);

    if (!parent.item) parent.item = [];
    // parent.item.push(buildQuestion(question));
  }

  resource.item = [];
  for (const section of Object.values(sectionMap)) {
    // console.log(id, section);
    resource.item.push(section);
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

  // Get all sections and group them by assessment.
  // const sectionResults = await client.query(SECTION_SQL);
  // const sectionGroups = groupBy(sectionResults.rows, 'asmtid');

  // Get all questions and group them by assessment.
  const questionResults = await client.query(QUESTION_SQL);
  const questionGroups = groupBy(questionResults.rows, 'asmtid');

  for (const row of assessmentResults.rows) {
    // console.log('Questionnnaire', row.id);
    const resource = buildQuestionnaire(row);


    // TODO: Ignore this one for now...
    if (resource.id === 'IRF-PAI-1.10') { continue; }
    if (resource.id === 'MDS3.0-1.10') { continue; }
    if (resource.id === 'OASIS-C-082009') { continue; }
    if (resource.id === 'OASIS-C1-012015') { continue; }




    // applySections(resource, sectionGroups[resource.id]);

    applyQuestions(resource, questionGroups[resource.id]);

    await putResource(url, resource);

    writeFileSync(`out/temp/questionnaire-${resource.id}.json`, JSON.stringify(resource));
  }
}

module.exports = { run };
