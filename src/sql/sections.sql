-- This is the list of sections within each assessment and subset.
-- Expects assessmentId to be passed in as a parameter.

select
  "assessmentId",
  "sectionId",
  "sectionName",
  "sectionDesc",
  trim(hit_sbst_sect_cd) as "loincCode",
  trim(sbst_sect_map_txt) as "loincText"
from (
  -- inner query for distinct sections within each assessment
    select distinct
    asmt_vrsn.asmt_vrsn_id,
    asmt_sbst_rfrnc.asmt_sbst_id,
    concat(asmt.asmt_shrt_name, '-', asmt_sbst_rfrnc.asmt_sbst_shrt_name, '-',asmt_vrsn.asmt_vrsn_id) as "assessmentId",
    asmt_sect_rfrnc.asmt_sect_id as "sectionId",
    asmt_sect_rfrnc.asmt_sect_name as "sectionName",
    asmt_sect_rfrnc.sect_desc as "sectionDesc",
    sect_by_asmt.sect_srt_num as "sect_srt_num"
  from del_data.asmt_qstn
    inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
    inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
    inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
    inner join del_data.asmt_sbst_rfrnc on asmt.asmt_id = asmt_sbst_rfrnc.asmt_id
    inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
    -- join to get section
    inner join del_data.asmt_sect_rfrnc on asmt_sect_rfrnc.asmt_sect_id = asmt_qstn_vrsn.asmt_sect_id
    --join to get section order
    inner join del_data.sect_by_asmt on sect_by_asmt.asmt_sect_id =  asmt_sect_rfrnc.asmt_sect_id
  where
      -- only active questions
      data_ele_qstn.qstn_stus_id = 1
  ) sections
  -- joins to get loinc codes
  left join del_data.hit_sbst_sect_rlp on
  hit_sbst_sect_rlp.asmt_vrsn_id = sections.asmt_vrsn_id and
    hit_sbst_sect_rlp.asmt_sbst_id = sections.asmt_sbst_id and
    hit_sbst_sect_rlp.asmt_sect_id = "sectionId"
  left join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_sbst_sect_rlp.hit_std_vrsn_id and
    hit_std_vrsn.hit_std_id = 1
where
  "assessmentId" = $1
order by
"sectionName",
  --order by sect_srt_num
  "sect_srt_num",
  "sectionId";