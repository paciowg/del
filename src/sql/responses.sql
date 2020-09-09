-- Get all responses for a question qithin an assessment.
-- The question section does not matter here.

select
  responses.*,
  trim(hit_rspns_cd) as "loincCode",
  trim(rspns_val_std_map_txt) as "loincText"
from (
  select
    asmt_vrsn.asmt_vrsn_id,
    asmt_vrsn.asmt_id,
    concat(asmt.asmt_shrt_name, '-', asmt_sbst_rfrnc.asmt_sbst_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as "assessmentId",
    data_ele_qstn.data_ele_qstn_id as "questionId",
    asmt_rspns_val.data_ele_rspns_id as "responseId",
    asmt_rspns_val.data_ele_rspns_val_id as "responseValueId",
    rspns_val_cd as "responseCode",
    rspns_val_txt as "responseText",
    asmt_rspns_val.rspns_srt_num as "rspns_srt_num"
  from del_data.asmt_qstn
    inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
    inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
    inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
    inner join del_data.asmt_sbst_rfrnc on asmt.asmt_id = asmt_sbst_rfrnc.asmt_id
    inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
    inner join del_data.asmt_rspns_val on
      asmt_rspns_val.data_ele_rspns_id = data_ele_qstn.data_ele_qstn_id and
      asmt_rspns_val.asmt_vrsn_id = asmt_vrsn.asmt_vrsn_id and
      asmt_rspns_val.asmt_id = asmt_vrsn.asmt_id
    inner join del_data.data_ele_rspns_val
    on data_ele_rspns_val.data_ele_rspns_val_id = asmt_rspns_val.data_ele_rspns_val_id
  where
    -- only active questions
    data_ele_qstn.qstn_stus_id = 1
) responses
  -- joins for loinc codes
  left join del_data.hit_rspns_val_map on
  hit_rspns_val_map.data_ele_rspns_val_id = "responseValueId" and
    hit_rspns_val_map.data_ele_rspns_id = "questionId" and
    hit_rspns_val_map.asmt_vrsn_id = responses.asmt_vrsn_id and
    hit_rspns_val_map.asmt_id = responses.asmt_id
  left join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_rspns_val_map.hit_std_vrsn_id and
    -- only LOINC codes
    hit_std_vrsn.hit_std_id = 1
where
  "assessmentId" = $1 and
  "questionId" = $2 and
  ( "responseCode" is not null and "responseCode" > '')
order by
  "assessmentId",
  "questionId",
  "rspns_srt_num",
  "responseValueId"
