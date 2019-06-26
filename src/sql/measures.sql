-- Get all distinct active questions.
-- These may or may not be linked to an assessment.

select
  data_ele_qstn.data_ele_qstn_id as questionid,
  regexp_replace(data_ele_qstn.qstn_label_name, '[^a-zA-Z0-9]', '', 'g') as label,
  data_ele_qstn.qstn_shrt_name as name,
  data_ele_qstn.qstn_txt as text
from del_data.data_ele_qstn
where qstn_stus_id = 1
order by label
