const { readFileSync } = require('fs');
const { resolve } = require('path');

module.exports = {
  QUESTIONNAIRES_SQL: readFileSync(resolve('./src/sql/questionnaires.sql'), 'utf8'),
  QUESTIONS_SQL: readFileSync(resolve('./src/sql/questions.sql'), 'utf8'),
  MEASURES_SQL: readFileSync(resolve('./src/sql/measures.sql'), 'utf8'),
  RESPONSES_SQL: readFileSync(resolve('./src/sql/responses.sql'), 'utf8'),

  // This is intentionally the same as questionnaires for now.
  LIBRARIES_SQL: readFileSync(resolve('./src/sql/questionnaires.sql'), 'utf8'),
};
