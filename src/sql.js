const { readFileSync } = require('fs');
const { resolve } = require('path');

let QUESTIONNAIRE_RESPONSE_MAP = null;

const QUESTIONNAIRES_SQL = readFileSync(resolve('./src/sql/questionnaires.sql'), 'utf8');
const QUESTIONS_SQL = readFileSync(resolve('./src/sql/questions.sql'), 'utf8');
const MEASURES_SQL = readFileSync(resolve('./src/sql/measures.sql'), 'utf8');
const RESPONSES_SQL = readFileSync(resolve('./src/sql/responses.sql'), 'utf8');

/**
 * Get a flat list of all questionnaire versions.
 *
 * @param {import('pg').Client} client
 */
async function getAllQuestionnaires(client) {
  return client.query(QUESTIONNAIRES_SQL);
}

/**
 * Get a flat list of all questionnaire versions (for libraries).
 *
 * @param {import('pg').Client} client
 */
async function getAllLibraries(client) {
  return client.query(QUESTIONNAIRES_SQL);
}

/**
 * The query result is a flat list with at least these columns:
 *   asmtid, sectionid, questionid, ...
 *
 * Convert it to a mapping that looks like this:
 * {
 *   asmtid: [{...row}, {...row}]
 * }
 *
 * That way you can look it up like this: mapping[asmtid]
 *
 * @param {import('pg').Client} client
 */
async function getQuestionnaireQuestions(client) {
  const result = await client.query(QUESTIONS_SQL);

  const map = {};
  for (const row of result.rows) {
    if (!map[row.asmtid]) {
      map[row.asmtid] = [];
    }
    map[row.asmtid].push(row);
  }
  return map;
}

/**
 * The query result is a flat list with these columns:
 *   asmtid, questionid, responseid, responsecode, responsetext
 *
 * Convert it to a nested mapping that looks like this:
 * {
 *   asmtid: {
 *     questionid: [
 *       { responseid, responsecode, responsetext },
 *       { responseid, responsecode, responsetext },
 *     ],
 *     ...
 *   },
 *   ...
 * }
 *
 * That way you can look it up like this: mapping[asmtid][questionid]
 *
 * Cache the results cause this could be slow-ish.
 *
 * @param {import('pg').Client} client
 */
async function getQuestionnaireResponses(client) {
  if (QUESTIONNAIRE_RESPONSE_MAP) {
    return QUESTIONNAIRE_RESPONSE_MAP;
  }

  QUESTIONNAIRE_RESPONSE_MAP = {};

  const result = await client.query(RESPONSES_SQL);

  for (const row of result.rows) {
    // Add the assessment to the map if it's not there already.
    if (!QUESTIONNAIRE_RESPONSE_MAP[row.asmtid]) {
      QUESTIONNAIRE_RESPONSE_MAP[row.asmtid] = {};
    }

    // Add the question list to the assessment if it's not there already.
    if (!QUESTIONNAIRE_RESPONSE_MAP[row.asmtid][row.questionid]) {
      QUESTIONNAIRE_RESPONSE_MAP[row.asmtid][row.questionid] = [];
    }

    // Add the response to the proper assessment and question.
    QUESTIONNAIRE_RESPONSE_MAP[row.asmtid][row.questionid].push({
      responseid: row.responseid,
      responsecode: row.responsecode,
      responsetext: row.responsetext,
    });
  }

  return QUESTIONNAIRE_RESPONSE_MAP;
}


module.exports = {
  getAllQuestionnaires,
  getQuestionnaireQuestions,
  getQuestionnaireResponses,
  getAllLibraries,
};

// QUESTIONNAIRES_SQL: readFileSync(resolve('./src/sql/questionnaires.sql'), 'utf8'),
// QUESTIONS_SQL: readFileSync(resolve('./src/sql/questions.sql'), 'utf8'),
// MEASURES_SQL: readFileSync(resolve('./src/sql/measures.sql'), 'utf8'),
// RESPONSES_SQL: readFileSync(resolve('./src/sql/responses.sql'), 'utf8'),

// // This is intentionally the same as questionnaires for now.
// LIBRARIES_SQL: readFileSync(resolve('./src/sql/questionnaires.sql'), 'utf8'),
// };
