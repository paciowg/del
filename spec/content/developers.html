<h1>Developers Guide</h1>

<p>This page exists to help developers get started using the data in the DEL through the FHIR server.</p>

<p>
    In the examples below, substitute &lt;fhir-server&gt; with the location of the FHIR server containing
    this implemtation guide and all the DEL questionnaire resources.
</p>

<h2>Basic Operations</h2>

<p>
    Questionnaires store the entire structure and hierarchy of a standard form. A questionnaire is useful if you wish to
    recreate the paper form that the questionnaire represents.
</p>

<p>
    Each questionnaire resource represents a single standard form, subset, and version.
    For example, IRF-PAI 3.0 has both an Admission subset and a Discharge subset.
    These are represented as two separate resources: <code>IRF-PAI-IA-3.0</code> and <code>IRF-PAI-ID-3.0</code>
</p>

<p>
    All the questionnaires use the following FHIR profile:<br>
    https://impact-fhir.mitre.org/r4/StructureDefinition/del-StandardForm
</p>

<p>To retrieve all the standard forms, query for questionnaires matching the profile:</p>

<pre>GET https://&lt;fhir-server&gt;/Questionnaire?_profile=https://impact-fhir.mitre.org/r4/StructureDefinition/del-StandardForm</pre>

<p>To retrieve a single standard form, simply get the questionnaire by ID:</p>

<pre>GET https://&lt;fhir-server&gt;/Questionnaire/IRF-PAI-IA-3.0</pre>

<h2>Searching</h2>

<p>
    One of the use cases for this implementation guide is the ability to search for questionnaires based on content
    of the questions within the questionnaire.
    For example, one may want to find all questionnaires that contain questions about "influenza".
    This is not possible using the default Questionnaire search parameters.
</p>

<p>
    This implementation guide contains a SearchParameter resource that enables searching by Questionnaire.item.text.
    Before searching by item-text, you must load the SearchParameter resource to the FHIR server.
    If you are using HAPI FHIR Server 4.x.x or later, the server will automatically index all Questionnaire.item.text
    values and enable searching. Other server implementations may vary.
</p>

<p>
    SearchParameter: <a href="SearchParameter-QuestionnaireItemText.html">SearchParameter-QuestionnaireItemText.html</a>
</p>

<p>To search by item text, use the <code>item-text</code> search keyword:</p>

<pre>GET https://&lt;fhir-server&gt;/Questionnaire?item-text=influenza</pre>

<p>
    This will return all questionnaires containing the term "influenza" anywhere in the item text.
    This will return a full representation of each questionnaire, including questions that do not contain the term.
    It is the responsibility of the client to filter returned values further.
</p>

<p>You may also search by any other field defined as searchable on the measure resource:</p>

<p><a href="https://www.hl7.org/fhir/measure.html#search">https://www.hl7.org/fhir/measure.html#search</a></p>

<h2>Answer Options</h2>

<p>Some of the answerOption values use somewhat non-standard types due to the data present in the DEL.</p>

<h3>Minimum and Maximum Value</h3>

<p>
    For questions with integer answers, if there is a minimum and/or maximum value, this will be represented as
    an open-choice question with answerOption values with "Maximum value" and "Minumum value" options.
</p>

<p>There may be other options present in addition to minumum and maximum value options.</p>

<pre>
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "15",
        "display": "Maximum value"
    }
},
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "00",
        "display": "Minimum value"
    }
},
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "99",
        "display": "Unable to complete interview"
    }
}
</pre>

<h3>Dates</h3>

<p>
    This implementation guide does not use the date type for date questions.
    This is because date fields may also specify answer options that are not compatible with FHIR's date type.
    All date fields will be represented as open-choice and will have an answerOption with type display
    of YYYY, MMYYYY, or DDMMYYY which represents the expected date formats that can be sent as valid answers.
</p>

<pre>
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "MMDDYYYY",
        "display": "{Patient/Resident} Birthdate"
    }
},
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "MMYYYY",
        "display": "{Patient/Resident} Birthdate (if day of month is unknown)"
    }
},
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "YYYY",
        "display": "{Patient/Resident} Birthdate (if month and day unknown)"
    }
},
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "^",
        "display": "Blank (skip pattern)"
    }
}
</pre>

<h2>LOINC Codes</h2>

<p>LOINC codes are present on all levels of each questionnaire.</p>

<h3>Questionnaire</h3>

<p>A LOINC code may be present on the questionnaire. Example: </p>

<pre>
"resourceType": "Questionnaire",
"id": "IRF-PAI-IA-3.0",
"name": "IRF_PAI_IA",
"title": "Inpatient Rehabilitation Facility Patient Assessment Instrument - IRF Admission",
"code": [{
    "system": "http://loinc.org",
    "display": "Inpatient Rehabilitation Facility - Patient Assessment Instrument - version 3.0 [CMS Assessment]",
    "code": "89963-3"
}]
</pre>

<h3>Section</h3>

<p>A LOINC code may be present on a section within the questionnaire. Example:</p>

<pre>
"linkId": "Section-2",
"text": "Section B: Hearing, Speech, and Vision",
"type": "group",
"readOnly": true,
"code": [{
    "system": "http://loinc.org",
    "display": "IRF-PAI v2.0, v3.0 - Hearing, speech, and vision - admission [CMS Assessment]",
    "code": "88522-8"
}],
</pre>

<h3>Question</h3>

<p>A LOINC code may be present on a question within the questionnaire. Example:</p>

<pre>
"text": "Expression of Ideas and Wants (consider both verbal and ...",
"type": "choice",
"repeats": false,
"readOnly": false,
"code": [{
    "system": "http://loinc.org",
    "display": "Expression of ideas and wants during 3D assessment period [CMS Assessment]",
    "code": "83250-1"
}],
</pre>

<h3>Answer Option</h3>

<p>A LOINC code may be present on an answer option within the questionnaire. Example:</p>

<pre>
"answerOption": [
    {
        "valueCoding": {
            "system": "http://loinc.org",
            "code": "LA9967-6",
            "display": "Expresses complex messages without difficulty ..."
        }
    },
    {
        "valueCoding": {
            "system": "http://loinc.org",
            "code": "LA9966-8",
            "display": "Exhibits some difficulty with expressing needs ..."
        }
    }
]
</pre>
