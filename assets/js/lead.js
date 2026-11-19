/* 홈페이지 상담신청 → 구글 시트 전송 (마곡산단 홈페이지 상담신청 DB) */
(function () {
  // 구글 Apps Script 웹 앱 배포 주소 (배포 후 이 한 줄만 바꾸면 됩니다)
  var ENDPOINT = '';

  var PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

  function send(data) {
    if (!ENDPOINT) return Promise.reject(new Error('not-configured'));
    var body = new URLSearchParams();
    Object.keys(data).forEach(function (k) { body.append(k, data[k] == null ? '' : String(data[k])); });
    return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: body });
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
