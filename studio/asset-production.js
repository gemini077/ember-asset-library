/* Shared asset production reader: source-order references, master + individual scene camera tasks. */
function studioSceneTasks(a,raw,hardware){
 const r=raw||{},special=hardware?.scene_id===a.id,src=special?hardware:r;
 const images=Object.values(r.current_images||{}),master=special?hardware.master:(r.current_image||images.find(x=>!(/^\d{2}\s/.test(x.title||""))))||{};
 const out=[{no:"00",name:"母图",path:master.path||a.path||"",source:master.url||a.source||"",status:special?hardware.status:(master.status||a.status),prompt:src.master_prompt||a.prompt||"",refs:src.master_reference_uploads||src.reference_uploads||[],blocked:!!(!special&&r.blocked)}];
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
function studioReferencePanel(refs,assets,escape,href,preview){
 const list=Array.isArray(refs)?refs:[];
 if(!list.length)return '<p class="sr-empty">源任务未登记参考图。</p>';
 return '<div class="sr-grid">'+list.map((r,i)=>{
   const x=studioRefMedia(r,assets,href,preview),name=r.name||r.title||r.id||"参考素材",link=x.source||x.original;
   const label="图"+(i+1);
   return '<article class="sr-card" data-reference-index="'+(i+1)+'"><div class="sr-visual">'+
    (x.preview?'<a href="'+escape(x.original||link)+'" target="_blank" rel="noopener"><img src="'+escape(x.preview)+'" alt="'+escape(name)+'" loading="lazy" decoding="async"><span class="sr-unavailable" hidden>预览未加载 · 打开原文件</span></a>':'<span class="sr-unavailable">'+(link?"仅资料链接 · 未绑定图片":"参考图未绑定 / 待提供")+'</span>')+
    '<span class="sr-number">'+label+'</span></div><div class="sr-info"><strong>'+escape(name)+'</strong><small>'+escape(r.purpose||"")+'</small><small class="sr-status">'+escape(r.availability||r.status||(link?"来源已登记":"未绑定来源"))+'</small>'+
    (link?'<a class="sr-source" href="'+escape(link)+'" target="_blank" rel="noopener">原始来源 ↗</a>':"")+'</div></article>';
 }).join("")+'</div>';
}
function studioBindReferenceImages(el){el.querySelectorAll(".sr-visual img").forEach(img=>{const fail=()=>{img.hidden=true;const msg=img.parentElement.querySelector(".sr-unavailable");if(msg)msg.hidden=false};img.addEventListener("error",fail);if(img.complete&&!img.naturalWidth)fail()})}
