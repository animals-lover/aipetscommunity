const API = "https://aipetscommunity-2.onrender.com";

//const API = "http://127.0.0.1:8000";

// ─── File Preview ───
document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('fileNameDisplay').textContent = file.name;
  document.querySelector('.upload-zone').classList.add('has-file');
  document.querySelector('.upload-text').textContent = 'File Loaded';
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('preview-img').src = ev.target.result;
      document.getElementById('preview-wrap').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('preview-wrap').classList.add('hidden');
  }
});

// ─── Analyze ───
async function analyzeImage() {
  const file = document.getElementById('fileInput').files[0];
  const description = document.getElementById('textInput').value.trim();
  const errEl = document.getElementById('error-msg');
  errEl.classList.add('hidden');
  errEl.textContent = '';
  if (!file && !description) {
    errEl.textContent = 'Please provide an image asset or explicit structural symptoms description.';
    errEl.classList.remove('hidden');
    return;
  }
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  document.getElementById('loading').classList.remove('hidden');
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (description) formData.append('description', description);
  try {
    const res = await fetch(`${API}/analyze`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showResult(data);
  } catch (err) {
    document.getElementById('loading').classList.add('hidden');
    btn.disabled = false;
    errEl.textContent = err.message.includes('Failed to fetch')
      ? 'Unable to connect to server.'
      : `Error: ${err.message}`;
    errEl.classList.remove('hidden');
  }
}

let _lastResult = null;

function showResult(d) {
  _lastResult = d;

  // Switch pages
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('upload-page').classList.add('hidden');
  document.getElementById('result-page').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    renderResult(d);
  } catch(e) {
    // Show raw data if render crashes
    document.getElementById('result-content').innerHTML = `
      <div style="color:#ef4444; padding:20px; border:1px solid #ef4444; border-radius:12px; margin-bottom:16px;">
        <strong>Render Error:</strong> ${e.message}<br><br>
        <details><summary style="cursor:pointer; color:#f87171;">Raw AI Response (click to expand)</summary>
        <pre style="font-size:11px; color:#9aa1b1; margin-top:10px; overflow:auto;">${escHtml(JSON.stringify(d, null, 2))}</pre>
        </details>
      </div>`;
  }
}

function renderResult(d) {
  const score      = typeof d.score === 'number' ? d.score : 70;
  const urgency    = d.urgency || 'Monitor condition at home';
  const observations = Array.isArray(d.observations) ? d.observations : [];
  const conditions   = Array.isArray(d.conditions)   ? d.conditions   : [];
  const analysis     = d.analysis      || '';
  const recommendation = d.recommendation || 'No critical issues noted.';
  const disclaimer   = d.disclaimer    || 'AI screening only. Consult a licensed veterinarian.';
  const animal       = d.animal        || 'pet';

  const urgencyLower = urgency.toLowerCase();
  let urgencyClass = 'ok', urgencyIcon = '✔';
  if (urgencyLower.includes('urgent')) { urgencyClass = 'danger'; urgencyIcon = '⚠'; }
  else if (urgencyLower.includes('soon')) { urgencyClass = 'warn'; urgencyIcon = '⚡'; }

  const likelihoodRank = { high: 3, medium: 2, low: 1 };
  const worstLikelihood = conditions.reduce((worst, c) => {
    const rank = likelihoodRank[(c.likelihood || 'low').toLowerCase()] || 1;
    return Math.max(worst, rank);
  }, 0);

  let scoreColor, scoreStatus;
  if (urgencyLower.includes('urgent') || worstLikelihood === 3) {
    scoreColor = '#ef4444'; scoreStatus = 'Needs Urgent Attention';
  } else if (urgencyLower.includes('soon') || worstLikelihood === 2) {
    scoreColor = '#f59e0b'; scoreStatus = 'Requires Evaluation';
  } else {
    scoreColor = '#00ff00'; scoreStatus = 'Optimal Health';
  }

  // ── Observations ──
  const obsHTML = observations.length ? `
    <div class="obs-section">
      <div class="section-label">Identified Anomalies</div>
      <div class="obs-grid">
        ${observations.map(o => `<span class="obs-chip ${o.type||'ok'}"><span class="dot"></span>${escHtml(o.label||'')}</span>`).join('')}
      </div>
    </div>` : '';

  // ── Conditions ──
  let condHTML = '';
  if (conditions.length) {
    condHTML = `<div class="section-label" style="margin-bottom:12px;">Detected Clinical Pathology</div>`;
    for (const c of conditions) {
      const lk = (c.likelihood || 'low').toLowerCase();
      const meds       = Array.isArray(c.medicines)          ? c.medicines          : [];
      const supps      = Array.isArray(c.supplements_detail) ? c.supplements_detail
                       : Array.isArray(c.supplements)        ? c.supplements        : [];
      const topicals   = Array.isArray(c.topical_treatments) ? c.topical_treatments : [];
      const warnings   = Array.isArray(c.safety_warnings)    ? c.safety_warnings    : [];

      let medsHTML = '';
      if (meds.length) {
        medsHTML = `<div class="condition-row">
          <div class="condition-row-label">Recommended Medicines</div>
          <div class="condition-row-val">
            ${meds.map(m => `
              <div class="med-item">
                <div class="med-item-left">
                  <div class="med-name">${escHtml(m.name||'')}</div>
                  <div class="med-meta">${escHtml(m.type||'Therapeutic')} · <span class="dispensing-badge ${(m.dispensing||'').toLowerCase().includes('otc')?'otc':'rx'}">${escHtml(m.dispensing||'As directed')}</span></div>
                  ${m.dose ? `<div class="med-dose">📋 ${escHtml(m.dose)}</div>` : ''}
                  ${m.note ? `<div class="med-note">💡 ${escHtml(m.note)}</div>` : ''}
                </div>
              </div>`).join('')}
          </div></div>`;
      }

      let suppsHTML = '';
      if (supps.length) {
        suppsHTML = `<div class="condition-row">
          <div class="condition-row-label">Supplements</div>
          <div class="condition-row-val">
            ${supps.map(s => `
              <div class="supp-item">
                ${s.image_url ? `<img src="${escHtml(s.image_url)}" class="supp-img" onerror="this.style.display='none'">` : '<div class="supp-img-placeholder">💊</div>'}
                <div class="supp-info">
                  <div class="supp-name">${escHtml(s.name||'')}</div>
                  ${s.benefit ? `<div class="supp-benefit">${escHtml(s.benefit)}</div>` : ''}
                  ${s.dose   ? `<div class="supp-dose">📋 ${escHtml(s.dose)}</div>` : ''}
                </div>
                ${s.buy_link ? `<a href="${escHtml(s.buy_link)}" target="_blank" class="buy-btn">Buy ↗</a>` : ''}
              </div>`).join('')}
          </div></div>`;
      }

      let topicalsHTML = '';
      if (topicals.length) {
        topicalsHTML = `<div class="condition-row">
          <div class="condition-row-label">Topical Treatments</div>
          <div class="condition-row-val">
            ${topicals.map(t => `
              <div class="supp-item">
                ${t.image_url ? `<img src="${escHtml(t.image_url)}" class="supp-img" onerror="this.style.display='none'">` : '<div class="supp-img-placeholder">🧴</div>'}
                <div class="supp-info">
                  <div class="supp-name">${escHtml(t.name||'')}</div>
                  ${t.use ? `<div class="supp-benefit">${escHtml(t.use)}</div>` : ''}
                </div>
                ${t.buy_link ? `<a href="${escHtml(t.buy_link)}" target="_blank" class="buy-btn">Buy ↗</a>` : ''}
              </div>`).join('')}
          </div></div>`;
      }

      let warnHTML = '';
      if (warnings.length) {
        warnHTML = `<div class="condition-row">
          <div class="condition-row-label" style="color:#f59e0b;">⚠ Safety Warnings</div>
          <div class="condition-row-val">
            ${warnings.map(w => `<div class="safety-warn-item">⚠ ${escHtml(w)}</div>`).join('')}
          </div></div>`;
      }

      condHTML += `
        <div class="condition-card">
          <div class="condition-head">
            <div class="condition-name">${escHtml(c.name||'Unknown Condition')}</div>
            <span class="likelihood-badge ${lk}">${lk} probability</span>
          </div>
          <div class="condition-body">
            ${c.what_is_it ? `<div class="condition-row"><div class="condition-row-label">Clinical Definition</div><div class="condition-row-val">${escHtml(c.what_is_it)}</div></div>` : ''}
            ${c.why_happens ? `<div class="condition-row"><div class="condition-row-label">Etiology & Triggers</div><div class="condition-row-val">${escHtml(c.why_happens)}</div></div>` : ''}
            ${c.warning ? `<div class="condition-row"><div class="condition-row-label" style="color:#ef4444;">⚠ Critical Warning</div><div class="condition-row-val" style="color:#f87171;">${escHtml(c.warning)}</div></div>` : ''}
            ${medsHTML}
            ${suppsHTML}
            ${topicalsHTML}
            ${warnHTML}
            ${c.see_vet ? `<div class="vet-flag">⚠ Veterinary Practitioner Action Required</div>` : ''}
          </div>
        </div>`;
    }
  } else {
    condHTML = `<div class="condition-card" style="padding:20px; font-size:14px; color:#a1a1aa;">✔ No significant issues detected. Your ${escHtml(animal)} appears healthy.</div>`;
  }

  // ── Score ring ──
  const r = 38, cx = 45, cy = 45, circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const reportTime = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  document.getElementById('result-content').innerHTML = `
    <div class="report-meta-bar">
      <div class="report-meta-left">
        <span class="report-id-label">REPORT ID</span>
        <span class="report-id-val">#PW-${Date.now().toString(36).toUpperCase()}</span>
      </div>
      <div class="report-meta-right">
        <span class="report-time">🕐 ${reportTime}</span>
      </div>
    </div>
    <div class="score-section">
      <div class="score-ring-wrap">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="6"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${scoreColor}" stroke-width="6"
            stroke-dasharray="${filled} ${circ}" stroke-dashoffset="${circ/4}" stroke-linecap="round"/>
        </svg>
        <div class="score-num">
          <span class="score-big" style="color:${scoreColor}">${score}</span>
          <span class="score-label">INDEX</span>
        </div>
      </div>
      <div class="score-meta">
        <h3>${scoreStatus}</h3>
        <p>${escHtml(analysis || 'Morphology scan complete.')}</p>
        <div class="urgency-badge ${urgencyClass}">${urgencyIcon} ${escHtml(urgency)}</div>
      </div>
    </div>
    ${obsHTML}
    ${condHTML}
    <div class="rec-box">
      <div class="rec-title">Clinical Recommendation</div>
      <p>${escHtml(recommendation)}</p>
    </div>
    <button onclick="downloadPDF()" class="pdf-download-btn">
      <span class="pdf-btn-icon">⬇</span>
      <span>Download Health Report (PDF)</span>
    </button>
    <div class="disclaimer">${escHtml(disclaimer)}</div>
  `;
}

// ─── PDF Download ───
function downloadPDF() {
  if (!_lastResult) return;
  if (typeof window.jspdf === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => generatePDF(_lastResult);
    document.head.appendChild(script);
  } else {
    generatePDF(_lastResult);
  }
}
function cleanPDFText(str) {
  return String(str || '')
    .replace(/[^\x20-\x7E\n\r]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generatePDF(d) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 18, contentW = W - margin * 2;
  let y = 0;

  const C = {
    bg:[5,5,8], card:[12,12,18], green:[0,255,136], white:[255,255,255],
    gray:[120,130,150], lightGray:[80,85,100], red:[239,68,68],
    amber:[245,158,11], border:[35,35,50],
  };

  const fill   = c => doc.setFillColor(...c);
  const stroke = c => doc.setDrawColor(...c);
  const text   = c => doc.setTextColor(...c);
  const font   = (s, st='normal') => { doc.setFontSize(s); doc.setFont('helvetica', st); };
  const rect   = (x, w, yy, h, c) => { fill(c); doc.rect(x, yy, w, h, 'F'); };

  function checkPage(need=20) {
    if (y + need > 278) { doc.addPage(); rect(0, W, 0, 297, C.bg); y = 16; }
  }
  function wText(str, x, yy, maxW, lh = 5) {
    str = cleanPDFText(str);

    const lines = doc.splitTextToSize(str, maxW);

    lines.forEach(line => {
      if (yy > 270) {
        doc.addPage();
        rect(0, W, 0, 297, C.bg);
        yy = 16;
      }

      doc.text(line, x, yy);
      yy += lh;
    });

    return yy;
  }

  // Background
  rect(0, W, 0, 297, C.bg);

  // Header
  fill(C.green); doc.rect(0,0,W,1.2,'F');
  rect(0, W, 0, 38, [8,12,10]);
  text(C.green); font(18,'bold'); doc.text('Animalslover', margin, 16);
  text(C.gray); font(8); doc.text('SMART PET HEALTH ANALYSIS SYSTEM', margin, 22);
  const rTime = new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
  //doc.text(`Generated: ${rTime}`, W-margin, 20, {align:'right'});
  doc.text(
    cleanPDFText(`Generated: ${rTime}`),
    W - margin,
    20,
    { align: 'right' }
  );
  stroke(C.border); doc.setLineWidth(0.4); doc.line(0,38,W,38);
  y = 48;

  // Score
  const score = typeof d.score==='number' ? d.score : 70;
  const urgency = d.urgency||'Monitor at home';
  const uLow = urgency.toLowerCase();
  let sColor = C.green;
  if (uLow.includes('urgent')) sColor = C.red;
  else if (uLow.includes('soon')) sColor = C.amber;

  rect(margin, contentW, y, 28, C.card);
  stroke(C.border); doc.setLineWidth(0.3); doc.rect(margin,y,contentW,28,'S');
  fill(sColor); doc.circle(margin+14, y+14, 10, 'F');
  text([5,5,8]); font(11,'bold'); doc.text(String(score), margin+14, y+15.5, {align:'center'});
  text(C.white); font(12,'bold');
  const conds = Array.isArray(d.conditions) ? d.conditions : [];
  const wlk = conds.reduce((w,c)=>Math.max(w,{high:3,medium:2,low:1}[(c.likelihood||'low').toLowerCase()]||1),0);
  const stat = uLow.includes('urgent')||wlk===3 ? 'Needs Urgent Attention'
    : uLow.includes('soon')||wlk===2 ? 'Requires Evaluation' : 'Optimal Health';
  doc.text(stat, margin+30, y+11);
  text(C.gray); font(8.5);
  const aLines = doc.splitTextToSize(
    cleanPDFText(d.analysis || 'AI scan complete.'),
    contentW - 32
  );
  //const aLines = doc.splitTextToSize(d.analysis||'AI scan complete.', contentW-32);
  if(aLines[0]) doc.text(aLines[0], margin+30, y+17);
  text(sColor); font(8,'bold'); doc.text(cleanPDFText(`Status: ${urgency}`),margin + 30,y + 24);;
  y += 34;

  // Conditions
  if (conds.length) {
    stroke(C.border); doc.setLineWidth(0.3); doc.line(margin,y,W-margin,y); y+=5;
    text(C.green); font(8,'bold'); doc.text('DETECTED CONDITIONS & TREATMENT PLAN', margin, y); y+=6;

    for (const c of conds) {
      checkPage(30);
      const lk = (c.likelihood||'low').toLowerCase();
      const lkC = lk==='high'?C.red:lk==='medium'?C.amber:C.green;
      rect(margin, contentW, y, 10, [18,20,26]);
      stroke(lkC); doc.setLineWidth(0.4); doc.rect(margin,y,contentW,10,'S');
      fill(lkC); doc.rect(margin,y,2.5,10,'F');
      text(C.white); font(10,'bold');doc.text(cleanPDFText(c.name || ''),margin + 6,y + 7);
      text(lkC); font(7.5,'bold'); doc.text(`${lk.toUpperCase()} PROBABILITY`, W-margin-2, y+7, {align:'right'});
      y += 13;

      if(c.what_is_it){checkPage(14);text(C.green);font(7.5,'bold');doc.text('CLINICAL DEFINITION',margin+3,y);y+=4;text(C.gray);font(8);y=wText(c.what_is_it,margin+3,y,contentW-6,4.5);y+=3;}
      if(c.warning){checkPage(12);text(C.red);font(7.5,'bold');doc.text('CRITICAL WARNING',margin+3,y);y+=4;text([248,113,113]);font(8);y=wText(c.warning,margin+3,y,contentW-6,4.5);y+=3;}

      const meds = Array.isArray(c.medicines) ? c.medicines : [];
      if(meds.length){
        checkPage(12);text(C.green);font(7.5,'bold');doc.text('MEDICINES',margin+3,y);y+=5;
        for(const m of meds){
          checkPage(16);
          rect(margin+3,contentW-6,y,14,C.card);
          stroke(C.border);doc.setLineWidth(0.2);doc.rect(margin+3,y,contentW-6,14,'S');
          text(C.white);font(8.5,'bold');doc.text(cleanPDFText(m.name || ''),margin + 7,y + 5.5);
          const isOtc=(m.dispensing||'').toLowerCase().includes('otc');
          text(isOtc?C.green:C.amber);font(7,'bold');doc.text(String(m.dispensing||''),W-margin-5,y+5.5,{align:'right'});
          text(C.gray);font(7.5);
          const doseStr = m.dose ? `${m.type||''} | Dose: ${m.dose}` : (m.type||'');
          const dl=doc.splitTextToSize(doseStr,contentW-18);
          if(dl[0]) doc.text(dl[0],margin+7,y+10);
          y+=17;
        }
        y+=2;
      }

      const supps = Array.isArray(c.supplements_detail)?c.supplements_detail:Array.isArray(c.supplements)?c.supplements:[];
      if(supps.length){
        checkPage(12);text(C.green);font(7.5,'bold');doc.text('SUPPLEMENTS',margin+3,y);y+=5;
        for(const s of supps){
          checkPage(14);
          rect(margin+3,contentW-6,y,13,C.card);stroke(C.border);doc.setLineWidth(0.2);doc.rect(margin+3,y,contentW-6,13,'S');
          text(C.white);font(8.5,'bold');doc.text(cleanPDFText(s.name || ''),margin + 7,y + 5.5);
          if(s.benefit){text(C.gray);font(7.5);const bl=doc.splitTextToSize(s.benefit,contentW-18);if(bl[0])doc.text(bl[0],margin+7,y+10);}
          if(s.buy_link){text(C.green);font(7,'bold');doc.text('Amazon.in',W - margin - 5,y + 10,{ align: 'right' });}
          y+=16;
        }
        y+=2;
      }

      const warns = Array.isArray(c.safety_warnings)?c.safety_warnings:[];
      if(warns.length){
        checkPage(12);text(C.amber);font(7.5,'bold');doc.text('SAFETY WARNINGS',margin+3,y);y+=4;
        for(const w of warns){checkPage(8);text(C.amber);font(8);y = wText(`- ${cleanPDFText(w)}`,margin + 5,y,contentW - 8,4.5);}
        y+=3;
      }
      y+=4;
    }
  }

  // Recommendation
  checkPage(22);
  stroke(C.border);doc.setLineWidth(0.3);doc.line(margin,y,W-margin,y);y+=5;
  fill(C.green);doc.rect(margin,y,contentW,3,'F');y+=6;
  text(C.white);font(10,'bold');doc.text('CLINICAL RECOMMENDATION',margin,y);y+=6;
  text(C.gray);font(8.5);y = wText(cleanPDFText(d.recommendation || 'No critical issues noted.'),margin,y,contentW,5);
  // Disclaimer
  checkPage(20);
  rect(margin,contentW,y,18,[12,12,18]);stroke(C.border);doc.setLineWidth(0.3);doc.rect(margin,y,contentW,18,'S');
  text(C.lightGray);font(7.5,'italic');
  const disc=doc.splitTextToSize(d.disclaimer||'AI screening only. Always consult a licensed veterinarian.',contentW-8);
  disc.forEach((l,i)=>doc.text(l,margin+4,y+5+i*4.5));

  // Footer
  const total = doc.internal.getNumberOfPages();
  for(let p=1;p<=total;p++){
    doc.setPage(p);
    stroke([35,35,50]);doc.setLineWidth(0.3);doc.line(0,289,W,289);
    text(C.lightGray);font(7);
    doc.text('Animalslover | AI Pet Health System',margin,294);
    doc.text(`Page ${p} of ${total}`,W-margin,294,{align:'right'});
  }

  doc.save(`PawCare_Report_${Date.now()}.pdf`);
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
