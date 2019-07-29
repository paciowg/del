-- Get all LOINC codes for all questions within all forms.
-- The question section does not matter here.

select
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as asmtid,
  data_ele_qstn.data_ele_qstn_id as questionid,
  max(hit_std_vrsn.hit_std_vrsn_txt) as latestversion,
  hit_qstn_map.hit_qstn_cd as loinccode
from del_data.asmt_qstn
inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
inner join del_data.hit_qstn_map on
  hit_qstn_map.asmt_qstn_id = asmt_qstn_vrsn.asmt_qstn_id and
  hit_qstn_map.asmt_id = asmt_qstn_vrsn.asmt_id and
  hit_qstn_map.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
inner join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_qstn_map.hit_std_vrsn_id and
  -- only LOINC codes
  hit_std_vrsn.hit_std_vrsn_id in (1, 2, 3, 4, 6, 8, 9)
where
  -- only active questions
  data_ele_qstn.qstn_stus_id = 1
  -- and asmt_vrsn.asmt_vrsn_id = 'C2-012017'
group by
  asmt.asmt_shrt_name,
  asmt_vrsn.asmt_vrsn_id,
  questionid,
  loinccode
order by
  asmt.asmt_shrt_name,
  asmt_vrsn.asmt_vrsn_id,
  questionid
