-- Each questionnaire is a combination of an assessment, subset, and version.
-- If there are 2 version of an assessment and 2 subsets, it would be represented by 4 rows in this query.

select
  concat(asmt.asmt_shrt_name, '-', asmt_sbst_rfrnc.asmt_sbst_shrt_name, '-', asmt_vrsn.asmt_vrsn_id) as "assessmentId",
  asmt_vrsn.asmt_vrsn_id as version,
  case asmt_vrsn.asmt_stus_id
    when 1 then 'active'
    when 4 then 'retired'
    else 'draft'
  end as status,
  to_char(asmt_vrsn.pblctn_dt, 'YYYY-MM-DD') as "approvalDate",
  to_char(efctv_strt_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as "startDate",
  to_char(efctv_end_dt, 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as "endDate",
  regexp_replace(concat(asmt.asmt_shrt_name, '_', asmt_sbst_rfrnc.asmt_sbst_shrt_name), '[^a-zA-Z0-9]', '_', 'g') as name,
  asmt_name as "assessmentName",
  asmt_sbst_rfrnc.asmt_sbst_name as "subsetName",
  asmt_desc as description,
  asmt.creat_ts as date,
  org_name as publisher,
  trim(hit_asmt_cd) as "loincCode",
  trim(asmt_map_txt) as "loincText"
from del_data.asmt
  -- joins for version and subset
  inner join del_data.asmt_vrsn on asmt_vrsn.asmt_id = asmt.asmt_id
  inner join del_data.asmt_sbst_rfrnc on asmt.asmt_id = asmt_sbst_rfrnc.asmt_id
  -- join for organization (publisher)
  inner join del_data.org on asmt.ownr_org_id = org.org_id
  -- joins for loinc codes
  left join del_data.hit_asmt_map on hit_asmt_map.asmt_vrsn_id = asmt_vrsn.asmt_vrsn_id
  left join del_data.hit_std_vrsn on
  hit_std_vrsn.hit_std_vrsn_id = hit_asmt_map.hit_std_vrsn_id and
    hit_std_vrsn.hit_std_id = 1
where asmt_stus_id = 1
--  and asmt.asmt_shrt_name = 'FASI'
-- and asmt_sbst_rfrnc.asmt_sbst_shrt_name = 'FA'
--  and asmt_vrsn.asmt_vrsn_id = '1.1'
order by
  asmt.asmt_shrt_name,
  asmt_vrsn.asmt_vrsn_id;
