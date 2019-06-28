const { writeFileSync } = require('fs');
const groupBy = require('lodash.groupby');

const { QUESTIONNAIRES_SQL, QUESTIONS_SQL } = require('../sql');
const { getResponseMap } = require('../helpers');

function buildQuestionnaire(baseUrl, {
  asmtid, version, status, date, name, description, title, publisher, startdate, enddate, approvaldate
}) {
  const resource = {
    resourceType: 'Questionnaire',
    id: asmtid,
    url: `${baseUrl}/Questionnaire/${asmtid}`,
    // meta: {
    //   profile: ''
    // },
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">${name} standard form version ${version}.<br/><br/>${description}</div>`
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

  if (enddate && enddate > startdate) {
    resource.effectivePeriod.end = enddate;
  }

  return resource;
}

function buildQuestion({ datatype, label, sectionid, text, typename, maxlength }, responses) {
  let type = 'group';
  if (datatype === 'character') type = 'text';
  if (datatype === 'number') type = 'integer';
  if (datatype === 'date') type = 'date';

  const item = {
    linkId: `Section-${sectionid}/${label}`,
    prefix: label,
    text: text.trim(),
    type,
    repeats: typename == 'checklist',
    readOnly: type === 'group',
  };

  if (responses) {

    // Filter by only responses that are not blank.
    item.answerOption = responses.filter(resp => resp.responsecode).map(resp => {

      if (resp.responsetext == 'Maximum value') {
        maxvalue = resp.responsecode;
      }
      if (resp.responsetext == 'Minimum value') {
        minvalue = resp.responsecode;
      }



      return {
        valueCoding: {
          code: resp.responsecode,
          display: resp.responsetext,
        }
      };
    });

    // For text and integer fields, if none of the choices are "Text" or "ICD" then we can set it to choice mode.
    if (item.type != 'date') {
      const nonChoiceResponses = item.answerOption.filter(option => ['Text', 'ICD'].includes(option.valueCoding.code));
      if (!nonChoiceResponses.length) {
        item.type = 'choice';
      }
    }

  }

  if (maxlength) {
    item.maxLength = maxlength;
  }

  return item;
}

function applyQuestions(resource, questions, responses) {
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

    // This is a root question or section. Place directly in the section.
    if (!question.parentid) {
      const item = buildQuestion(question, responses[question.questionid]);
      questionMap[question.questionid] = item;
      section.item.push(item);
      continue;
    }

    // Otherwise we need to find the parent!
    const parent = questionMap[question.parentid];

    // If parent is not found, skip!
    if (!parent) {
      continue;
    }

    // Make sure parent has items array.
    if (!parent.item) {
      parent.item = [];
    }

    // Then add this question to parent.
    const newQuestion = buildQuestion(question, responses[question.questionid]);
    // TODO: Build answerSet if needed.
    parent.item.push(newQuestion);
  }

  // Finally push each section to the questionnaire.
  resource.item = [];
  for (const section of Object.values(sectionMap)) {
    resource.item.push(section);
  }
}

/**
 * Build all questionnaires and return then as a list of objects.
 *
 * @param {string} url
 * @param {import('pg').Client} client
 */
async function run(url, client) {
  const questionnaireResults = await client.query(QUESTIONNAIRES_SQL);

  // Get all questions and group them by questionnaire.
  const questionResults = await client.query(QUESTIONS_SQL);
  const groupedQuestions = groupBy(questionResults.rows, 'asmtid');

  // Get the response mapping for all questions.
  const responseMap = await getResponseMap(client);

  const output = [];

  for (const row of questionnaireResults.rows) {
    const questionnaire = buildQuestionnaire(url, row);

    applyQuestions(questionnaire, groupedQuestions[questionnaire.id], responseMap[questionnaire.id]);

    output.push(questionnaire);

    writeFileSync(`out/json/questionnaires/${questionnaire.id}.json`, JSON.stringify(questionnaire, null, 2));
  }

  return output;
}

module.exports = { run };
