/* 상담 신청 폼: 이메일(FormSubmit)로 고객 DB 수집
   사용법: <div id="lead-slot"></div> 를 넣고 이 스크립트를 불러오면 폼이 그려집니다. */
(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/3878e8dba7de3ed14f707d506bb03f43';
  var SITE = '마곡 지식산업센터 분양센터(powermap)';
  var CENTERS = {
    ipark: '마곡 아이파크 디어반',
    botanicgate: '마곡 보타닉 게이트',
    newcloudhill: '뉴브 클라우드힐스',
    d18b: '마곡 가든스퀘어'
  };
  var slot = document.getElementById('lead-slot');
  if (!slot) return;
  var privacyHref = slot.getAttribute('data-privacy') || 'privacy.html';

  var css = [
    '.lead-sec{scroll-margin-top:90px;max-width:1100px;margin:48px auto 24px;padding:0 20px;font-family:inherit}',
    '.lead-box{display:grid;grid-template-columns:1fr 1.25fr;gap:28px;background:var(--bg-secondary,var(--card,#fff));border:1px solid var(--border-glass,var(--line,#e2e8f0));border-radius:20px;padding:32px;box-shadow:0 10px 30px -12px rgba(0,0,0,.12)}',
    '.lead-intro h2{margin:0 0 10px;font-size:1.6rem;line-height:1.35;color:var(--text-primary,var(--tx,#0f172a));letter-spacing:-.02em}',
    '.lead-intro p{margin:0 0 14px;color:var(--text-secondary,var(--tx2,#475569));line-height:1.7;font-size:.95rem}',
    '.lead-intro .lead-tel{display:inline-block;margin-top:6px;font-weight:800;font-size:1.25rem;color:var(--accent,var(--acc,#f97316));text-decoration:none}',
    '.lead-form{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}',
    '.lead-form label{display:flex;flex-direction:column;gap:6px;font-size:.85rem;font-weight:700;color:var(--text-primary,var(--tx,#0f172a))}',
    '.lead-form label.full,.lead-form .full{grid-column:1/-1}',
    '.lead-form b{display:inline;margin:0;font-size:inherit;color:var(--accent,var(--acc,#f97316))}',
    '.lead-form input,.lead-form select,.lead-form textarea{font:inherit;font-weight:400;font-size:.95rem;padding:11px 12px;border-radius:10px;border:1px solid var(--border-glass,var(--line,#cbd5e1));background:var(--bg-primary,var(--bg,#f8fafc));color:var(--text-primary,var(--tx,#0f172a))}',
    '.lead-form textarea{resize:vertical;min-height:84px}',
    '.lead-form details{font-size:.8rem;color:var(--text-secondary,var(--tx2,#475569));line-height:1.7}',
    '.lead-form details summary{cursor:pointer;font-weight:700}',
    '.lead-form .agree{flex-direction:row;align-items:center;gap:8px;font-weight:600}',
    '.lead-form .agree input{width:18px;height:18px;padding:0}',
    '.lead-form .trap{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}',
    '.lead-form button{font:inherit;font-weight:800;font-size:1rem;padding:15px;border:0;border-radius:12px;background:var(--accent,var(--acc,#f97316));color:#fff;cursor:pointer}',
    '.lead-form button:disabled{opacity:.6;cursor:wait}',
    '.lead-status{margin:0;font-size:.9rem;font-weight:600;color:var(--text-primary,var(--tx,#0f172a))}',
    '.floating-lead-btn .phone-icon{animation:none}',
    '@media(max-width:820px){.lead-box{grid-template-columns:1fr;padding:22px}.lead-form{grid-template-columns:1fr}}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var opts = '<option value="">선택해 주세요</option>';
  Object.keys(CENTERS).forEach(function (k) { opts += '<option value="' + CENTERS[k] + '">' + CENTERS[k] + '</option>'; });
  opts += '<option value="여러 센터 비교 상담">여러 센터 비교 상담</option>';

  slot.outerHTML =
    '<section class="lead-sec" id="consult" aria-labelledby="lead-title"><div class="lead-box">' +
    '<div class="lead-intro"><h2 id="lead-title">맞춤 호실 상담 신청</h2>' +
    '<p>관심 센터와 희망 면적을 남겨 주시면 조건에 맞는 호실과 분양·임대 조건을 담당자가 연락드려 안내합니다.</p>' +
    '<p>바로 통화를 원하시면</p><a class="lead-tel" href="tel:1666-5984">📞 1666-5984</a></div>' +
    '<form class="lead-form" id="lead-form" novalidate>' +
    '<label><span>성함 / 기업명 <b>*</b></span><input name="성함" autocomplete="name" maxlength="50" required placeholder="홍길동 또는 (주)회사명"></label>' +
    '<label><span>연락처 <b>*</b></span><input name="연락처" type="tel" autocomplete="tel" maxlength="30" required placeholder="010-0000-0000"></label>' +
    '<label>관심 센터<select name="관심센터" id="lead-center">' + opts + '</select></label>' +
    '<label>관심 유형<select name="관심유형"><option value="">선택해 주세요</option><option>사무실 분양</option><option>사무실 임대</option><option>사옥(대형 평형)</option><option>상가(근린생활시설)</option><option>기타</option></select></label>' +
    '<label class="full">희망 면적<select name="희망면적"><option value="">선택해 주세요</option><option>30평 미만</option><option>30~50평</option><option>50~100평</option><option>100~200평</option><option>200평 이상</option><option>상담 후 결정</option></select></label>' +
    '<label class="full">문의 내용<textarea name="문의내용" maxlength="2000" placeholder="희망 입주 시기, 업종, 궁금한 점을 적어 주세요."></textarea></label>' +
    '<details class="full"><summary>개인정보 수집 및 이용 안내</summary>' +
    '수집 항목: 성함(기업명), 연락처, 관심 센터·유형·면적, 문의 내용 (접수 시각·접수 페이지 자동 기록)<br>' +
    '이용 목적: 마곡 지식산업센터 분양·임대 상담 및 방문 일정 안내<br>' +
    '보유 기간: 상담 완료 후 90일 이내 파기 (삭제 요청 시 즉시 파기)<br>' +
    '처리 위탁: FormSubmit(formsubmit.co)을 통해 운영 담당자 이메일로 전달<br>' +
    '개인정보 보호책임자: 심완준<br>' +
    '동의를 거부할 수 있으며, 이 경우 온라인 상담 신청이 제한됩니다. 전화 상담(1666-5984)은 가능합니다.<br>' +
    '<a href="' + privacyHref + '" target="_blank" rel="noopener">개인정보처리방침 전문 보기</a></details>' +
    '<label class="agree full"><input type="checkbox" name="_agree" required> 개인정보 수집 및 이용에 동의합니다. (필수)</label>' +
    '<input type="text" name="_honey" class="trap" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<button type="submit" class="full">상담 신청하기</button>' +
    '<p class="lead-status full" id="lead-status" role="status" aria-live="polite"></p>' +
    '</form></div></section>';

  var form = document.getElementById('lead-form');
  var status = document.getElementById('lead-status');
  var select = document.getElementById('lead-center');

  function preselect() {
    var id = new URLSearchParams(location.search).get('id');
    if (id && CENTERS[id] && !select.value) select.value = CENTERS[id];
  }
  preselect();
  window.addEventListener('popstate', preselect);

  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    if (data.get('_honey')) return;
    var payload = {};
    data.forEach(function (v, k) { if (k !== '_honey' && k !== '_agree') payload[k] = v; });
    var center = payload['관심센터'] || '미선택';
    payload._subject = '[마곡 분양센터] 상담 신청 - ' + center;
    payload._template = 'table';
    payload._captcha = 'false';
    payload['사이트'] = SITE;
    payload['접수페이지'] = location.pathname.split('/').filter(Boolean).pop() + location.search;
    payload['접수시각'] = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    payload['개인정보동의'] = '동의';
    sending = true;
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    status.textContent = '신청 내용을 전송하고 있습니다.';
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || !(res.j.success === true || res.j.success === 'true')) throw new Error();
        status.textContent = '상담 신청이 접수되었습니다. 담당자가 곧 연락드리겠습니다.';
        form.reset();
        preselect();
      })
      .catch(function () {
        status.textContent = '전송을 확인하지 못했습니다. 1666-5984로 전화 주시면 바로 안내해 드립니다.';
      })
      .then(function () { sending = false; btn.disabled = false; });
  });
})();
