-- Get all responses for all questions within all forms.
-- The question section does not matter here.

select
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as asmtid,
  data_ele_qstn.data_ele_qstn_id as questionid,
  asmt_rspns_val.data_ele_rspns_val_id as responseid,
  rspns_val_cd as responsecode,
  rspns_val_txt as responsetext
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
where data_ele_qstn.qstn_stus_id = 1 -- only active questions
order by
  asmt.asmt_shrt_name,
  asmt_vrsn.asmt_vrsn_id,
  asmt_qstn.asmt_itm_id,
  rspns_val_cd
