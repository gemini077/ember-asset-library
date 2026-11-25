/* Identity portraits are approved reference records, not compulsory seven-view production jobs.
   The 17 ID bindings were verified against the project Drive identity portrait folder and all 60 episode records. */
const studioIdentityRegistry = {
  "P-009": {
    "name": "温以宁",
    "url": "https://drive.google.com/file/d/1leFi3P72rEflCvTa8dxvKXdlHj3wK2jd/view"
  },
  "P-040": {
    "name": "欧阳嘉树",
    "url": "https://drive.google.com/file/d/1W21ShP-NdQfR2SHvY5rJJeZkMV-11THP/view"
  },
  "P-051": {
    "name": "陆川",
    "url": "https://drive.google.com/file/d/1LcAN8YgST0SXE4JX9S_UTsmoVU9avhjz/view"
  },
  "P-052": {
    "name": "贺之扬",
    "url": "https://drive.google.com/file/d/1W3maNboCISQTHliLM_ThErKFT3GAQ65i/view"
  },
  "P-053": {
    "name": "顾行舟",
    "url": "https://drive.google.com/file/d/1yCf4J2JkPHQgnN8R_2z3DXQt1lgKNSc3/view"
  },
  "P-054": {
    "name": "周牧",
    "url": "https://drive.google.com/file/d/1n_RUjYcdzV_P-2_Xid7WJqh9DOTjdm7u/view"
  },
  "P-055": {
    "name": "谭屹",
    "url": "https://drive.google.com/file/d/1PBtDxwA9dxmMqWWuSI1Z4GRN8K0IlKRR/view"
  },
  "X-3866297EF": {
    "name": "秦岳",
    "url": "https://drive.google.com/file/d/15sipR1V8tPd1EHOZA5OVeo-VHfWwQQvs/view"
  },
  "X-D8FA6FBE3": {
    "name": "沈清",
    "url": "https://drive.google.com/file/d/1KqC97S-WWGS3hYp2PjIno-8U8HrEODl-/view"
  },
  "P-006": {
    "name": "许禾",
    "url": "https://drive.google.com/file/d/1TL3fS1A-DITLQwsS1b6oBpTw4FL9Ye8J/view"
  },
  "P-007": {
    "name": "何苗",
    "url": "https://drive.google.com/file/d/1DyRiaTIQmZOVq2K3dENw2CEI8fT9nox5/view"
  },
  "P-008": {
    "name": "盛棠",
    "url": "https://drive.google.com/file/d/1NK2l5QLTl9bMZHed1ZUsYFDQl4e87jLE/view"
  },
  "P-010": {
    "name": "赵一禾",
    "url": "https://drive.google.com/file/d/14E2rYLI98xhey24jhckJN_heydOzaWp6/view"
  },
  "P-016": {
    "name": "林森",
    "url": "https://drive.google.com/file/d/1HNBbYdA4-GP8Yr2RIG4dfq6DPelLw_-D/view"
  },
  "P-017": {
    "name": "杜衡",
    "url": "https://drive.google.com/file/d/1v34RCHiRjEMjtSmeQVnafuzACvFmppED/view"
  },
  "X-7F5EE736B": {
    "name": "裁判",
    "url": "https://drive.google.com/file/d/1IKhjz9f05yLPIIi4DB8WYdQAnMrEnUMt/view"
  },
  "X-26BA746C1": {
    "name": "方哲",
    "url": "https://drive.google.com/file/d/1M8mkfD095fkQ5ni7Pwmi-A0NFiR16Wxf/view"
  }
};
function studioIdentityAsset(a, record, approved, portraits) {
  const verified = studioIdentityRegistry[a.id];
  const master = Object.values(approved||{}).find(x=>x.id===a.id&&x.kind==="身份母版"&&x.status==="已通过");
  const portrait = Object.values(portraits||{}).find(x=>x.id===a.id&&String(x.status).includes("已通过"));
  const portraitURL = verified?.url || portrait?.url || "";
  const isApproved = !!(master || portraitURL);
  return {...a,kind:"人物",identity:true,identityVerified:isApproved,portraitURL,
    status:master?"已通过 · 身份母版":isApproved?"已通过 · 身份肖像":"身份参考未登记 · 待核实",
    path:master?.path||"",source:master?.url||portraitURL||"",
    prompt:"",refs:[],
    raw:record||a.raw};
}
function studioIdentityTask(a){return !a.identity;}
