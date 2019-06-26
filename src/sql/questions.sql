-- This is the list of questions contained within each assessment.
-- Each row is one question and also contains information about the assessment and the
-- section in the assessment.

select
  concat(asmt.asmt_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as asmtid,
  asmt_sect_rfrnc.asmt_sect_id as sectionid,
  asmt_sect_rfrnc.asmt_sect_name as sectionname,
  asmt_sect_rfrnc.sect_desc as sectiondesc,
  lower(rspns_dtype_name) as datatype,
  lower(rspns_type_name) as typename,
  rspns_lngth_amt as maxlength,
  data_ele_qstn.data_ele_qstn_id as questionid,
  data_ele_qstn.prnt_data_ele_qstn_id as parentid,
  regexp_replace(data_ele_qstn.qstn_label_name, '[^a-zA-Z0-9]', '', 'g') as label,
  data_ele_qstn.qstn_shrt_name as name,
  data_ele_qstn.qstn_txt as text,
  org_name as publisher
from del_data.asmt_qstn
inner join del_data.asmt_qstn_vrsn on asmt_qstn_vrsn.asmt_qstn_id = asmt_qstn.asmt_qstn_id
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_vrsn_id = asmt_qstn_vrsn.asmt_vrsn_id
inner join del_data.asmt on asmt.asmt_id = asmt_vrsn.asmt_id
inner join del_data.data_ele_qstn on data_ele_qstn.data_ele_qstn_id = asmt_qstn.data_ele_qstn_id
inner join del_data.asmt_sect_rfrnc on asmt_sect_rfrnc.asmt_sect_id = asmt_qstn.asmt_sect_id
inner join del_data.org on asmt.ownr_org_id = org.org_id
left join del_data.data_ele_rspns on data_ele_rspns.data_ele_rspns_id = data_ele_qstn.data_ele_qstn_id
where data_ele_qstn.qstn_stus_id = 1 -- only active questions
order by
  asmt.asmt_shrt_name,
  asmt_vrsn.asmt_vrsn_id,
  asmt_sect_rfrnc.asmt_sect_name,
  regexp_replace(asmt_qstn.asmt_itm_id, '[^0-9]+', '', 'g')::int,
  asmt_qstn.asmt_itm_id
