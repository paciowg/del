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
  data_ele_qstn.data_ele_qstn_id as id,
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
;



select distinct
  rspns_val_cd as responsecode
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

;




select
  asmt_id,
  asmt_vrsn_id,
  asmt_qstn_id,
  data_ele_rspns_id, -- equals data_ele_qstn_id
  data_ele_rspns_val_id
from del_data.asmt_rspns_val
where data_ele_rspns_id = 517;

select *
from del_data.data_ele_rspns_val
where data_ele_rspns_val_id in (
4820,
8583,
8582,
8581,
8580,
8579,
8584

  )
;



select *
from del_data.data_ele_qstn

select
--   question.data_ele_qstn_id,
--   qstn_label_name,
-- --   qstn_shrt_name,
-- --   qstn_txt,
--   case qstn_stus_id
--     when 1 then 'active'
--     when 4 then 'retired'
--     else 'draft'
--     end as status,
--   qstn_stus_dt,
--   section.asmt_sect_id,
--   section.asmt_sect_name


from del_data.data_ele_qstn as question
inner join del_data.asmt_sect_rfrnc as section on question.asmt_sect_id = section.asmt_sect_id
inner join del_data.asmt_qstn on asmt_qstn.data_ele_qstn_id = question.data_ele_qstn_id

-- 1226 records
-- 1722 records ( need to refine join to asmt_qstn)


select *
from del_data.asmt_qstn
where data_ele_qstn_id = 27;

select *
from del_data.data_ele_qstn
where data_ele_qstn_id = 27;

select *
from del_data.asmt_sect_rfrnc;


-- definition of each section
select *
from del_data.asmt_vrsn



select
  concat(asmt_shrt_name, '-', asmt_vrsn_id) as id,
  asmt_vrsn_id as version,
  case asmt_vrsn.asmt_stus_id
    when 1 then 'active'
    when 4 then 'retired'
    else 'draft'
    end as status,
  to_char(pblctn_dt, 'YYYY-MM-DD') as approvaldate,
  to_char(efctv_strt_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as startdate,
  to_char(efctv_end_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as enddate,
  regexp_replace(asmt_shrt_name, '[^a-zA-Z0-9]', '') as name,
  asmt_name as title,
  asmt_desc as description,
  asmt.creat_ts as date,
  org_name as publisher
from del_data.asmt
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_id = asmt.asmt_id
inner join del_data.org on asmt.ownr_org_id = org.org_id