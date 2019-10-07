-- Each questionnaire is a combination of an assessment, subset, and version.
-- If there are 2 version of an assessment and 2 subsets, it would be represented by 4 rows in this query.

select
  concat(asmt.asmt_shrt_name, '-', asmt_sbst_rfrnc.asmt_sbst_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as asmtid,
  asmt_vrsn.asmt_vrsn_id as version,
  case asmt_vrsn.asmt_stus_id
    when 1 then 'active'
    when 4 then 'retired'
    else 'draft'
  end as status,
  to_char(pblctn_dt, 'YYYY-MM-DD') as approvaldate,
  to_char(efctv_strt_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as startdate,
  to_char(efctv_end_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as enddate,
  regexp_replace(concat(asmt.asmt_shrt_name, '_', asmt_sbst_rfrnc.asmt_sbst_shrt_name), '[^a-zA-Z0-9]', '_', 'g') as name,
  concat(asmt_name, ' - ', asmt_sbst_rfrnc.asmt_sbst_name) as title,
  asmt_desc as description,
  asmt.creat_ts as date,
  org_name as publisher
from del_data.asmt
-- joins for version and subset
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_id = asmt.asmt_id
inner join del_data.asmt_sbst_rfrnc on asmt.asmt_id = asmt_sbst_rfrnc.asmt_id
-- join for organization (publisher)
inner join del_data.org on asmt.ownr_org_id = org.org_id
order by
  asmt.asmt_shrt_name,
  asmt_vrsn.asmt_vrsn_id;
