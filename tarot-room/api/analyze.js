// OpenRouter(DeepSeek)로 타로 안내자 답변을 만드는 서버리스 함수.
// API 키는 Vercel 환경변수 OPENROUTER_API_KEY 에만 저장합니다.
const MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash';
const MAX_TOKENS = 600;
const hits = new Map(); // 아주 단순한 IP별 횟수 제한(인스턴스 메모리, 최선 노력)
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 2000) hits.clear();
  return arr.length > LIMIT;
}
const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

const MODE_GUIDE = {
  clarify: '방문자가 적은 질문을 더 잘 읽기 위해, 지금 가장 먼저 확인하면 좋을 질문 한 가지만 따뜻하게 물어보세요. 해석이나 조언은 아직 하지 마세요.',
  reading: '뽑힌 카드와 자리의 의미를 연결해서 첫 리딩을 들려주세요. 카드마다 한두 문장, 마지막에 전체를 묶는 짧은 정리와 오늘 해볼 작은 행동 한 가지를 알려주세요.',
  conversation: '방문자의 방금 답변에 공감하며 이어서 답하세요. 카드 의미와 연결하되 짧게, 마지막에 스스로 생각해볼 질문 한 가지를 건네세요.',
  analysis: '이 배열을 학습자 관점에서 분석하세요. 카드 조합이 만드는 흐름, 정방향과 역방향의 차이, 읽을 때 주의할 점을 설명하세요.',
  followup: '학습자의 추가 질문이나 답변에 이어서 설명하세요. 앞선 분석과 일관되게 답하세요.',
  practice: '학습자가 직접 쓴 해석에 피드백을 주세요. 잘한 점 두 가지, 보완할 점 한두 가지, 다시 써볼 때의 힌트를 알려주세요.',
};

const SYSTEM = [
  '당신은 한국어로 말하는 따뜻하고 차분한 타로 안내자입니다.',
  '타로는 미래를 확정하는 도구가 아니라 마음을 돌아보고 생각을 정리하는 도구로 안내하세요.',
  '건강, 법률, 투자, 안전에 관한 고민은 단정하지 말고 전문가와 상의하도록 부드럽게 권하세요.',
  '위기나 자해 암시가 보이면 카드 해석을 멈추고 주변 사람이나 전문 상담(한국 자살예방 상담전화 109)에 도움을 구하도록 안내하세요.',
  '답변은 평범한 문장으로만 쓰고 마크다운 기호(#, *, -, 표)는 쓰지 마세요. 400자에서 700자 사이로 짧게 쓰세요.',
].join(' ');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 사용할 수 있어요.' });
  if (req.headers['x-tarot-client'] !== 'studio') return res.status(403).json({ error: '허용되지 않은 요청이에요.' });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(503).json({ error: 'AI가 아직 연결되지 않았어요.' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: '잠시 후에 다시 시도해 주세요.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: '요청 형식이 올바르지 않아요.' });

  const mode = MODE_GUIDE[body.mode] ? body.mode : 'reading';
  const cards = Array.isArray(body.cards) ? body.cards.slice(0, 12) : [];
  const cardText = cards.map((c, i) =>
    (i + 1) + '. [' + clip(c.position, 40) + '] ' + clip(c.name, 40) + (c.reversed ? ' (역방향)' : ' (정방향)') +
    ' / 키워드: ' + clip(Array.isArray(c.keywords) ? c.keywords.join(', ') : c.keywords, 120) +
    (c.symbol ? ' / 상징: ' + clip(c.symbol, 120) : '')
  ).join('\n');
  const ctx = [
    '고민 분야: ' + clip(body.category, 30),
    '질문: ' + clip(body.question, 400),
    body.questionContext ? '추가 맥락: ' + clip(typeof body.questionContext === 'string' ? body.questionContext : JSON.stringify(body.questionContext), 600) : '',
    body.spread ? '배열: ' + clip(body.spread, 40) : '',
    cardText ? '뽑은 카드:\n' + cardText : '',
    body.answer ? '방문자의 말: ' + clip(body.answer, 800) : '',
  ].filter(Boolean).join('\n');

  const history = (Array.isArray(body.history) ? body.history : []).slice(-8)
    .map((h) => ({ role: h && h.role === 'assistant' ? 'assistant' : 'user', content: clip(h && h.content, 1200) }))
    .filter((h) => h.content);

  const messages = [
    { role: 'system', content: SYSTEM + '\n이번 요청: ' + MODE_GUIDE[mode] },
    { role: 'user', content: ctx },
    ...history,
  ];

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 55000);
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tarot-reading-room.vercel.app',
        'X-Title': 'Tarot Reading Room',
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: MAX_TOKENS, temperature: 0.8, reasoning: { enabled: false } }),
    });
    clearTimeout(timer);
    const data = await r.json().catch(() => ({}));
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!r.ok || !text) return res.status(502).json({ error: 'AI 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.' });
    return res.status(200).json({ text: String(text).trim() });
  } catch (e) {
    return res.status(502).json({ error: 'AI 연결이 지연되고 있어요. 다시 시도해 주세요.' });
  }
};
