-- This is the list of questions contained within each assessment, subset, and section.
-- Each row is one question and also contains information about the assessment.

select
  questions.*,
  trim(hit_qstn_map.hit_qstn_cd) as "loincCode",
  trim(hit_qstn_map.qstn_map_txt) as "loincText"
from (
  select
    asmt_vrsn.asmt_id,
    asmt_vrsn.asmt_vrsn_id,
    asmt_sbst_rfrnc.asmt_sbst_id,
    asmt_qstn_vrsn.asmt_qstn_id,
    concat(asmt.asmt_shrt_name, '-', asmt_sbst_rfrnc.asmt_sbst_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as "assessmentId",
    asmt_sect_rfrnc.asmt_sect_id as "sectionId",
    asmt_sect_rfrnc.asmt_sect_name as "sectionName",
    asmt_sect_rfrnc.sect_desc as "sectionDesc",
    lower(data_ele_rspns.rspns_dtype_name) as "dataType",
    lower(data_ele_rspns.rspns_type_name) as "dataTypeName",
    data_ele_rspns.rspns_lngth_amt as "maxLength",
    data_ele_qstn.data_ele_qstn_id as "questionId",
    data_ele_qstn.prnt_data_ele_qstn_id as "parentId",
    regexp_replace(data_ele_qstn.qstn_label_name, '[^a-zA-Z0-9]', '_', 'g') as label,
    data_ele_qstn.qstn_shrt_name as name,
    data_ele_qstn.qstn_txt as text,
    --Get Sort order of questions
    asmt_qstn_vrsn.asmt_qstn_srt_num as "asmt_qstn_srt_num"
  from del_data.asmt_qstn
    inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
    inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
    inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
    inner join del_data.asmt_sbst_rfrnc on asmt.asmt_id = asmt_sbst_rfrnc.asmt_id
    inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
    -- join to get section
    inner join del_data.asmt_sect_rfrnc on asmt_sect_rfrnc.asmt_sect_id = asmt_qstn_vrsn.asmt_sect_id
    -- join to get response type
    left join del_data.data_ele_rspns on data_ele_rspns.data_ele_rspns_id = data_ele_qstn.data_ele_qstn_id
  where
    -- only active questions
    data_ele_qstn.qstn_stus_id = 1
  ) questions
  -- joins for loinc codes
  left join del_data.hit_qstn_map on
  hit_qstn_map.asmt_qstn_id = questions.asmt_qstn_id and
    hit_qstn_map.asmt_id = questions.asmt_id and
    hit_qstn_map.asmt_vrsn_id = questions.asmt_vrsn_id
  left join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_qstn_map.hit_std_vrsn_id and
    hit_std_vrsn.hit_std_id = 1
where
--  "assessmentId" = 'FASI-FA-1.1'
  "assessmentId" = $1 and
  "sectionId" = $2
order by
  "parentId" nulls first,
    --order by new srt_num after parentId
    "asmt_qstn_srt_num"
,
  "questionId";

