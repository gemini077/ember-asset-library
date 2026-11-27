/* Shared asset production reader: source-order references, master + individual scene camera tasks. */
function studioSceneTasks(a,raw,hardware){
 const r=raw||{},special=hardware?.scene_id===a.id,src=special?hardware:r;
 const images=Object.values(r.current_images||{}),master=special?hardware.master:(r.current_image||images.find(x=>!(/^\d{2}\s/.test(x.title||""))))||{};
 const out=[{no:"00",name:"母图",path:master.path||a.path||"",source:master.url||a.source||"",status:special?hardware.status:(master.status||a.status),prompt:src.master_prompt||a.prompt||"",refs:src.master_reference_uploads||src.reference_uploads||[],blocked:!!(!special&&r.blocked),approved:special?!hardware.master_pending:master.status==="已通过"}];
 for(const v of src.views||[]){
   const n=String(v.no||"").padStart(2,"0"),im=(special?hardware.shots?.[n]:r.shot_images?.[n])||images.find(x=>String(x.title||"").startsWith(n+" "))||{};
   out.push({no:n,name:v.name||n,path:im.path||"",source:im.url||"",status:v.status||im.status||(v.blocked?"待前置资产":"待制作"),prompt:v.prompt||"",refs:v.reference_uploads||[],blocked:!!(v.blocked||(special&&hardware.master_pending&&n!=="05")),approved:!!v.approved,camera:v.camera||""});
 }
 return out;
}
function studioRefMedia(r,assets,href,preview){
 const source=r.url||r.source_image_url||r.image_url||r.source_document_url||"";
 const driveId=u=>String(u||"").match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1]||"";
 const direct=r.path||r.image_url||r.source_image_url||"";
 const same=source&&assets.find(a=>a.path&&a.source&&(a.source.split("?")[0]===String(source).split("?")[0]||(driveId(source)&&driveId(source)===driveId(a.source))));
 const path=direct||same?.path||"";
 const id=driveId(source);
 return {preview:path?preview(path):id?"https://drive.google.com/thumbnail?id="+id+"&sz=w720":"",source:href(source||path),original:href(path||source)};
}
function studioReferencePanel(refs,assets,escape,href,preview,prefix="图"){
 const list=Array.isArray(refs)?refs:[];
 if(!list.length)return '<p class="sr-empty">源任务未登记参考图。</p>';
 return '<div class="sr-grid">'+list.map((r,i)=>{
   const x=studioRefMedia(r,assets,href,preview),name=r.name||r.title||r.id||"参考素材",link=x.source||x.original;
   const label=prefix+(i+1);
   return '<article class="sr-card" data-reference-index="'+(i+1)+'"><div class="sr-visual">'+
    (x.preview?'<a href="'+escape(x.original||link)+'" target="_blank" rel="noopener"><img src="'+escape(x.preview)+'" alt="'+escape(name)+'" loading="lazy" decoding="async"><span class="sr-unavailable" hidden>预览未加载 · 打开原文件</span></a>':'<span class="sr-unavailable">'+(link?"仅资料链接 · 未绑定图片":"参考图未绑定 / 待提供")+'</span>')+
    '<span class="sr-number">'+label+'</span></div><div class="sr-info"><strong>'+escape(name)+'</strong><small>'+escape(r.purpose||"")+'</small><small class="sr-status">'+escape(r.availability||r.status||(link?"来源已登记":"未绑定来源"))+'</small>'+
    (link?'<a class="sr-source" href="'+escape(link)+'" target="_blank" rel="noopener">原始来源 ↗</a>':"")+'</div></article>';
 }).join("")+'</div>';
}
function studioBindReferenceImages(el){el.querySelectorAll(".sr-visual img").forEach(img=>{const fail=()=>{img.hidden=true;const msg=img.parentElement.querySelector(".sr-unavailable");if(msg)msg.hidden=false};img.addEventListener("error",fail);if(img.complete&&!img.naturalWidth)fail()})}

function studioAuxiliaryPanel(record,assets,escape,href,preview){
 const r=record||{},inputs=Array.isArray(r.composition_inputs)?r.composition_inputs:[],links=[...(Array.isArray(r.styling_web_references)?r.styling_web_references:[]),...(Array.isArray(r.campaign_references)?r.campaign_references:[]),...(r.design_reference?.url?[r.design_reference]:[])];
 const resolved=inputs.map(x=>{const n=String(x.name||"").match(/(?:^|\s)(0[1-9])(?:\s|$)/)?.[1];const a=assets.find(y=>y.id===(n?x.asset_id+":"+n:x.asset_id));return {...x,...(!x.url&&!x.path&&a&&!a.blocked&&!/待制作|待新版母图|旧版参考|待生成/.test(String(a.status))&&a.path?{path:a.path,url:a.source||a.path}:{})}});
 const result=resolved.length?'<div class="sp-head"><h3>合成输入 · 非生图上传参考</h3></div>'+studioReferencePanel(resolved,assets,escape,href,preview,"输入"):"";
 const bibliography=links.filter(x=>x&&href(x.url||x.source_url||"")).map(x=>'<a class="sr-source" href="'+escape(href(x.url||x.source_url))+'" target="_blank" rel="noopener">'+escape(x.title||x.name||"设计资料")+' ↗</a>').join("<br>");
 return result+(bibliography?'<div class="sp-head"><h3>设计资料 · 不参与参考图编号</h3></div><p class="sr-empty">'+bibliography+'</p>':"");
}


/* Canonical map asset adapter for the existing STUDIO asset library. */
function studioMapApproved(a){return a?.approved===true&&a?.hasOriginal===true&&!!a.output_image?.path;}
function studioMapGate(g){return g?.approved===true&&Array.isArray(g.evidence_assets)&&g.evidence_assets.length>0;}
function studioMapBlocked(a,m){
 if(studioMapApproved(a))return false;
 if(a.group==="A"&&(!m.assets.filter(x=>x.group!=="A").every(studioMapApproved)||!m.prerequisite_gates.every(studioMapGate)||(a.id==="A2"&&!studioMapApproved(m.assets.find(x=>x.id==="A1")))))return true;
 return a.blocked!==false;
}
function studioMapRefs(a,m){
 const out=[];
 for(const r of a.reference_order||[]){
  const k=r.ref;if(k==="无")continue;
  const x=m.references[k],match=k.match(/^新?([ABCD]\d+)$/),v=match&&m.assets.find(y=>y.id===match[1]),gate=k==="已确认鸣霄磬"?"G01":k.match(/^补齐(G\d+)$/)?.[1],g=gate&&m.prerequisite_gates.find(y=>y.id===gate);
  if(x){out.push({name:k,purpose:r.usage,path:x.path,availability:x.status});continue;}
  if(v){out.push({name:v.id+"｜"+v.name,purpose:r.usage,path:studioMapApproved(v)?v.output_image.path:"",url:studioMapApproved(v)?v.output_image.url:"",availability:studioMapApproved(v)?"已通过":"待前置验收",asset_id:"MAP-"+v.id});continue;}
  if(g){const ev=(g.evidence_assets||[]).filter(e=>typeof e==="object"&&e.path);if(studioMapGate(g)&&ev.length){for(const e of ev)out.push({name:e.title||e.name||k,purpose:r.usage,path:e.path,url:e.url,availability:"已验收"});}else out.push({name:k,purpose:r.usage,availability:studioMapGate(g)?"已验收 · 核对证据":"待确认",asset_id:"MAP-"+gate});continue;}
  out.push({name:k,purpose:r.usage,availability:"待前置验收"});
 }
 return out;
}
function studioMapEntries(m){
 if(!m?.assets?.length)return [];
 const by=new Map(m.assets.map(a=>[a.id,a]));
 const ordered=m.execution_order.map(id=>by.get(id)).filter(Boolean);
 const tasks=ordered.map(a=>({no:a.id,name:a.name,kind:"地图资产",path:studioMapApproved(a)?a.output_image.path:"",source:studioMapApproved(a)?a.output_image.url:"",status:a.status,prompt:a.prompt,refs:studioMapRefs(a,m),blocked:studioMapBlocked(a,m),approved:studioMapApproved(a),raw:a,mapCode:a.id}));
 const gates=m.prerequisite_gates.map(g=>({no:g.id,name:g.name,kind:"验收门槛",status:studioMapGate(g)?"已验收":"待确认",path:"",source:"",prompt:"",blocked:!studioMapGate(g),approved:studioMapGate(g),raw:g,mapCode:g.id,refs:[...(g.id==="G01"?["R02","R03"]:g.id==="G02"?["R01"]:[]).map(k=>({name:k,purpose:m.references[k].meaning,path:m.references[k].path,availability:m.references[k].status})),...(g.evidence_assets||[]).map(e=>typeof e==="string"?{name:e,availability:"已登记"}:{name:e.title||e.name||"验收证据",path:e.path,url:e.url,purpose:e.purpose,availability:e.status||"已登记"})]}));
 const done=tasks.filter(t=>t.approved).length;
 const parent={id:"MAP-YUNYUAN",title:"天穹 · 云垣｜地图资产组",kind:"地图资产",status:done+"/"+tasks.length+" 项已通过 · "+gates.filter(g=>g.approved).length+"/6 门槛验收",path:tasks.find(t=>t.approved)?.path||"",source:"",prompt:"",refs:[],mapGroup:true,tasks:[...tasks,...gates],searchText:tasks.map(t=>t.no+" "+t.name).join(" "),raw:{map_group:true}};
 const children=[...tasks,...gates].map(t=>({id:"MAP-"+t.no,parentId:parent.id,title:t.no+"｜"+t.name,kind:t.kind,status:t.status,path:t.path,source:t.source,prompt:t.prompt,refs:t.refs,blocked:t.blocked,mapCode:t.no,mapChild:true,raw:t.raw}));
 return [parent,...children];
}
