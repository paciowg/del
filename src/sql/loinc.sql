-- questionnaire loinc codes
select
  'questionnaire' as type,
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as key,
  trim(hit_asmt_cd) as code,
  trim(asmt_map_txt) as text
from del_data.hit_asmt_map
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = hit_asmt_map.asmt_vrsn_id
inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
inner join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_asmt_map.hit_std_vrsn_id and
  hit_std_vrsn.hit_std_id = 1

union all

-- section loinc codes
select
  'section' as type,
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id, '/', hit_sbst_sect_rlp.asmt_sect_id) as key,
  trim(hit_sbst_sect_cd) as code,
  trim(sbst_sect_map_txt) as text
from del_data.hit_sbst_sect_rlp
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = hit_sbst_sect_rlp.asmt_vrsn_id
inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
inner join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_sbst_sect_rlp.hit_std_vrsn_id and
  hit_std_vrsn.hit_std_id = 1

union all

-- question loinc codes
select
  'question' as type,
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id, '/', data_ele_qstn.data_ele_qstn_id) as key,
  trim(hit_qstn_map.hit_qstn_cd) as code,
  trim(hit_qstn_map.qstn_map_txt) as text
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
  hit_std_vrsn.hit_std_id = 1
where
  -- only active questions
  data_ele_qstn.qstn_stus_id = 1

union all

-- response loinc codes
select
  'response' as type,
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id, '/', data_ele_qstn.data_ele_qstn_id, '/', hit_rspns_val_map.data_ele_rspns_id, '/', hit_rspns_val_map.data_ele_rspns_val_id) as key,
  trim(hit_rspns_cd) as code,
  trim(rspns_val_std_map_txt) as text
from del_data.asmt_qstn
inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
inner join del_data.asmt_rspns_val on
  asmt_rspns_val.data_ele_rspns_id = data_ele_qstn.data_ele_qstn_id and
  asmt_rspns_val.asmt_vrsn_id = asmt_vrsn.asmt_vrsn_id and
  asmt_rspns_val.asmt_id = asmt_vrsn.asmt_id
inner join del_data.data_ele_rspns_val on data_ele_rspns_val.data_ele_rspns_val_id = asmt_rspns_val.data_ele_rspns_val_id
inner join del_data.hit_rspns_val_map on
  hit_rspns_val_map.data_ele_rspns_val_id = data_ele_rspns_val.data_ele_rspns_val_id and
  hit_rspns_val_map.data_ele_rspns_id = data_ele_qstn.data_ele_qstn_id and
  hit_rspns_val_map.asmt_vrsn_id = asmt_vrsn.asmt_vrsn_id and
  hit_rspns_val_map.asmt_id = asmt_vrsn.asmt_id
inner join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_rspns_val_map.hit_std_vrsn_id and
  -- only LOINC codes
  hit_std_vrsn.hit_std_id = 1
where
  -- only active questions
  data_ele_qstn.qstn_stus_id = 1
