const { readFileSync } = require('fs');
const { resolve } = require('path');
const groupBy = require('json-groupby');

const QUESTIONNAIRES_SQL = readFileSync(resolve('./src/sql/questionnaires.sql'), 'utf8');
const QUESTIONS_SQL = readFileSync(resolve('./src/sql/questions.sql'), 'utf8');
const MEASURES_SQL = readFileSync(resolve('./src/sql/measures.sql'), 'utf8');
const RESPONSES_SQL = readFileSync(resolve('./src/sql/responses.sql'), 'utf8');
const LOINC_SQL = readFileSync(resolve('./src/sql/loinc.sql'), 'utf8');

let LOINC_MAP = null;

/**
 * Get a flat list of all questionnaire versions.
 *
 * @param {import('pg').Client} client
 */
async function getAllQuestionnaires(client) {
    const result = await client.query(QUESTIONNAIRES_SQL);
    return result.rows;
}

/**
 * Get a flat list of all questionnaire versions.
 *
 * @param {import('pg').Client} client
 */
async function getAllMeasures(client) {
    const result = await client.query(MEASURES_SQL);
    return result.rows;
}

/**
 * Get a flat list of all questionnaire versions (for libraries).
 *
 * @param {import('pg').Client} client
 */
async function getAllLibraries(client) {
    const result = await client.query(QUESTIONNAIRES_SQL);
    return result.rows;
}

/**
 * The query result is a flat list with at least these columns:
 *   asmtid, sectionid, questionid, ...
 *
 * Group by the given attributes like this: getGroupedQuestions(client, ['asmtid'])
 * That way you can look it up like this: mapping[asmtid]
 *
 * @param {import('pg').Client} client
 * @param {Array<string>} properties
 * @param {Array<string>} attrs
 */
async function getGroupedQuestions(client, properties, attrs = null) {
    const result = await client.query(QUESTIONS_SQL);
    return groupBy(result.rows, properties, attrs);
}

/**
 * The query result is a flat list with at least these columns:
 *   asmtid, questionid, responseid, responsecode, responsetext
 *
 * Group by the given attributes like this: getGroupedQuestions(client, ['asmtid', 'questionid'])
 * That way you can look it up like this: mapping[asmtid][questionid]
 *
 * @param {import('pg').Client} client
 * @param {Array<string>} properties
 */
async function getGroupedResponses(client, properties) {
    const result = await client.query(RESPONSES_SQL);
    return groupBy(result.rows, properties);
}

/**
 * Initialize the LOINC code mapping so you can use the getLoincCode method.
 * Mapping looks like this: LOIC_MAP[type][key]
 *
 * @param {import('pg').Client} client
 */
async function initLoincMap(client) {
    const result = await client.query(LOINC_SQL);
    LOINC_MAP = groupBy(result.rows, ['type', 'key']);
}

/**
 * Get the given loinc code (if any) from the LOINC code mapping with the given type and key(s).
 *
 * @param {string} type
 * @param  {...string} keys
 */
function getLoincCode(type, ...keys) {
    const value = LOINC_MAP[type][keys.join('/')];
    if (value && value.length) {
        return {
            system: 'http://loinc.org',
            display: value[0].text,
            code: value[0].code,
        };
    }
    return null;
}

module.exports = {
    getAllQuestionnaires,
    getGroupedQuestions,
    getGroupedResponses,
    getAllLibraries,
    getAllMeasures,
    initLoincMap,
    getLoincCode,
};
