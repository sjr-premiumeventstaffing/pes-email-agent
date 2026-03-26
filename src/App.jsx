import { useState } from "react";

const SARA_PROMPT = `You are Sara Reeder's AI email assistant for Premium Event Staffing (PES), a W-2 event staffing company in Chicago, Denver, and Dallas/Arlington. Sara is the Managing Director and owner.
Style: warm but professional, concise and direct, no em dashes, natural phrasing, does not over-explain.`;

const DEFAULT_FAQS = [
  { q: "What markets do you operate in?", a: "We staff events in Chicago, Denver, and Dallas/Arlington. Travel fees apply for locations more than 30 minutes from city center." },
  { q: "What types of staff do you provide?", a: "We provide bartenders, servers, event captains, barbacks, coat check, and general event support staff - all W-2 employees." },
  { q: "How far in advance should I book?", a: "We recommend at least 2 weeks for standard events, and 4+ weeks for large or complex events." },
  { q: "What is your cancellation policy?", a: "Cancellations within 72 hours may be subject to a fee. Please refer to your signed agreement for details." },
  { q: "Do you provide uniforms?", a: "Yes, staff arrive in professional uniforms. Specific dress code requests can be accommodated with advance notice." },
  { q: "How do I get a quote?", a: "Send us the event date, location, hours, and estimated headcount and we will get a quote to you quickly." }
];

const CATEGORIES = ["Client - Inquiry","Client - Confirmed","Staff - HR","Vendor","Admin/Internal","Urgent","Follow-Up Needed","Finance/Invoice"];

const STAFF_TEMPLATES = [
  { label: "Shift Confirmation", prompt: "Draft a shift confirmation message to a staff member. Include: event date, time, location, dress code reminder, and ask them to confirm back." },
  { label: "No-Call/No-Show", prompt: "Draft a professional but firm message to a staff member who had a no-call/no-show. Reference PES attendance policy and outline next steps." },
  { label: "Late Arrival Warning", prompt: "Draft a coaching message to a staff member who arrived late to an event. Professional, document the incident, set clear expectations going forward." },
  { label: "Performance Coaching", prompt: "Draft a constructive coaching message to a staff member about performance issues. Warm but clear, with specific expectations going forward." },
  { label: "Great Job Recognition", prompt: "Draft a short warm recognition message to a staff member who did an excellent job. Specific and sincere." },
  { label: "Availability Request", prompt: "Draft a message asking a staff member for their availability for an upcoming event. Brief and easy to respond to." }
];

const C = {
  cream:"#FAF7F2",warm:"#F5EFE6",gold:"#C9A84C",goldLight:"#E8C97A",
  brown:"#5C3D2E",brownLight:"#8B6352",charcoal:"#2C2C2C",slate:"#6B7280",
  white:"#FFFFFF",green:"#2D6A4F",red:"#9B2335",border:"#E8DDD0",blue:"#1D4ED8"
};

const S = {
  container:{fontFamily:"'Georgia','Times New Roman',serif",background:C.cream,minHeight:"100vh",display:"flex",flexDirection:"column",color:C.charcoal},
  header:{background:`linear-gradient(135deg,${C.brown} 0%,${C.brownLight} 100%)`,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(92,61,46,0.3)"},
  headerTitle:{color:C.goldLight,fontSize:"13px",fontWeight:"bold",letterSpacing:"0.12em",textTransform:"uppercase",margin:0},
  headerSub:{color:"rgba(255,255,255,0.7)",fontSize:"10px",letterSpacing:"0.08em",marginTop:"2px"},
  tabs:{display:"flex",background:C.warm,borderBottom:`1px solid ${C.border}`,overflowX:"auto"},
  tab:(a)=>({padding:"9px 11px",fontSize:"10px",fontFamily:"'Georgia',serif",cursor:"pointer",border:"none",background:"transparent",color:a?C.brown:C.slate,borderBottom:a?`2px solid ${C.gold}`:"2px solid transparent",fontWeight:a?"bold":"normal",whiteSpace:"nowrap",transition:"all 0.2s"}),
  body:{flex:1,padding:"16px",overflowY:"auto"},
  card:{background:C.white,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"14px",marginBottom:"12px",boxShadow:"0 1px 4px rgba(92,61,46,0.08)"},
  label:{fontSize:"10px",fontFamily:"'Georgia',serif",letterSpacing:"0.1em",textTransform:"uppercase",color:C.brownLight,fontWeight:"bold",marginBottom:"6px",display:"block"},
  textarea:{width:"100%",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"10px",fontSize:"12px",fontFamily:"'Georgia',serif",color:C.charcoal,background:C.cream,resize:"vertical",minHeight:"80px",outline:"none",boxSizing:"border-box",lineHeight:1.6},
  input:{width:"100%",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"8px 10px",fontSize:"12px",fontFamily:"'Georgia',serif",color:C.charcoal,background:C.cream,outline:"none",boxSizing:"border-box"},
  select:{width:"100%",border:`1px solid ${C.border}`,borderRadius:"6px",padding:"8px 10px",fontSize:"12px",fontFamily:"'Georgia',serif",color:C.charcoal,background:C.cream,outline:"none",boxSizing:"border-box"},
  btn:(v="primary")=>({padding:"8px 14px",borderRadius:"6px",border:"none",fontSize:"11px",fontFamily:"'Georgia',serif",letterSpacing:"0.07em",fontWeight:"bold",cursor:"pointer",transition:"all 0.2s",
    background:v==="primary"?`linear-gradient(135deg,${C.brown},${C.brownLight})`:v==="gold"?`linear-gradient(135deg,${C.gold},${C.goldLight})`:v==="green"?`linear-gradient(135deg,${C.green},#40916C)`:v==="ghost"?"transparent":C.warm,
    color:v==="primary"?C.white:v==="gold"?C.brown:v==="green"?C.white:v==="ghost"?C.brownLight:C.brown,
    border:v==="ghost"?`1px solid ${C.border}`:"none"}),
  resultBox:{background:`linear-gradient(135deg,${C.warm},${C.cream})`,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.gold}`,borderRadius:"6px",padding:"12px",fontSize:"12px",fontFamily:"'Georgia',serif",color:C.charcoal,lineHeight:1.7,whiteSpace:"pre-wrap",marginTop:"10px"},
  tag:(color="brown")=>({display:"inline-block",padding:"2px 8px",borderRadius:"12px",fontSize:"10px",fontFamily:"'Georgia',serif",background:color==="gold"?`${C.goldLight}33`:color==="green"?"#D1FAE5":color==="red"?"#FEE2E2":color==="blue"?"#DBEAFE":`${C.brownLight}22`,color:color==="gold"?C.brown:color==="green"?C.green:color==="red"?C.red:color==="blue"?C.blue:C.brownLight,border:`1px solid ${color==="gold"?C.gold+"44":"transparent"}`,marginRight:"4px",marginBottom:"4px"}),
  loading:{display:"flex",alignItems:"center",gap:"8px",color:C.brownLight,fontSize:"11px",fontStyle:"italic",padding:"10px 0"},
  divider:{borderTop:`1px solid ${C.border}`,margin:"12px 0"},
  small:{fontSize:"11px",color:C.slate,lineHeight:1.5}
};

function Spinner(){
  return(
    <div style={S.loading}>
      <div style={{width:14,height:14,border:`2px solid ${C.border}`,borderTop:`2px solid ${C.gold}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      Processing...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

async function callClaude(messages,systemExtra=""){
  const system=SARA_PROMPT+(systemExtra?"\n\n"+systemExtra:"");
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-3-5-haiku-20241022",max_tokens:1200,system,messages})
  });
const data=await res.json();
  console.log("Anthropic response:",JSON.stringify(data));
  return data.content?.map(b=>b.text||"").join("")||"";
}

function useCopy(){
  const [copied,setCopied]=useState(false);
  function copy(text){navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1500);}
  return[copied,copy];
}

// DAILY BRIEFING
function DailyBriefing({quotes,followUps}){
  const [emails,setEmails]=useState("");
  const [briefing,setBriefing]=useState("");
  const [loading,setLoading]=useState(false);
  const [copied,copy]=useCopy();
  const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const pendingQuotes=quotes.filter(q=>q.status==="Pending");
  const overdueFollowUps=followUps.filter(f=>!f.done&&new Date(f.dueDate)<new Date());
  const openTasks=followUps.filter(f=>!f.done);

  async function generate(){
    setLoading(true);setBriefing("");
    try{
      const prompt=`Generate a concise morning briefing for Sara for ${today}.\nPending quotes: ${pendingQuotes.length}. Overdue follow-ups: ${overdueFollowUps.length}. Open tasks: ${openTasks.length}.\n${emails?`\nEmails to review:\n${emails}`:""}\nFormat: short punchy bullets. What needs attention today. No fluff.`;
      setBriefing(await callClaude([{role:"user",content:prompt}]));
    }finally{setLoading(false);}
  }

  return(
    <div>
      <div style={{...S.card,borderLeft:`3px solid ${C.gold}`,background:`linear-gradient(135deg,${C.warm},${C.white})`}}>
        <div style={{fontSize:"14px",fontWeight:"bold",color:C.brown,marginBottom:"12px"}}>Good morning, Sara.</div>
        <div style={{display:"flex",gap:"8px"}}>
          {[{label:"Pending Quotes",val:pendingQuotes.length,color:C.gold},{label:"Overdue Follow-Ups",val:overdueFollowUps.length,color:overdueFollowUps.length>0?C.red:C.green},{label:"Open Tasks",val:openTasks.length,color:C.brown}].map(s=>(
            <div key={s.label} style={{flex:1,background:C.cream,borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"22px",fontWeight:"bold",color:s.color}}>{s.val}</div>
              <div style={{...S.small,color:C.brownLight,fontSize:"10px"}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <label style={S.label}>Optional - paste emails for deeper briefing</label>
        <textarea style={S.textarea} value={emails} onChange={e=>setEmails(e.target.value)} placeholder="Paste emails you want included in today's briefing (optional)..." rows={4}/>
        <div style={{marginTop:"10px"}}><button style={S.btn("gold")} onClick={generate}>Generate Morning Briefing</button></div>
      </div>
      {loading&&<Spinner/>}
      {briefing&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <span style={S.label}>Briefing - {today}</span>
            <button style={S.btn("ghost")} onClick={()=>copy(briefing)}>{copied?"Copied!":"Copy"}</button>
          </div>
          <div style={S.resultBox}>{briefing}</div>
        </div>
      )}
      {overdueFollowUps.length>0&&(
        <div style={{...S.card,borderLeft:`3px solid ${C.red}`}}>
          <label style={{...S.label,color:C.red}}>Overdue Follow-Ups</label>
          {overdueFollowUps.map((f,i)=>(
            <div key={i} style={{...S.small,marginBottom:"6px",padding:"6px",background:"#FEF2F2",borderRadius:"4px"}}>
              <strong>{f.client}</strong> - {f.note} <span style={{color:C.red}}>(due {f.dueDate})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// REPLY DRAFTER
function ReplyDrafter({faqs}){
  const [email,setEmail]=useState("");
  const [instruction,setInstruction]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [copied,copy]=useCopy();

  async function draft(){
    if(!email.trim())return;
    setLoading(true);setResult("");
    try{
      const faqCtx=faqs.map(f=>`Q: ${f.q}\nA: ${f.a}`).join("\n\n");
      const sys=`FAQ Knowledge Base:\n\n${faqCtx}\n\nDraft replies as Sara - warm, direct, professional, no em dashes.`;
      const prompt=`Email received:\n\n---\n${email}\n---\n\n${instruction?"Instruction: "+instruction+"\n\n":""}Draft a reply from Sara.`;
      setResult(await callClaude([{role:"user",content:prompt}],sys));
    }finally{setLoading(false);}
  }

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Paste incoming email</label>
        <textarea style={S.textarea} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Paste the email you received here..." rows={5}/>
        <div style={{marginTop:"10px"}}>
          <label style={S.label}>Optional instruction</label>
          <input style={S.input} value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder='e.g. "Be brief" or "Mention we have availability"'/>
        </div>
        <div style={{marginTop:"10px"}}><button style={S.btn("primary")} onClick={draft}>Draft Reply</button></div>
      </div>
      {loading&&<Spinner/>}
      {result&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <span style={S.label}>Drafted Reply</span>
            <button style={S.btn("ghost")} onClick={()=>copy(result)}>{copied?"Copied!":"Copy"}</button>
          </div>
          <div style={S.resultBox}>{result}</div>
        </div>
      )}
    </div>
  );
}

// FOLLOW-UP TRACKER
function FollowUpTracker({followUps,setFollowUps}){
  const [email,setEmail]=useState("");
  const [client,setClient]=useState("");
  const [note,setNote]=useState("");
  const [dueDate,setDueDate]=useState("");
  const [detecting,setDetecting]=useState(false);
  const [draftFor,setDraftFor]=useState(null);
  const [draftResult,setDraftResult]=useState("");
  const [draftLoading,setDraftLoading]=useState(false);
  const [copied,copy]=useCopy();

  async function detect(){
    if(!email.trim())return;
    setDetecting(true);
    try{
      const r=await callClaude([{role:"user",content:`Extract follow-up info from this email. Return ONLY JSON: {client,note,suggestedDaysUntilFollowUp}. No markdown.\n\nEmail:\n${email}`}]);
      const p=JSON.parse(r.replace(/```json|```/g,"").trim());
      setClient(p.client||"");setNote(p.note||"");
      const d=new Date();d.setDate(d.getDate()+(p.suggestedDaysUntilFollowUp||3));
      setDueDate(d.toISOString().split("T")[0]);
    }finally{setDetecting(false);}
  }

  function add(){
    if(!client.trim()||!note.trim()||!dueDate)return;
    setFollowUps(f=>[...f,{id:Date.now(),client,note,dueDate,done:false}]);
    setClient("");setNote("");setDueDate("");setEmail("");
  }

  async function draftEmail(fu){
    setDraftFor(fu.id);setDraftResult("");setDraftLoading(true);
    try{
      const r=await callClaude([{role:"user",content:`Draft a brief warm follow-up email to ${fu.client} regarding: ${fu.note}. Sara's voice, no em dashes, keep it short.`}]);
      setDraftResult(r);
    }finally{setDraftLoading(false);}
  }

  const isOverdue=(d)=>new Date(d)<new Date();
  const active=followUps.filter(f=>!f.done);
  const done=followUps.filter(f=>f.done);

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Detect from email</label>
        <textarea style={{...S.textarea,minHeight:"70px"}} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Paste an email to auto-detect follow-up details..." rows={3}/>
        <button style={{...S.btn("ghost"),marginTop:"8px",marginBottom:"12px"}} onClick={detect} disabled={detecting}>{detecting?"Detecting...":"Auto-detect from Email"}</button>
        <div style={S.divider}/>
        <label style={S.label}>Add manually</label>
        <input style={{...S.input,marginBottom:"8px"}} value={client} onChange={e=>setClient(e.target.value)} placeholder="Client name or company..."/>
        <input style={{...S.input,marginBottom:"8px"}} value={note} onChange={e=>setNote(e.target.value)} placeholder="What needs following up..."/>
        <input type="date" style={{...S.input,marginBottom:"10px"}} value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
        <button style={S.btn("primary")} onClick={add}>Add Follow-Up</button>
      </div>

      {active.length>0&&(
        <div>
          <div style={{...S.label,marginBottom:"8px"}}>Active ({active.length})</div>
          {active.map(fu=>(
            <div key={fu.id} style={{...S.card,borderLeft:`3px solid ${isOverdue(fu.dueDate)?C.red:C.gold}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"bold",fontSize:"12px",color:C.brown}}>{fu.client}</div>
                  <div style={{...S.small,margin:"3px 0"}}>{fu.note}</div>
                  <span style={S.tag(isOverdue(fu.dueDate)?"red":"gold")}>{isOverdue(fu.dueDate)?"Overdue - ":"Due "}{fu.dueDate}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"4px",marginLeft:"8px"}}>
                  <button style={{...S.btn("gold"),padding:"5px 10px",fontSize:"10px"}} onClick={()=>draftEmail(fu)}>Draft</button>
                  <button style={{...S.btn("green"),padding:"5px 10px",fontSize:"10px"}} onClick={()=>setFollowUps(f=>f.map(x=>x.id===fu.id?{...x,done:true}:x))}>Done</button>
                </div>
              </div>
              {draftFor===fu.id&&(
                <div style={{marginTop:"10px"}}>
                  {draftLoading&&<Spinner/>}
                  {draftResult&&<><div style={S.resultBox}>{draftResult}</div><button style={{...S.btn("ghost"),marginTop:"8px"}} onClick={()=>copy(draftResult)}>{copied?"Copied!":"Copy"}</button></>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {done.length>0&&(
        <div>
          <div style={{...S.label,marginBottom:"8px",opacity:0.6}}>Completed ({done.length})</div>
          {done.map(fu=>(
            <div key={fu.id} style={{...S.card,opacity:0.5,padding:"10px 14px"}}>
              <div style={{fontSize:"12px",textDecoration:"line-through",color:C.slate}}>{fu.client} - {fu.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// QUOTE TRACKER
function QuoteTracker({quotes,setQuotes}){
  const [email,setEmail]=useState("");
  const [client,setClient]=useState("");
  const [amount,setAmount]=useState("");
  const [sentDate,setSentDate]=useState(new Date().toISOString().split("T")[0]);
  const [eventDate,setEventDate]=useState("");
  const [notes,setNotes]=useState("");
  const [detecting,setDetecting]=useState(false);
  const [draftFor,setDraftFor]=useState(null);
  const [draftResult,setDraftResult]=useState("");
  const [draftLoading,setDraftLoading]=useState(false);
  const [filter,setFilter]=useState("All");
  const [copied,copy]=useCopy();

  async function detect(){
    if(!email.trim())return;
    setDetecting(true);
    try{
      const r=await callClaude([{role:"user",content:`Extract quote details from this email. Return ONLY JSON: {client,amount,eventDate,notes}. Amount as a number (no $ sign) or null. eventDate as YYYY-MM-DD or null. No markdown.\n\nEmail:\n${email}`}]);
      const p=JSON.parse(r.replace(/```json|```/g,"").trim());
      setClient(p.client||"");setAmount(p.amount?String(p.amount):"");setEventDate(p.eventDate||"");setNotes(p.notes||"");
    }finally{setDetecting(false);}
  }

  function add(){
    if(!client.trim())return;
    setQuotes(q=>[...q,{id:Date.now(),client,amount:amount?`$${Number(amount).toLocaleString()}`:"TBD",sentDate,eventDate,notes,status:"Pending"}]);
    setClient("");setAmount("");setEventDate("");setNotes("");setEmail("");
  }

  async function draftNudge(q){
    setDraftFor(q.id);setDraftResult("");setDraftLoading(true);
    try{
      const r=await callClaude([{role:"user",content:`Draft a brief warm follow-up to ${q.client} about a quote sent ${q.sentDate}${q.amount!=="TBD"?" for "+q.amount:""}${q.eventDate?" for an event on "+q.eventDate:""}. Check in, ask if they have questions, invite them to move forward. Sara's voice, no em dashes, keep it short.`}]);
      setDraftResult(r);
    }finally{setDraftLoading(false);}
  }

  const daysSince=(d)=>Math.floor((new Date()-new Date(d))/(1000*60*60*24));
  const statusColor=s=>s==="Accepted"?"green":s==="Declined"?"red":"gold";
  const filtered=filter==="All"?quotes:quotes.filter(q=>q.status===filter);

  return(
    <div>
      <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
        {[{l:"Total",v:quotes.length,c:C.brown},{l:"Pending",v:quotes.filter(q=>q.status==="Pending").length,c:C.gold},{l:"Accepted",v:quotes.filter(q=>q.status==="Accepted").length,c:C.green},{l:"Declined",v:quotes.filter(q=>q.status==="Declined").length,c:C.red}].map(s=>(
          <div key={s.l} style={{flex:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:"8px",padding:"8px",textAlign:"center"}}>
            <div style={{fontSize:"18px",fontWeight:"bold",color:s.c}}>{s.v}</div>
            <div style={{...S.small,fontSize:"10px",color:C.brownLight}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <label style={S.label}>Detect from email</label>
        <textarea style={{...S.textarea,minHeight:"70px"}} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Paste a quote email to auto-fill details..." rows={3}/>
        <button style={{...S.btn("ghost"),marginTop:"8px",marginBottom:"12px"}} onClick={detect} disabled={detecting}>{detecting?"Detecting...":"Auto-detect from Email"}</button>
        <div style={S.divider}/>
        <label style={S.label}>Add manually</label>
        <input style={{...S.input,marginBottom:"8px"}} value={client} onChange={e=>setClient(e.target.value)} placeholder="Client name or company..."/>
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
          <input style={{...S.input,flex:1}} value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount ($)..."/>
          <input type="date" style={{...S.input,flex:1}} value={sentDate} onChange={e=>setSentDate(e.target.value)}/>
        </div>
        <input type="date" style={{...S.input,marginBottom:"8px"}} value={eventDate} onChange={e=>setEventDate(e.target.value)}/>
        <input style={{...S.input,marginBottom:"10px"}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes..."/>
        <button style={S.btn("primary")} onClick={add}>Add Quote</button>
      </div>

      <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
        {["All","Pending","Accepted","Declined"].map(f=>(
          <button key={f} style={{...S.btn(filter===f?"gold":"ghost"),padding:"5px 10px",fontSize:"10px"}} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      {filtered.map(q=>(
        <div key={q.id} style={{...S.card,borderLeft:`3px solid ${q.status==="Accepted"?C.green:q.status==="Declined"?C.red:daysSince(q.sentDate)>=3?C.red:C.gold}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:"bold",fontSize:"12px",color:C.brown,marginBottom:"3px"}}>{q.client}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"4px"}}>
                <span style={S.tag(statusColor(q.status))}>{q.status}</span>
                {q.amount!=="TBD"&&<span style={S.tag("blue")}>{q.amount}</span>}
                {q.eventDate&&<span style={S.tag()}>Event: {q.eventDate}</span>}
                {q.status==="Pending"&&daysSince(q.sentDate)>=3&&<span style={S.tag("red")}>{daysSince(q.sentDate)}d - nudge!</span>}
              </div>
              {q.notes&&<div style={S.small}>{q.notes}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"4px",marginLeft:"8px"}}>
              {q.status==="Pending"&&<button style={{...S.btn("gold"),padding:"5px 10px",fontSize:"10px"}} onClick={()=>draftNudge(q)}>Nudge</button>}
              <select style={{...S.select,padding:"4px 6px",fontSize:"10px",width:"90px"}} value={q.status} onChange={e=>setQuotes(qs=>qs.map(x=>x.id===q.id?{...x,status:e.target.value}:x))}>
                {["Pending","Accepted","Declined","On Hold"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {draftFor===q.id&&(
            <div style={{marginTop:"10px"}}>
              {draftLoading&&<Spinner/>}
              {draftResult&&<><div style={S.resultBox}>{draftResult}</div><button style={{...S.btn("ghost"),marginTop:"8px"}} onClick={()=>copy(draftResult)}>{copied?"Copied!":"Copy"}</button></>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// EMAIL SUMMARY
function EmailSummary(){
  const [emails,setEmails]=useState("");
  const [range,setRange]=useState("This week");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [copied,copy]=useCopy();

  async function summarize(){
    if(!emails.trim())return;
    setLoading(true);setResult("");
    try{
      const r=await callClaude([{role:"user",content:`Summarize these emails (${range}). Include: key topics, action items or follow-ups needed, important decisions, anything flagged. Clean executive summary for Sara. Be concise.\n\nEmails:\n${emails}`}]);
      setResult(r);
    }finally{setLoading(false);}
  }

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Time range</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
          {["Today","Yesterday","This week","Last week","Last 30 days"].map(r=>(
            <button key={r} style={{...S.btn(range===r?"gold":"ghost"),padding:"6px 10px",fontSize:"10px"}} onClick={()=>setRange(r)}>{r}</button>
          ))}
        </div>
        <label style={S.label}>Paste emails to summarize</label>
        <textarea style={{...S.textarea,minHeight:"120px"}} value={emails} onChange={e=>setEmails(e.target.value)} placeholder="Paste multiple emails here - received, sent, or both..." rows={6}/>
        <div style={{marginTop:"10px"}}><button style={S.btn("primary")} onClick={summarize}>Generate Summary</button></div>
      </div>
      {loading&&<Spinner/>}
      {result&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <span style={S.label}>Summary - {range}</span>
            <button style={S.btn("ghost")} onClick={()=>copy(result)}>{copied?"Copied!":"Copy"}</button>
          </div>
          <div style={S.resultBox}>{result}</div>
        </div>
      )}
    </div>
  );
}

// TASK EXTRACTOR
function TaskExtractor(){
  const [email,setEmail]=useState("");
  const [tasks,setTasks]=useState([]);
  const [loading,setLoading]=useState(false);
  const [checked,setChecked]=useState([]);

  async function extract(){
    if(!email.trim())return;
    setLoading(true);setTasks([]);setChecked([]);
    try{
      const r=await callClaude([{role:"user",content:`Extract all action items, tasks, and follow-ups from this email. Return ONLY a JSON array: [{task,priority,dueDate,assignedTo,context}]. Priority: "high","medium","low". Null for unknown. No markdown.\n\nEmail:\n${email}`}]);
      setTasks(JSON.parse(r.replace(/```json|```/g,"").trim()));
    }catch{setTasks([]);}
    finally{setLoading(false);}
  }

  const pc=p=>p==="high"?"red":p==="medium"?"gold":"green";
  const pb=p=>p==="high"?C.red:p==="medium"?C.gold:C.green;

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Paste email to extract tasks</label>
        <textarea style={S.textarea} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Paste email content - action items and follow-ups will be pulled out..." rows={5}/>
        <div style={{marginTop:"10px"}}><button style={S.btn("primary")} onClick={extract}>Extract Tasks</button></div>
      </div>
      {loading&&<Spinner/>}
      {tasks.map((t,i)=>(
        <div key={i} style={{...S.card,opacity:checked.includes(i)?0.5:1,borderLeft:`3px solid ${pb(t.priority)}`}}>
          <div style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
            <input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(c=>c.includes(i)?c.filter(x=>x!==i):[...c,i])} style={{marginTop:"3px",accentColor:C.brown}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:"12px",fontWeight:checked.includes(i)?"normal":"bold",textDecoration:checked.includes(i)?"line-through":"none",color:C.charcoal,marginBottom:"4px"}}>{t.task}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                <span style={S.tag(pc(t.priority))}>{t.priority||"medium"} priority</span>
                {t.dueDate&&<span style={S.tag("gold")}>Due: {t.dueDate}</span>}
                {t.assignedTo&&<span style={S.tag()}>For: {t.assignedTo}</span>}
              </div>
              {t.context&&<div style={{...S.small,marginTop:"4px",fontStyle:"italic"}}>{t.context}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// AUTO CATEGORIZE
function AutoCategorize(){
  const [email,setEmail]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [override,setOverride]=useState("");
  const [vipAlert,setVipAlert]=useState("");

  const VIP_KEYWORDS=["marriott","hyatt","hilton","united center","wintrust","soldier field","at&t stadium","ball arena","convention center"];

  async function categorize(){
    if(!email.trim())return;
    setLoading(true);setResult(null);setVipAlert("");
    const vip=VIP_KEYWORDS.find(k=>email.toLowerCase().includes(k));
    if(vip)setVipAlert(vip);
    try{
      const r=await callClaude([{role:"user",content:`Analyze this email. Return ONLY JSON: {category,confidence,flag,flagReason,suggestedAction,urgency}. Category must be one of: ${CATEGORIES.join(", ")}. Confidence 0-100. Flag true/false. Urgency: high/medium/low. No markdown.\n\nEmail:\n${email}`}]);
      const p=JSON.parse(r.replace(/```json|```/g,"").trim());
      setResult(p);setOverride(p.category);
    }catch{setResult(null);}
    finally{setLoading(false);}
  }

  return(
    <div>
      {vipAlert&&(
        <div style={{...S.card,borderLeft:`3px solid ${C.gold}`,background:`${C.goldLight}22`,marginBottom:"12px"}}>
          <div style={{fontSize:"12px",fontWeight:"bold",color:C.brown}}>VIP Client Detected</div>
          <div style={S.small}>This email appears to be from or about <strong>{vipAlert}</strong> - flag for priority handling.</div>
        </div>
      )}
      <div style={S.card}>
        <label style={S.label}>Paste email to categorize</label>
        <textarea style={S.textarea} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Paste email - it will be auto-categorized and flagged if needed..." rows={5}/>
        <div style={{marginTop:"10px"}}><button style={S.btn("primary")} onClick={categorize}>Categorize + Flag</button></div>
      </div>
      {loading&&<Spinner/>}
      {result&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
            <span style={S.label}>Classification Result</span>
            <span style={{fontSize:"11px",color:C.slate}}>{result.confidence}% confidence</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
            <span style={S.tag("gold")}>{result.category}</span>
            <span style={S.tag(result.urgency==="high"?"red":result.urgency==="medium"?"gold":"green")}>{result.urgency} urgency</span>
            {result.flag&&<span style={S.tag("red")}>Flagged</span>}
          </div>
          {result.flagReason&&<div style={{...S.small,background:"#FEF3C7",padding:"8px",borderRadius:"4px",marginBottom:"10px"}}>Flag reason: {result.flagReason}</div>}
          {result.suggestedAction&&<div style={{...S.small,fontStyle:"italic",marginBottom:"12px"}}>Suggested action: {result.suggestedAction}</div>}
          <div style={S.divider}/>
          <label style={S.label}>Override category</label>
          <div style={{display:"flex",gap:"8px"}}>
            <select style={{...S.select,flex:1}} value={override} onChange={e=>setOverride(e.target.value)}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <button style={S.btn("gold")}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// STAFF TEMPLATES
function StaffTemplates(){
  const [selected,setSelected]=useState(null);
  const [details,setDetails]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [copied,copy]=useCopy();

  async function generate(){
    if(!selected)return;
    setLoading(true);setResult("");
    try{
      const prompt=`${selected.prompt}${details?"\n\nAdditional context: "+details:""}`;
      setResult(await callClaude([{role:"user",content:prompt}]));
    }finally{setLoading(false);}
  }

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Select template type</label>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"12px"}}>
          {STAFF_TEMPLATES.map(t=>(
            <button key={t.label} style={{...S.btn(selected?.label===t.label?"gold":"ghost"),textAlign:"left",padding:"10px 12px"}} onClick={()=>{setSelected(t);setResult("");}}>
              {t.label}
            </button>
          ))}
        </div>
        {selected&&(
          <>
            <label style={S.label}>Add specific details (optional)</label>
            <textarea style={S.textarea} value={details} onChange={e=>setDetails(e.target.value)} placeholder={`e.g. staff name, event date, specific incident details...`} rows={3}/>
            <div style={{marginTop:"10px"}}><button style={S.btn("primary")} onClick={generate}>Generate Message</button></div>
          </>
        )}
      </div>
      {loading&&<Spinner/>}
      {result&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <span style={S.label}>{selected?.label}</span>
            <button style={S.btn("ghost")} onClick={()=>copy(result)}>{copied?"Copied!":"Copy"}</button>
          </div>
          <div style={S.resultBox}>{result}</div>
        </div>
      )}
    </div>
  );
}

// PAYMENT ALERTS
function PaymentAlerts(){
  const [email,setEmail]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [draftResult,setDraftResult]=useState("");
  const [draftLoading,setDraftLoading]=useState(false);
  const [copied,copy]=useCopy();

  const PAYMENT_KEYWORDS=["invoice","payment","deposit","balance","overdue","past due","owe","bill","charge","refund","receipt"];

  async function scan(){
    if(!email.trim())return;
    setLoading(true);setResult(null);setDraftResult("");
    const found=PAYMENT_KEYWORDS.filter(k=>email.toLowerCase().includes(k));
    try{
      const r=await callClaude([{role:"user",content:`Analyze this email for payment and invoice information. Return ONLY JSON: {hasPaymentContent,summary,amount,dueDate,status,action}. hasPaymentContent true/false. status: "paid","outstanding","overdue","deposit_pending","unknown". action: what Sara should do. No markdown.\n\nEmail:\n${email}`}]);
      const p=JSON.parse(r.replace(/```json|```/g,"").trim());
      setResult({...p,keywords:found});
    }catch{setResult(null);}
    finally{setLoading(false);}
  }

  async function draftReminder(){
    if(!result)return;
    setDraftLoading(true);setDraftResult("");
    try{
      const r=await callClaude([{role:"user",content:`Draft a polite payment reminder email. Context: ${result.summary}${result.amount?", amount: "+result.amount:""}${result.dueDate?", due: "+result.dueDate:""}. Warm but clear. Sara's voice, no em dashes.`}]);
      setDraftResult(r);
    }finally{setDraftLoading(false);}
  }

  const statusColor=s=>s==="paid"?"green":s==="overdue"?"red":s==="outstanding"||s==="deposit_pending"?"gold":"brown";

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Paste email to scan for payment info</label>
        <textarea style={S.textarea} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Paste email - invoices, deposits, and payment details will be flagged..." rows={5}/>
        <div style={{marginTop:"10px"}}><button style={S.btn("primary")} onClick={scan}>Scan for Payment Info</button></div>
      </div>
      {loading&&<Spinner/>}
      {result&&(
        <div style={S.card}>
          {result.hasPaymentContent?(
            <>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
                <span style={S.tag(statusColor(result.status))}>{result.status?.replace("_"," ")}</span>
                {result.amount&&<span style={S.tag("blue")}>{result.amount}</span>}
                {result.dueDate&&<span style={S.tag("gold")}>Due: {result.dueDate}</span>}
              </div>
              {result.summary&&<div style={{...S.small,marginBottom:"10px"}}>{result.summary}</div>}
              {result.action&&<div style={{...S.small,fontStyle:"italic",background:"#FEF3C7",padding:"8px",borderRadius:"4px",marginBottom:"10px"}}>Action: {result.action}</div>}
              {(result.status==="overdue"||result.status==="outstanding"||result.status==="deposit_pending")&&(
                <button style={S.btn("gold")} onClick={draftReminder}>Draft Payment Reminder</button>
              )}
            </>
          ):(
            <div style={{...S.small,color:C.brownLight,textAlign:"center",padding:"10px"}}>No payment-related content detected in this email.</div>
          )}
        </div>
      )}
      {draftLoading&&<Spinner/>}
      {draftResult&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <span style={S.label}>Payment Reminder Draft</span>
            <button style={S.btn("ghost")} onClick={()=>copy(draftResult)}>{copied?"Copied!":"Copy"}</button>
          </div>
          <div style={S.resultBox}>{draftResult}</div>
        </div>
      )}
    </div>
  );
}

// CLIENT ONBOARDING CHECKLIST
function ClientChecklist(){
  const [email,setEmail]=useState("");
  const [client,setClient]=useState("");
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(false);
  const [checked,setChecked]=useState([]);

  const DEFAULT_CHECKLIST=[
    "Quote sent to client","Quote accepted / verbal confirmation received","Contract sent","Signed contract received",
    "Deposit invoice sent","Deposit received","Event details confirmed (date, time, location, headcount)",
    "Staff assigned and scheduled","Staff confirmations received","Day-of contact info shared with client",
    "Post-event invoice sent","Final payment received","Post-event follow-up sent"
  ];

  async function generate(){
    if(!email.trim()&&!client.trim())return;
    setLoading(true);setItems([]);setChecked([]);
    try{
      const prompt=`Generate a client onboarding checklist for${client?" "+client:""} based on this context. Return ONLY a JSON array of checklist item strings. Include all standard PES steps plus any event-specific items. No markdown.\n\n${email?"Email:\n"+email:`Client: ${client}`}`;
      const r=await callClaude([{role:"user",content:prompt}]);
      const p=JSON.parse(r.replace(/```json|```/g,"").trim());
      setItems(p);
    }catch{setItems(DEFAULT_CHECKLIST);}
    finally{setLoading(false);}
  }

  const pct=items.length>0?Math.round((checked.length/items.length)*100):0;

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Client name</label>
        <input style={{...S.input,marginBottom:"8px"}} value={client} onChange={e=>setClient(e.target.value)} placeholder="Client or company name..."/>
        <label style={S.label}>Or paste inquiry email</label>
        <textarea style={{...S.textarea,minHeight:"70px"}} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Paste client inquiry email to generate a tailored checklist..." rows={3}/>
        <div style={{marginTop:"10px"}}><button style={S.btn("primary")} onClick={generate}>Generate Checklist</button></div>
      </div>
      {loading&&<Spinner/>}
      {items.length>0&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
            <span style={S.label}>{client||"Client"} Onboarding</span>
            <span style={{fontSize:"11px",color:pct===100?C.green:C.brownLight,fontWeight:"bold"}}>{pct}% complete</span>
          </div>
          <div style={{background:C.cream,borderRadius:"6px",height:"6px",marginBottom:"14px",overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${C.gold},${C.green})`,transition:"width 0.3s"}}/>
          </div>
          {items.map((item,i)=>(
            <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"8px",opacity:checked.includes(i)?0.5:1}}>
              <input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(c=>c.includes(i)?c.filter(x=>x!==i):[...c,i])} style={{marginTop:"2px",accentColor:C.brown}}/>
              <span style={{fontSize:"12px",textDecoration:checked.includes(i)?"line-through":"none",color:C.charcoal}}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// FAQ HUB
function FAQHub({faqs,setFaqs}){
  const [newQ,setNewQ]=useState("");
  const [newA,setNewA]=useState("");
  const [learnEmail,setLearnEmail]=useState("");
  const [learnReply,setLearnReply]=useState("");
  const [learning,setLearning]=useState(false);
  const [learned,setLearned]=useState(false);

  function addFAQ(){
    if(!newQ.trim()||!newA.trim())return;
    setFaqs(f=>[...f,{q:newQ.trim(),a:newA.trim()}]);
    setNewQ("");setNewA("");
  }

  async function learn(){
    if(!learnEmail.trim()||!learnReply.trim())return;
    setLearning(true);setLearned(false);
    try{
      const r=await callClaude([{role:"user",content:`Extract a reusable FAQ entry from this email exchange. Return ONLY JSON: {q,a}. Question should be generic and reusable. Answer should capture Sara's approach. No markdown.\n\nEmail:\n${learnEmail}\n\nSara's reply:\n${learnReply}`}]);
      const p=JSON.parse(r.replace(/```json|```/g,"").trim());
      setFaqs(f=>[...f,p]);
      setLearnEmail("");setLearnReply("");
      setLearned(true);setTimeout(()=>setLearned(false),2500);
    }finally{setLearning(false);}
  }

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Add FAQ Entry Manually</label>
        <input style={{...S.input,marginBottom:"8px"}} value={newQ} onChange={e=>setNewQ(e.target.value)} placeholder="Question..."/>
        <textarea style={{...S.textarea,minHeight:"60px"}} value={newA} onChange={e=>setNewA(e.target.value)} placeholder="Answer (in Sara's voice)..." rows={3}/>
        <div style={{marginTop:"8px"}}><button style={S.btn("gold")} onClick={addFAQ}>Add to FAQ Hub</button></div>
      </div>
      <div style={S.card}>
        <label style={S.label}>Learn from a Past Reply</label>
        <div style={{...S.small,marginBottom:"8px"}}>Paste an email you received and your reply - I'll extract a reusable FAQ entry from it.</div>
        <textarea style={{...S.textarea,minHeight:"60px"}} value={learnEmail} onChange={e=>setLearnEmail(e.target.value)} placeholder="Original email received..." rows={3}/>
        <textarea style={{...S.textarea,minHeight:"60px",marginTop:"8px"}} value={learnReply} onChange={e=>setLearnReply(e.target.value)} placeholder="Your reply..." rows={3}/>
        <div style={{marginTop:"8px"}}>
          <button style={S.btn("primary")} onClick={learn} disabled={learning}>{learning?"Learning...":learned?"Learned and saved!":"Learn from This Reply"}</button>
        </div>
      </div>
      <div style={{...S.label,marginBottom:"8px"}}>Saved FAQ Entries ({faqs.length})</div>
      {faqs.map((f,i)=>(
        <div key={i} style={{...S.card,padding:"10px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:"12px",fontWeight:"bold",color:C.brown,marginBottom:"3px"}}>{f.q}</div>
              <div style={S.small}>{f.a}</div>
            </div>
            <button onClick={()=>setFaqs(f=>f.filter((_,idx)=>idx!==i))} style={{...S.btn("ghost"),padding:"4px 8px",fontSize:"10px",color:C.red,marginLeft:"8px"}}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// MAIN APP
export default function PESOutlookAgent(){
  const [tab,setTab]=useState("briefing");
  const [faqs,setFaqs]=useState(DEFAULT_FAQS);
  const [quotes,setQuotes]=useState([]);
  const [followUps,setFollowUps]=useState([]);

  const tabs=[
    {id:"briefing",label:"Briefing"},
    {id:"reply",label:"Reply"},
    {id:"followup",label:"Follow-Ups"},
    {id:"quotes",label:"Quotes"},
    {id:"summary",label:"Summary"},
    {id:"tasks",label:"Tasks"},
    {id:"categorize",label:"Categorize"},
    {id:"staff",label:"Staff Msgs"},
    {id:"payments",label:"Payments"},
    {id:"checklist",label:"Checklist"},
    {id:"faq",label:"FAQ Hub"},
  ];

  const overdueCount=followUps.filter(f=>!f.done&&new Date(f.dueDate)<new Date()).length;
  const nudgeCount=quotes.filter(q=>q.status==="Pending"&&Math.floor((new Date()-new Date(q.sentDate))/(1000*60*60*24))>=3).length;
  const alertCount=overdueCount+nudgeCount;

  return(
    <div style={S.container}>
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>PES Email Agent</div>
          <div style={S.headerSub}>Premium Event Staffing - Sara Reeder</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          {alertCount>0&&(
            <div style={{background:C.red,color:C.white,borderRadius:"50%",width:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"bold"}}>{alertCount}</div>
          )}
          <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"bold",color:C.brown,fontFamily:"'Georgia',serif"}}>SR</div>
        </div>
      </div>
      <div style={S.tabs}>
        {tabs.map(t=><button key={t.id} style={S.tab(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>
      <div style={S.body}>
        {tab==="briefing"&&<DailyBriefing quotes={quotes} followUps={followUps}/>}
        {tab==="reply"&&<ReplyDrafter faqs={faqs}/>}
        {tab==="followup"&&<FollowUpTracker followUps={followUps} setFollowUps={setFollowUps}/>}
        {tab==="quotes"&&<QuoteTracker quotes={quotes} setQuotes={setQuotes}/>}
        {tab==="summary"&&<EmailSummary/>}
        {tab==="tasks"&&<TaskExtractor/>}
        {tab==="categorize"&&<AutoCategorize/>}
        {tab==="staff"&&<StaffTemplates/>}
        {tab==="payments"&&<PaymentAlerts/>}
        {tab==="checklist"&&<ClientChecklist/>}
        {tab==="faq"&&<FAQHub faqs={faqs} setFaqs={setFaqs}/>}
      </div>
    </div>
  );
}
