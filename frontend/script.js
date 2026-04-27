// const API = "http://127.0.0.1:8000";

// // ─── File Preview ───
// document.getElementById('fileInput').addEventListener('change', function(e) {
//   const file = e.target.files[0];
//   if (!file) return;

//   document.getElementById('fileNameDisplay').textContent = file.name;
//   document.querySelector('.upload-zone').classList.add('has-file');
//   document.querySelector('.upload-text').textContent = 'File Selected';

//   if (file.type.startsWith('image/')) {
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       document.getElementById('preview-img').src = ev.target.result;
//       document.getElementById('preview-img').style.display = 'block';
//       document.getElementById('preview-wrap').classList.remove('hidden');
//     };
//     reader.readAsDataURL(file);
//   } else {
//     // Video — no preview, just show name
//     document.getElementById('preview-wrap').classList.add('hidden');
//   }
// });

// // ─── Analyze ───
// async function analyzeImage() {
//   const file = document.getElementById('fileInput').files[0];
//   const description = document.getElementById('textInput').value.trim();
//   const errEl = document.getElementById('error-msg');

//   errEl.classList.add('hidden');
//   errEl.textContent = '';

//   if (!file && !description) {
//     errEl.textContent = 'Please upload a photo/video or describe the symptoms.';
//     errEl.classList.remove('hidden');
//     return;
//   }

//   const btn = document.getElementById('analyzeBtn');
//   btn.disabled = true;
//   document.getElementById('loading').classList.remove('hidden');

//   const formData = new FormData();
//   if (file) formData.append('file', file);
//   if (description) formData.append('description', description);

//   try {
//     const res = await fetch(`${API}/analyze`, { method: 'POST', body: formData });
//     if (!res.ok) throw new Error(`Server error: ${res.status}`);
//     const data = await res.json();
//     if (data.error) throw new Error(data.error);
//     showResult(data);
//   } catch (err) {
//     document.getElementById('loading').classList.add('hidden');
//     btn.disabled = false;
//     errEl.textContent = err.message.includes('Failed to fetch')
//       ? 'Cannot connect to backend. Make sure main.py is running on port 8000.'
//       : `Error: ${err.message}`;
//     errEl.classList.remove('hidden');
//   }
// }

// // ─── Render Result ───
// function showResult(d) {
//   document.getElementById('loading').classList.add('hidden');
//   document.getElementById('upload-page').classList.add('hidden');
//   document.getElementById('result-page').classList.remove('hidden');
//   window.scrollTo({ top: 0, behavior: 'smooth' });

//   const score = typeof d.score === 'number' ? d.score : 70;
//   const urgency = d.urgency || 'Monitor at home';
//   const observations = Array.isArray(d.observations) ? d.observations : [];
//   const conditions = Array.isArray(d.conditions) ? d.conditions : [];
//   const analysis = d.analysis || '';
//   const recommendation = d.recommendation || 'Consult a professional.';
//   const disclaimer = d.disclaimer || 'This is AI screening only. Always consult a licensed veterinarian.';
//   const animal = d.animal || 'pet';

//   // ─ Urgency styling
//   let urgencyClass = 'ok', urgencyIcon = '✔';
//   if (urgency.toLowerCase().includes('urgent')) { urgencyClass = 'danger'; urgencyIcon = '⚠'; }
//   else if (urgency.toLowerCase().includes('soon')) { urgencyClass = 'warn'; urgencyIcon = '⚡'; }

//   // ─ Score ring color
//   let scoreColor = '#00ff88';
//   if (score < 40) scoreColor = '#ff4d4d';
//   else if (score < 65) scoreColor = '#ffb347';

//   // ─ Score label
//   let scoreStatus = 'Healthy';
//   if (score < 40) scoreStatus = 'Needs Urgent Care';
//   else if (score < 65) scoreStatus = 'Needs Attention';

//   // ─ Observations HTML
//   const obsHTML = observations.length
//     ? `<div class="obs-section">
//         <div class="section-label">Observations</div>
//         <div class="obs-grid">
//           ${observations.map(o => `
//             <span class="obs-chip ${o.type || 'ok'}">
//               <span class="dot"></span>${o.label}
//             </span>`).join('')}
//         </div>
//       </div>`
//     : '';

//   // ─ Conditions HTML
//   const condHTML = conditions.length
//     ? `<div class="section-label" style="margin-bottom:12px;">Detected Conditions</div>
//        ${conditions.map(c => {
//           const lk = (c.likelihood || 'low').toLowerCase();
//           return `
//           <div class="condition-card">
//             <div class="condition-head">
//               <div class="condition-name">${escHtml(c.name || 'Unknown')}</div>
//               <span class="likelihood-badge ${lk}">${lk} likelihood</span>
//             </div>
//             <div class="condition-body">
//               ${c.what_is_it ? `<div class="condition-row">
//                 <div class="condition-row-label">What is it?</div>
//                 <div class="condition-row-val">${escHtml(c.what_is_it)}</div>
//               </div>` : ''}
//               ${c.why_happens ? `<div class="condition-row">
//                 <div class="condition-row-label">Why it happens</div>
//                 <div class="condition-row-val">${escHtml(c.why_happens)}</div>
//               </div>` : ''}
//               ${c.treatment ? `<div class="condition-row">
//                 <div class="condition-row-label">Treatment</div>
//                 <div class="condition-row-val">${escHtml(c.treatment)}</div>
//               </div>` : ''}
//               ${c.supplements && c.supplements !== 'None needed' ? `<div class="condition-row">
//                 <div class="condition-row-label">Supplements</div>
//                 <div class="condition-row-val">${escHtml(c.supplements)}</div>
//               </div>` : ''}
//               ${c.see_vet ? `<div class="vet-flag">⚡ Vet visit recommended</div>` : ''}
//             </div>
//           </div>`;
//         }).join('')}`
//     : `<div class="analysis-section" style="border-color: rgba(0,255,136,0.15);">
//         <span style="color:var(--green); font-weight:700;">✔ No issues detected.</span>
//         Your ${animal} appears healthy based on the provided information.
//        </div>`;

//   // ─ Score Ring SVG
//   const r = 44, cx = 56, cy = 56, circ = 2 * Math.PI * r;
//   const filled = (score / 100) * circ;

//   const html = `
//     <div class="result-header">
//       <div class="result-title">AI Diagnosis</div>
//     </div>

//     <!-- Health Score -->
//     <div class="score-section">
//       <div class="score-ring-wrap">
//         <svg width="112" height="112" viewBox="0 0 112 112">
//           <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
//           <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
//             stroke="${scoreColor}" stroke-width="8"
//             stroke-dasharray="${filled} ${circ}"
//             stroke-dashoffset="${circ / 4}"
//             stroke-linecap="round"
//             style="transition: stroke-dasharray 1s ease;"
//           />
//         </svg>
//         <div class="score-num">
//           <span class="score-big" style="color:${scoreColor}">${score}</span>
//           <span class="score-label">/ 100</span>
//         </div>
//       </div>
//       <div class="score-meta">
//         <h3>${scoreStatus}</h3>
//         <p>${analysis || `Your ${animal}'s health has been assessed.`}</p>
//         <div class="urgency-badge ${urgencyClass}">${urgencyIcon} ${urgency}</div>
//       </div>
//     </div>

//     <!-- Observations -->
//     ${obsHTML}

//     <!-- Conditions -->
//     <div style="margin-bottom:20px;">${condHTML}</div>

//     <!-- Recommendation -->
//     <div class="rec-box">
//       <div class="rec-title">Recommendation</div>
//       <p>${escHtml(recommendation)}</p>
//     </div>

//     <!-- Disclaimer -->
//     <div class="disclaimer">${escHtml(disclaimer)}</div>
//   `;

//   document.getElementById('result-content').innerHTML = html;
// }

// function escHtml(str) {
//   return String(str)
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;');
// }

// const API = "http://127.0.0.1:8000";

const API = "https://your-render-url.onrender.com";

// ─── File Preview ───
document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('fileNameDisplay').textContent = file.name;
  document.querySelector('.upload-zone').classList.add('has-file');
  document.querySelector('.upload-text').textContent = 'File Selected';

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('preview-img').src = ev.target.result;
      document.getElementById('preview-img').style.display = 'block';
      document.getElementById('preview-wrap').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else {
    // Video — no preview, just show name
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
    errEl.textContent = 'Please upload a photo/video or describe the symptoms.';
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
      ? 'Cannot connect to backend. Make sure main.py is running on port 8000.'
      : `Error: ${err.message}`;
    errEl.classList.remove('hidden');
  }
}

// ─── Render Result ───
function showResult(d) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('upload-page').classList.add('hidden');
  document.getElementById('result-page').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const score = typeof d.score === 'number' ? d.score : 70;
  const urgency = d.urgency || 'Monitor at home';
  const observations = Array.isArray(d.observations) ? d.observations : [];
  const conditions = Array.isArray(d.conditions) ? d.conditions : [];
  const analysis = d.analysis || '';
  const recommendation = d.recommendation || 'Consult a professional.';
  const disclaimer = d.disclaimer || 'This is AI screening only. Always consult a licensed veterinarian.';
  const animal = d.animal || 'pet';

  // ─ Urgency class (from urgency field — source of truth)
  const urgencyLower = urgency.toLowerCase();
  let urgencyClass = 'ok', urgencyIcon = '✔';
  if (urgencyLower.includes('urgent')) { urgencyClass = 'danger'; urgencyIcon = '⚠'; }
  else if (urgencyLower.includes('soon'))  { urgencyClass = 'warn';   urgencyIcon = '⚡'; }

  // ─ Worst condition likelihood
  const likelihoodRank = { high: 3, medium: 2, low: 1 };
  const worstLikelihood = conditions.reduce((worst, c) => {
    const rank = likelihoodRank[(c.likelihood || 'low').toLowerCase()] || 1;
    return Math.max(worst, rank);
  }, 0);

  // ─ Score color: driven by urgency + conditions, NOT raw score number
  let scoreColor, scoreStatus;
  if (urgencyLower.includes('urgent') || worstLikelihood === 3) {
    scoreColor  = '#ff4d4d';   // red
    scoreStatus = urgencyLower.includes('urgent') ? 'Needs Urgent Care' : 'Needs Attention';
  } else if (urgencyLower.includes('soon') || worstLikelihood === 2) {
    scoreColor  = '#ffb347';   // amber
    scoreStatus = 'Needs Attention';
  } else if (conditions.length === 0) {
    scoreColor  = '#00ff88';   // green
    scoreStatus = 'Healthy';
  } else {
    // low likelihood conditions only
    scoreColor  = '#00ff88';
    scoreStatus = 'Mostly Healthy';
  }

  // ─ Observations HTML
  const obsHTML = observations.length
    ? `<div class="obs-section">
        <div class="section-label">Observations</div>
        <div class="obs-grid">
          ${observations.map(o => `
            <span class="obs-chip ${o.type || 'ok'}">
              <span class="dot"></span>${o.label}
            </span>`).join('')}
        </div>
      </div>`
    : '';

  // ─ Conditions HTML
  const condHTML = conditions.length
    ? `<div class="section-label" style="margin-bottom:12px;">Detected Conditions</div>
       ${conditions.map(c => {
          const lk = (c.likelihood || 'low').toLowerCase();
          return `
          <div class="condition-card">
            <div class="condition-head">
              <div class="condition-name">${escHtml(c.name || 'Unknown')}</div>
              <span class="likelihood-badge ${lk}">${lk} likelihood</span>
            </div>
            <div class="condition-body">

              ${c.what_is_it ? `<div class="condition-row">
                <div class="condition-row-label">What is it?</div>
                <div class="condition-row-val">${escHtml(c.what_is_it)}</div>
              </div>` : ''}

              ${c.why_happens ? `<div class="condition-row">
                <div class="condition-row-label">Why it happens</div>
                <div class="condition-row-val">${escHtml(c.why_happens)}</div>
              </div>` : ''}

              ${c.warning ? `<div class="condition-row">
                <div class="condition-row-label" style="color:#ffb347;">⚠ Warning</div>
                <div class="condition-row-val" style="color:#ffb347;">${escHtml(c.warning)}</div>
              </div>` : ''}

              ${(c.medicines && c.medicines.length) ? `<div class="condition-row">
                <div class="condition-row-label">Medicines</div>
                <div class="condition-row-val">
                  ${c.medicines.map(m => `
                    <div style="margin-bottom:8px; padding:10px; background:rgba(255,255,255,0.04); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
                      <div style="font-weight:700; font-size:13px;">${escHtml(m.name)}</div>
                      <div style="font-size:12px; color:#888; margin-top:2px;">${escHtml(m.type || '')} · ${escHtml(m.dispensing || '')}</div>
                      ${m.dose ? `<div style="font-size:12px; color:#ccc; margin-top:4px;">Dose: ${escHtml(m.dose)}</div>` : ''}
                      ${m.note ? `<div style="font-size:12px; color:#ffb347; margin-top:4px;">⚠ ${escHtml(m.note)}</div>` : ''}
                    </div>`).join('')}
                </div>
              </div>` : ''}

              ${(c.topical_treatments && c.topical_treatments.length) ? `<div class="condition-row">
                <div class="condition-row-label">Topical / Shampoo</div>
                <div class="condition-row-val">
                  ${c.topical_treatments.map(t => `
                    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:10px; padding:10px; background:rgba(255,255,255,0.04); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
                      ${t.image_url ? `<img src="${escHtml(t.image_url)}" style="width:64px; height:64px; object-fit:contain; border-radius:8px; background:#1a1a1a; flex-shrink:0;" onerror="this.style.display='none'">` : ''}
                      <div style="flex:1; min-width:0;">
                        <div style="font-weight:700; font-size:13px;">${escHtml(t.name)}</div>
                        <div style="font-size:12px; color:#888; margin-top:2px;">${escHtml(t.type || '')}</div>
                        ${t.use ? `<div style="font-size:12px; color:#ccc; margin-top:4px;">${escHtml(t.use)}</div>` : ''}
                        ${t.buy_link ? `<a href="${escHtml(t.buy_link)}" target="_blank" style="display:inline-block; margin-top:6px; font-size:11px; color:#000; background:var(--green); padding:4px 10px; border-radius:8px; text-decoration:none; font-weight:700;">Buy Now ↗</a>` : ''}
                      </div>
                    </div>`).join('')}
                </div>
              </div>` : ''}

              ${(c.supplements_detail && c.supplements_detail.length) ? `<div class="condition-row">
                <div class="condition-row-label">Supplements</div>
                <div class="condition-row-val">
                  ${c.supplements_detail.map(s => `
                    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:10px; padding:10px; background:rgba(255,255,255,0.04); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">
                      ${s.image_url ? `<img src="${escHtml(s.image_url)}" style="width:64px; height:64px; object-fit:contain; border-radius:8px; background:#1a1a1a; flex-shrink:0;" onerror="this.style.display='none'">` : ''}
                      <div style="flex:1; min-width:0;">
                        <div style="font-weight:700; font-size:13px;">${escHtml(s.name)}</div>
                        ${s.benefit ? `<div style="font-size:12px; color:#ccc; margin-top:3px;">${escHtml(s.benefit)}</div>` : ''}
                        ${s.dose ? `<div style="font-size:12px; color:#888; margin-top:3px;">Dose: ${escHtml(s.dose)}</div>` : ''}
                        ${s.buy_link ? `<a href="${escHtml(s.buy_link)}" target="_blank" style="display:inline-block; margin-top:6px; font-size:11px; color:#000; background:var(--green); padding:4px 10px; border-radius:8px; text-decoration:none; font-weight:700;">Buy Now ↗</a>` : ''}
                      </div>
                    </div>`).join('')}
                </div>
              </div>` : (c.supplements && c.supplements !== 'None needed' ? `<div class="condition-row">
                <div class="condition-row-label">Supplements</div>
                <div class="condition-row-val">${escHtml(c.supplements)}</div>
              </div>` : '')}

              ${(c.safety_warnings && c.safety_warnings.length) ? `<div class="condition-row" style="border-bottom:none;">
                <div class="condition-row-label" style="color:#ff4d4d;">Safety</div>
                <div class="condition-row-val">
                  ${c.safety_warnings.map(w => `
                    <div style="font-size:12px; color:#ff4d4d; margin-bottom:4px; padding-left:8px; border-left:2px solid #ff4d4d;">
                      ${escHtml(w)}
                    </div>`).join('')}
                </div>
              </div>` : ''}

              ${c.see_vet ? `<div class="vet-flag">⚡ Vet visit recommended</div>` : ''}
            </div>
          </div>`;
        }).join('')}`
    : `<div class="analysis-section" style="border-color: rgba(0,255,136,0.15);">
        <span style="color:var(--green); font-weight:700;">✔ No issues detected.</span>
        Your ${animal} appears healthy based on the provided information.
       </div>`;

  // ─ Score Ring SVG
  const r = 44, cx = 56, cy = 56, circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  const html = `
    <div class="result-header">
      <div class="result-title">AI Diagnosis</div>
    </div>

    <!-- Health Score -->
    <div class="score-section">
      <div class="score-ring-wrap">
        <svg width="112" height="112" viewBox="0 0 112 112">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="${scoreColor}" stroke-width="8"
            stroke-dasharray="${filled} ${circ}"
            stroke-dashoffset="${circ / 4}"
            stroke-linecap="round"
            style="transition: stroke-dasharray 1s ease;"
          />
        </svg>
        <div class="score-num">
          <span class="score-big" style="color:${scoreColor}">${score}</span>
          <span class="score-label">/ 100</span>
        </div>
      </div>
      <div class="score-meta">
        <h3>${scoreStatus}</h3>
        <p>${analysis || `Your ${animal}'s health has been assessed.`}</p>
        <div class="urgency-badge ${urgencyClass}">${urgencyIcon} ${urgency}</div>
      </div>
    </div>

    <!-- Observations -->
    ${obsHTML}

    <!-- Conditions -->
    <div style="margin-bottom:20px;">${condHTML}</div>

    <!-- Recommendation -->
    <div class="rec-box">
      <div class="rec-title">Recommendation</div>
      <p>${escHtml(recommendation)}</p>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer">${escHtml(disclaimer)}</div>
  `;

  document.getElementById('result-content').innerHTML = html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}