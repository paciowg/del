-- Each questionnaire is a an assessment and version.
-- If there are 2 version of an assessment, it would be represented by 2 rows in this query.

select
  concat(asmt_shrt_name, '-', asmt_vrsn_id) as asmtid,
  asmt_vrsn_id as version,
  case asmt_vrsn.asmt_stus_id
    when 1 then 'active'
    when 4 then 'retired'
    else 'draft'
    end as status,
  to_char(pblctn_dt, 'YYYY-MM-DD') as approvaldate,
  to_char(efctv_strt_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as startdate,
  to_char(efctv_end_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as enddate,
  regexp_replace(asmt_shrt_name, '[^a-zA-Z0-9]', '', 'g') as name,
  asmt_name as title,
  asmt_desc as description,
  asmt.creat_ts as date,
  org_name as publisher
from del_data.asmt
inner join del_data.asmt_vrsn on asmt_vrsn.asmt_id = asmt.asmt_id
inner join del_data.org on asmt.ownr_org_id = org.org_id
order by
  asmt_shrt_name,
  asmt_vrsn_id
