<h1>Questionnaire Resource</h1>

<p>
    Each questionnaire resource represents a single subset of an assessment.
    The sections and questions will be represented as items within the questionnaire.
    Only active questions are migrated from the DEL.
</p>

<p>
    <b>Example:</b> Hospice Item Set version 1.00.0 has two subsets - one for admission and one for discharge.
    This will result in two questionnaire resources: <code>HIS-HA-1.00.0</code> and <code>HIS-HD-1.00.0</code>.
</p>

<table class="table table-bordered">
    <tr>
        <th>FHIR Field</th>
        <th>DEL Field(s)</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td>id</td>
        <td>
            asmt.asmt_shrt_name<br>
            asmt_sbst_rfrnc.asmt_sbst_shrt_name<br>
            asmt_sbst_rfrnc.asmt_sbst_shrt_name</td>
        <td>
            Fields are joined using a dash (-) in the format
            <code>{asmt_shrt_name}-{asmt_sbst_rfrnc.asmt_sbst_shrt_name}-{asmt_vrsn_id}</code>.
            Example: LCDS-1.01.
        </td>
    </tr>
    <tr>
        <td>name</td>
        <td>asmt.asmt_shrt_name</td>
        <td>All characters except letters and numbers are removed.</td>
    </tr>
    <tr>
        <td>title</td>
        <td>asmt.asmt_name</td>
        <td></td>
    </tr>
    <tr>
        <td>version</td>
        <td>asmt.asmt_vrsn_id</td>
        <td></td>
    </tr>
    <tr>
        <td>status</td>
        <td>asmt_vrsn.asmt_stus_id</td>
        <td>If value is 1 then "active".<br>If value is 4 then "retired".<br>All others are "draft".</td>
    </tr>
    <tr>
        <td>date</td>
        <td>asmt.creat_ts</td>
        <td></td>
    </tr>
    <tr>
        <td>publisher</td>
        <td>org.org_name</td>
        <td></td>
    </tr>
    <tr>
        <td>description</td>
        <td>asmt.asmt_desc</td>
        <td></td>
    </tr>
    <tr>
        <td>effectivePeriod.start</td>
        <td>asmt_vrsn.efctv_strt_dt</td>
        <td></td>
    </tr>
    <tr>
        <td>effectivePeriod.end</td>
        <td>asmt_vrsn.efctv_end_dt</td>
        <td>Only populated if field value is not null.</td>
    </tr>
    <tr>
        <td>approvalDate</td>
        <td>asmt_vrsn.pblctn_dt</td>
        <td>Only populated if field value is not null.</td>
    </tr>
    <tr>
        <td>identifier[0].system</td>
        <td><i>http://del.cms.gov</i></td>
        <td>Hard-coded to value "http://del.cms.gov".</td>
    </tr>
    <tr>
        <td>identifier[0].use</td>
        <td><i>official</i></td>
        <td>Hard-coded to value "official".</td>
    </tr>
    <tr>
        <td>identifier[0].value</td>
        <td>asmt.asmt_name</td>
        <td></td>
    </tr>
    <tr>
        <td>code[0].system</td>
        <td><i>http://loinc.org</i></td>
        <td>Hard-coded to value "http://loinc.org".<br>Only populated if the assessment has a LOINC code.</td>
    </tr>
    <tr>
        <td>code[0].code</td>
        <td>hit_asmt_map.hit_asmt_cd</td>
        <td>Only populated if the assessment has a LOINC code.</td>
    </tr>
    <tr>
        <td>code[0].display</td>
        <td>hit_asmt_map.asmt_map_txt</td>
        <td>Only populated if the assessment has a LOINC code.</td>
    </tr>
    <tr>
        <td>item[]</td>
        <td></td>
        <td>Populated with list of questions or list of sections.</td>
    </tr>
</table>

<h2>Section Mapping</h2>

<table class="table table-bordered">
    <tr>
        <th>FHIR Field</th>
        <th>DEL Field(s)</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td>item[].linkId</td>
        <td>asmt_sect_rfrnc.asmt_sect_id</td>
        <td>
            Prefixed with a string in the format <code>Section-${asmt_sect_id}</code>
        </td>
    </tr>
    <tr>
        <td>item[].text</td>
        <td>asmt_sect_rfrnc.asmt_sect_name</td>
        <td></td>
    </tr>
    <tr>
        <td>item[].type</td>
        <td><i>group</i></td>
        <td>Hard-coded to value "group".</td>
    </tr>
    <tr>
        <td>item[].readOnly</td>
        <td><i>true</i></td>
        <td>Hard-coded to value "true".</td>
    </tr>
    <tr>
        <td>item[].code[0].system</td>
        <td><i>http://loinc.org</i></td>
        <td>Hard-coded to value "http://loinc.org".<br>Only populated if the section has a LOINC code.</td>
    </tr>
    <tr>
        <td>item[].code[0].code</td>
        <td>hit_sbst_sect_rlp.hit_sbst_sect_cd</td>
        <td>Only populated if the section has a LOINC code.</td>
    </tr>
    <tr>
        <td>item[].code[0].display</td>
        <td>hit_sbst_sect_rlp.sbst_sect_map_txt</td>
        <td>Only populated if the section has a LOINC code.</td>
    </tr>
    <tr>
        <td>item[].item[]</td>
        <td></td>
        <td>Populated with list of questions or list of sub-sections.</td>
    </tr>
</table>

<h2>Question Mapping</h2>

<p>Questions may be nested within a section or within parent questions.</p>

<p>
    Questions with a type of "choice" and "open-choice" will have answerOption array populated with a list of available
    options. This list may include DEL and/or LOINC code options. For example, the following answerOption values may
    be present on a question. Both represent the same answer in a different code system.
</p>

<pre>
{
    "valueCoding": {
        "system": "http://del.cms.gov",
        "code": "1",
        "display": "Nursing home (SNF/NF)"
    }
},
{
    "valueCoding": {
        "system": "http://loinc.org",
        "code": "LA10882-1",
        "display": "Nursing home (SNF/NF)"
    }
},
</pre>

<table class="table table-bordered">
    <tr>
        <th>FHIR Field</th>
        <th>DEL Field(s)</th>
        <th>Notes</th>
    </tr>
    <tr>
        <td>item[].linkId</td>
        <td>
            asmt_sect_rfrnc.asmt_sect_id<br>
            data_ele_qstn.qstn_label_name
        </td>
        <td>
            Prefixed with a string in the format <code>Section-${asmt_sect_id}/${qstn_label_name}</code>
            All characters except letters and numbers are removed from qstn_label_name.
        </td>
    </tr>
    <tr>
        <td>item[].prefix</td>
        <td>data_ele_qstn.qstn_label_name</td>
        <td>All characters except letters and numbers are removed from qstn_label_name.</td>
    </tr>
    <tr>
        <td>item[].text</td>
        <td>data_ele_qstn.qstn_txt</td>
        <td></td>
    </tr>
    <tr>
        <td>item[].type</td>
        <td>data_ele_rspns.rspns_dtype_name</td>
        <td>
            If this is a "parent" question, then "group".<br>
            If value is "character" or "integer" with options, then "choice".<br>
            If value is "character" without options then "text".<br>
            If value is "number" without options then "integer".<br>
            If value is "date" then "open-choice".
        </td>
    </tr>
    <tr>
        <td>item[].readOnly</td>
        <td>data_ele_rspns.rspns_dtype_name</td>
        <td>
            If field is a group then "true".
            <br>Otherwise "false".
        </td>
    </tr>
    <tr>
        <td>item[].repeats</td>
        <td>data_ele_rspns.rspns_type_name</td>
        <td>
            If value is checklist then "true".
            <br>Otherwise "false".
        </td>
    </tr>
    <tr>
        <td>item[].maxLength</td>
        <td></td>
        <td>Populated with list of questions.</td>
    </tr>
    <tr>
        <td>item[].code[0].system</td>
        <td><i>http://loinc.org</i></td>
        <td>Hard-coded to value "http://loinc.org".<br>Only populated if the question has a LOINC code.</td>
    </tr>
    <tr>
        <td>item[].code[0].code</td>
        <td>hit_qstn_map.hit_qstn_cd</td>
        <td>Only populated if the question has a LOINC code.</td>
    </tr>
    <tr>
        <td>item[].code[0].display</td>
        <td>hit_qstn_map.qstn_map_txt</td>
        <td>Only populated if the question has a LOINC code.</td>
    </tr>
    <tr>
        <td><b>DEL Answer</b><br>answerOption[].valueCoding.code</td>
        <td>data_ele_rspns_val.rspns_val_cd</td>
        <td>Only populated for "choice" and "open-choice" questions.</td>
    </tr>
    <tr>
        <td><b>DEL Answer</b><br>answerOption[].valueCoding.display</td>
        <td>data_ele_rspns_val.rspns_val_txt</td>
        <td>Only populated for "choice" and "open-choice" questions.</td>
    </tr>
    <tr>
        <td><b>LOINC Answer</b><br>answerOption[].valueCoding.code</td>
        <td>hit_rspns_val_map.hit_rspns_cd</td>
        <td>
            Only populated for "choice" and "open-choice" questions.<br>
            Only populated if the response has a LOINC code.
        </td>
    </tr>
    <tr>
        <td><b>LOINC Answer</b><br>answerOption[].valueCoding.display</td>
        <td>hit_rspns_val_map.rspns_val_std_map_txt</td>
        <td>
            Only populated for "choice" and "open-choice" questions.<br>
            Only populated if the response has a LOINC code.
        </td>
    </tr>
    <tr>
        <td>item[].item[]</td>
        <td></td>
        <td>Populated with list of sub-questions. Will not be present if there are no sub-questions.</td>
    </tr>
</table>
