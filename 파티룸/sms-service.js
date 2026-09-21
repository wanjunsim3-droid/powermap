// =========================================================================
// Sponge Partyroom - SMS / Alimtalk Auto Messaging Service
// 알리고(Aligo) / 솔라피(Solapi) / Webhook / 시뮬레이션 통합 메시징 모듈
// =========================================================================

const DEFAULT_SMS_CONFIG = {
  enabled: true,
  provider: 'simulation', // 'aligo' | 'solapi' | 'webhook' | 'simulation'
  adminPhone: '010-8280-8245',
  senderPhone: '010-8280-8245',
  apiKey: '',
  apiSecret: '', // solapi secret or aligo userid
  webhookUrl: '',
  sendToAdmin: true,
  sendToCustomer: true,
  customerMsgTemplate: `[{brand}] 예약 신청이 정상 접수되었습니다.
• 예약자: {name}님
• 이용일시: {date}
• 이용인원: {guests}명
• 예상금액: ₩{price}

※ 관리자 확인 후 최종 입금 및 이용 안내를 문자로 드립니다.
문의: {adminPhone}`,
  adminMsgTemplate: `[{brand} 신규 예약 접수 알림]
• 예약자: {name}님
• 연락처: {phone}
• 이용일시: {date}
• 이용인원: {guests}명
• 예상금액: ₩{price}
• 요청사항: {note}

관리자 대시보드(admin.html)에서 확인 및 승인해 주세요.`
};

// 설정 불러오기 (LocalStorage + 기본값)
export function getSmsConfig() {
  try {
    const saved = localStorage.getItem('sponge_sms_config');
    if (saved) {
      return { ...DEFAULT_SMS_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("SMS 설정 로드 실패:", e);
  }
  return { ...DEFAULT_SMS_CONFIG };
}

// 설정 저장하기
export function saveSmsConfig(config) {
  try {
    localStorage.setItem('sponge_sms_config', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('sponge-sms-config-changed', { detail: config }));
    return true;
  } catch (e) {
    console.error("SMS 설정 저장 실패:", e);
    return false;
  }
}

// 템플릿 변수 치환
function formatMessage(template, data) {
  let priceStr = data.price || '';
  if (data.discount && data.originalPrice) {
    priceStr = `${priceStr} (정상가 ₩${data.originalPrice}, 회원 5만원 할인 적용)`;
  } else if (data.optionSummary && !priceStr.includes('(')) {
    priceStr = `${priceStr} (${data.optionSummary})`;
  } else if (data.hours && !priceStr.includes('(')) {
    const dayName = data.dayType === 'weekend' ? '주말' : '주중';
    const timeName = data.timeType === 'night' ? '야간' : '주간';
    priceStr = `${priceStr} (${dayName} ${timeName} ${data.hours}시간)`;
  }

  return template
    .replace(/{brand}/g, data.brand || '스폰지 파티룸')
    .replace(/{name}/g, data.name || '고객')
    .replace(/{phone}/g, data.phone || '')
    .replace(/{date}/g, data.date || '')
    .replace(/{guests}/g, data.guests || '')
    .replace(/{option}/g, data.optionSummary || '')
    .replace(/{price}/g, priceStr)
    .replace(/{note}/g, data.note || '없음')
    .replace(/{adminPhone}/g, data.adminPhone || '010-8280-8245');
}

// 발송 이력(로그) 저장
function logSmsHistory(logEntry) {
  try {
    let history = JSON.parse(localStorage.getItem('sponge_sms_logs') || '[]');
    history.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...logEntry
    });
    if (history.length > 100) history = history.slice(0, 100);
    localStorage.setItem('sponge_sms_logs', JSON.stringify(history));
    window.dispatchEvent(new Event('sponge-sms-logs-updated'));
  } catch (e) {
    console.warn("SMS 로그 기록 실패:", e);
  }
}

// 발송 이력 목록 조회
export function getSmsLogs() {
  try {
    return JSON.parse(localStorage.getItem('sponge_sms_logs') || '[]');
  } catch (e) {
    return [];
  }
}

// =========================================================================
// 알리고(Aligo) SMS / LMS API 발송
// =========================================================================
async function sendViaAligo(config, receiver, message, title = '예약 알림') {
  const formData = new FormData();
  formData.append('key', config.apiKey);
  formData.append('user_id', config.apiSecret);
  formData.append('sender', config.senderPhone.replace(/[^0-9]/g, ''));
  formData.append('receiver', receiver.replace(/[^0-9]/g, ''));
  formData.append('msg', message);
  formData.append('title', title);

  const res = await fetch('https://apis.aligo.in/send/', {
    method: 'POST',
    body: formData
  });
  const json = await res.json();
  if (json.result_code === 1 || json.result_code === '1') {
    return { success: true, messageId: json.msg_id, provider: 'aligo' };
  } else {
    throw new Error(`알리고 전송 실패 (${json.result_code}): ${json.message}`);
  }
}

// =========================================================================
// 솔라피(Solapi / 구 CoolSMS) API 발송
// =========================================================================
async function sendViaSolapi(config, receiver, message) {
  const cleanReceiver = receiver.replace(/[^0-9]/g, '');
  const cleanSender = config.senderPhone.replace(/[^0-9]/g, '');
  
  const body = {
    message: {
      to: cleanReceiver,
      from: cleanSender,
      text: message
    }
  };

  const res = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (res.ok) {
    return { success: true, messageId: json.groupId || json.messageId, provider: 'solapi' };
  } else {
    throw new Error(`솔라피 전송 실패: ${json.message || res.statusText}`);
  }
}

// =========================================================================
// Webhook 발송 (Slack, Discord, 개인 백엔드 프록시 등)
// =========================================================================
async function sendViaWebhook(config, receiver, message, meta) {
  if (!config.webhookUrl) throw new Error('웹훅 URL이 설정되어 있지 않습니다.');
  const payload = {
    type: 'SPONGE_RESERVATION_SMS',
    receiver: receiver,
    message: message,
    meta: meta,
    timestamp: new Date().toISOString()
  };

  const res = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    return { success: true, provider: 'webhook' };
  } else {
    throw new Error(`웹훅 전송 오류 HTTP ${res.status}`);
  }
}

// =========================================================================
// 메인 발송 함수: 단일 수신자
// =========================================================================
async function sendSingleMessage(config, receiver, message, title = '예약 알림', meta = {}) {
  const cleanPhone = (receiver || '').replace(/[^0-9]/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error(`유효하지 않은 수신 전화번호: ${receiver}`);
  }

  // 1. 시뮬레이션 모드 (API 키 미등록 상태 또는 테스트 모드)
  if (config.provider === 'simulation' || !config.apiKey) {
    console.log(`[SMS 시뮬레이션 발송] 수신: ${receiver}\n내용:\n${message}`);
    logSmsHistory({
      type: meta.type || 'RESERVATION',
      receiver: receiver,
      status: 'success (시뮬레이션)',
      content: message,
      provider: 'simulation'
    });
    return { success: true, simulated: true, provider: 'simulation' };
  }

  try {
    let result;
    if (config.provider === 'aligo') {
      result = await sendViaAligo(config, receiver, message, title);
    } else if (config.provider === 'solapi') {
      result = await sendViaSolapi(config, receiver, message);
    } else if (config.provider === 'webhook') {
      result = await sendViaWebhook(config, receiver, message, meta);
    } else {
      result = { success: true, simulated: true };
    }

    logSmsHistory({
      type: meta.type || 'RESERVATION',
      receiver: receiver,
      status: 'success',
      content: message,
      provider: config.provider
    });
    return result;
  } catch (err) {
    console.error(`SMS 발송 실패 (${receiver}):`, err);
    logSmsHistory({
      type: meta.type || 'RESERVATION',
      receiver: receiver,
      status: 'failed',
      error: err.message,
      content: message,
      provider: config.provider
    });
    throw err;
  }
}

// =========================================================================
// 예약 접수 시 사장님 + 고객 동시 자동 발송 인터페이스
// =========================================================================
export async function sendReservationAutoSms(reservationData) {
  const config = getSmsConfig();
  if (!config.enabled) {
    console.log("SMS 자동 발송 기능이 비활성화(OFF)되어 있습니다.");
    return { enabled: false };
  }

  const results = {
    adminSent: false,
    customerSent: false,
    errors: []
  };

  const templateData = {
    ...reservationData,
    adminPhone: config.adminPhone || '010-8280-8245'
  };

  // 1. 사장님(관리자)에게 신규 예약 접수 알림 발송
  if (config.sendToAdmin && config.adminPhone) {
    try {
      const adminMsg = formatMessage(config.adminMsgTemplate, templateData);
      await sendSingleMessage(config, config.adminPhone, adminMsg, `[${templateData.brand}] 신규 예약 접수`, {
        type: 'ADMIN_ALERT',
        brand: templateData.brand,
        name: templateData.name
      });
      results.adminSent = true;
    } catch (err) {
      results.errors.push(`관리자 발송 실패: ${err.message}`);
    }
  }

  // 2. 고객에게 예약 접수 확인 문자 발송
  if (config.sendToCustomer && reservationData.phone) {
    try {
      const customerMsg = formatMessage(config.customerMsgTemplate, templateData);
      await sendSingleMessage(config, reservationData.phone, customerMsg, `[${templateData.brand}] 예약 접수 확인`, {
        type: 'CUSTOMER_CONFIRM',
        brand: templateData.brand,
        name: templateData.name
      });
      results.customerSent = true;
    } catch (err) {
      results.errors.push(`고객 발송 실패: ${err.message}`);
    }
  }

  return results;
}

// =========================================================================
// 테스트 문자 발송 (관리자 화면용)
// =========================================================================
export async function sendTestSms(targetPhone, customConfig = null) {
  const config = customConfig || getSmsConfig();
  const testMessage = `[스폰지 파티룸] 문자/알림 발송 테스트 성공!
• 발송 시각: ${new Date().toLocaleString('ko-KR')}
• 발송 방식: ${config.provider.toUpperCase()}
정상적으로 연동되어 예약 신청 시 자동 문자가 발송됩니다.`;

  return await sendSingleMessage(config, targetPhone, testMessage, '[스폰지] 테스트 문자', {
    type: 'TEST'
  });
}
