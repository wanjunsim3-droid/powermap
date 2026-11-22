/* 홈페이지 상담신청 → 구글 시트 + 이메일 전송 (마곡산단 홈페이지 상담신청 DB) */
(function () {
  // 구글 Apps Script 웹 앱 배포 주소 (배포 후 이 한 줄만 바꾸면 됩니다)
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxHZzGjRHurmWIsE_QFU3aq9z6Od2M6SZD8y7ePnlox1iF6n__tbe4tZA0TEKQicT_q/exec';

  var PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

  // 이메일 접수(FormSubmit) — 구글 시트와 함께 담당자 메일(edusim71)로도 전달
  var EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/3878e8dba7de3ed14f707d506bb03f43';
  var LABELS = {
    source: '유입경로', center: '관심센터', name: '성함/기업명', phone: '연락처',
    interest: '관심유형', area: '희망면적', message: '문의내용', agree: '개인정보동의'
  };
  var VALUE_MAP = {
    interest: { rent: '사무실 임대', buy: '사무실 분양', store: '1층 상가 임대/분양', all: '복합 상담' },
    area: { '20-50': '20평 ~ 50평', '50-100': '50평 ~ 100평', '100-200': '100평 ~ 200평', '200+': '200평 이상 (대형 사옥형)' },
    agree: { Y: '동의', N: '미동의' }
  };

  function sendSheet(data) {
    if (!ENDPOINT) return Promise.reject(new Error('not-configured'));
    var body = new URLSearchParams();
    Object.keys(data).forEach(function (k) { body.append(k, data[k] == null ? '' : String(data[k])); });
    return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: body });
  }

  function sendEmail(data) {
    var payload = {};
    Object.keys(data).forEach(function (k) {
      if (k === 'website') return;
      var v = data[k] == null ? '' : String(data[k]);
      if (VALUE_MAP[k] && VALUE_MAP[k][v]) v = VALUE_MAP[k][v];
      payload[LABELS[k] || k] = v;
    });
    payload['접수페이지'] = location.pathname + location.search;
    payload['접수시각'] = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    payload._subject = '[마곡 분양센터] 상담 신청 - ' + (data.center || '센터 미선택') + ' / ' + (data.name || '');
    payload._template = 'table';
    payload._captcha = 'false';
    return fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || !(j.success === true || j.success === 'true')) throw new Error('email-failed');
        return j;
      });
    });
  }

  // 시트·메일 중 하나라도 성공하면 접수 완료로 처리
  function send(data) {
    if (data.website) return Promise.resolve(); // 스팸 봇 차단용 숨김 칸
    var jobs = [sendSheet(data), sendEmail(data)];
    return new Promise(function (resolve, reject) {
      var failed = 0;
      jobs.forEach(function (p) {
        p.then(resolve, function () { if (++failed === jobs.length) reject(new Error('all-failed')); });
      });
    });
  }

  window.__mgSend = function (data) {
    data.phone = String(data.phone || '').trim();
    if (!PHONE_RE.test(data.phone.replace(/\s/g, ''))) {
      alert('연락처를 정확히 입력해 주세요. (예: 010-1234-5678)');
      return Promise.resolve(false);
    }
    return send(data).then(function () { return true; }, function () {
      alert('일시적으로 온라인 접수가 되지 않습니다.\n대표번호 1666-5984로 전화 주시면 바로 상담해 드립니다.');
      return false;
    });
  };

  // 메인 페이지 '분양 상담 예약' 폼
  window.__mgLead = function (form, centerName) {
    var f = form.elements;
    var btn = form.querySelector('[type=submit]');
    if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = '접수 중...'; }
    window.__mgSend({
      source: '메인 상담예약',
      center: centerName || '',
      name: f.name ? f.name.value : '',
      phone: f.phone ? f.phone.value : '',
      agree: f.agree && f.agree.checked ? 'Y' : 'N',
      website: f.website ? f.website.value : ''
    }).then(function (ok) {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; }
      if (ok) {
        alert('상담 신청이 접수되었습니다.\n담당자가 빠르게 연락드리겠습니다. (대표번호 1666-5984)');
        form.reset();
      }
    });
  };
})();
