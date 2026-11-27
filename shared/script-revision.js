(async function screenplayRevision(){
 const $=s=>document.querySelector(s),bar=$(".bar"),ep=(location.pathname.match(/EP\d{2}/)||[])[0]||"";
 if(!bar||!ep)return;
 let production;try{const r=await fetch(new URL("../shared/production-state.json",location.href),{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);production=await r.json()}catch(e){const m=document.createElement("p");m.textContent="当前剧本版本读取失败；以下仅为旧版制作拆解，请勿作为正式正文。";bar.parentNode.insertBefore(m,bar.nextSibling);return}
 const revision=production?.script_revision, current=revision?.episodes?.[ep];
 if(current&&!document.getElementById("ember-script-revision")){
  const n=Number(ep.slice(2)),vol=revision.volumes?.find(v=>n>=v.start&&n<=v.end)||{title:revision.volume_title,url:revision.volume_url,version:'v10'};
  const banner=document.createElement("div");banner.id="ember-script-revision";banner.style.cssText="margin:12px 16px;padding:12px 16px;border:1px solid #b88f5f;border-radius:6px;background:#b88f5f12;line-height:1.6";const h=document.createElement("strong");h.textContent=ep+" · "+(current.current?.title||current.outline_title)+"｜"+(current.current?vol.version+"正文已更新":"新版大纲 · 正文待替换");banner.append(h);const note=document.createElement("p");note.textContent=revision.note;banner.append(note);for(const [title,url] of [["新版60集大纲",revision.outline_url],...(current.current?[[vol.title,vol.url]]:[])]){const a=document.createElement("a");a.textContent=title+" ↗";a.href=url;a.target="_blank";a.rel="noopener";a.style.marginRight="16px";banner.append(a)}bar.parentNode.insertBefore(banner,bar.nextSibling);

  const caption=current.current?.title||current.outline_title;
  const heading=document.querySelector(".hero h1");if(heading){heading.textContent="第"+n+"集《"+caption+"》 · 旧版资产拆解待复核";}
  document.title="EMBER "+ep+" "+caption+" · 制作拆解待复核";
  const metric=[...document.querySelectorAll(".metric span")].find(x=>x.textContent.trim()==="正式场次");if(metric)metric.textContent="旧版拆解场次";
  const button=document.querySelector('[data-tab="script"]');if(button)button.textContent="当前剧本";
  const section=$("#script");if(section){const original=document.createElement("details");const summary=document.createElement("summary");summary.textContent="旧版拆解原文（待复核，仅供追溯）";original.append(summary);while(section.firstChild)original.append(section.firstChild);const title=document.createElement("h2");title.textContent=current.current?"当前正式剧本 · "+vol.title:"当前分集大纲 · 新版正文待替换";section.append(title);const add=(tag,t)=>{const n=document.createElement(tag);n.textContent=t;n.style.whiteSpace="pre-wrap";section.append(n)};if(current.current){add("h3",current.current.heading);add("p",current.current.front);for(const o of current.current.scenes){add("h3",o.heading_original);add("p",o.scene_text)}add("p",current.current.ending)}else{add("h3",current.outline_title);add("p",current.outline_text)}section.append(original)}
 }
})().catch(e=>console.warn("剧本版本读取失败",e));
