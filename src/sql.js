const { readFileSync } = require('fs');
const { resolve } = require('path');

const QUESTIONNAIRES_SQL = readFileSync(resolve('./src/sql/questionnaires.sql'), 'utf8');
const SECTIONS_SQL = readFileSync(resolve('./src/sql/sections.sql'), 'utf8');
const QUESTIONS_SQL = readFileSync(resolve('./src/sql/questions.sql'), 'utf8');
const RESPONSES_SQL = readFileSync(resolve('./src/sql/responses.sql'), 'utf8');

/**
 * Get a flat list of all questionnaire subset versions.
 *
 * @param {import('pg').Client} client
 */
async function getAllQuestionnaires(client) {
    const result = await client.query({
        name: 'questionnaires',
        text: QUESTIONNAIRES_SQL,
    });
    return result.rows;
}

/**
 * Get a flat list of all sections in a questionnaire.
 *
 * @param {import('pg').Client} client
 */
async function getSectionsForQuestionnaire(client, { assessmentId }) {
    const result = await client.query({
        name: 'sections',
        text: SECTIONS_SQL,
        values: [assessmentId],
    });
    return result.rows;
}

/**
 * Get a flat list of all questions in a questionnaire section.
 *
 * @param {import('pg').Client} client
 */
async function getQuestionsForSection(client, { assessmentId, sectionId }) {
    const result = await client.query({
        name: 'questions',
        text: QUESTIONS_SQL,
        values: [assessmentId, sectionId],
    });
    return result.rows;
}

/**
 * Get a flat list of all responses to a question within an assessment.
 *
 * @param {import('pg').Client} client
 */
async function getResponsesForQuestion(client, { assessmentId, questionId }) {
    const result = await client.query({
        name: 'responses',
        text: RESPONSES_SQL,
        values: [assessmentId, questionId],
    });
    return result.rows;
}

module.exports = {
    getAllQuestionnaires,
    getSectionsForQuestionnaire,
    getQuestionsForSection,
    getResponsesForQuestion,
};
