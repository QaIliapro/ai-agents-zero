// ===== Рендер курса из data.js =====
const blocksEl = document.getElementById('blocks');
const barEl = document.getElementById('progress-bar');
const countEl = document.getElementById('progress-count');

const done = COURSE.blocks.filter(b => b.status === 'done').length;
barEl.style.width = (done / COURSE.totalBlocks * 100) + '%';
countEl.textContent = done + ' / ' + COURSE.totalBlocks + ' блоков';

const statusMap = {
  done:  ['Пройден', 'st-done'],
  next:  ['Следующий', 'st-next'],
  empty: ['Ждёт материал', 'st-wait'],
  filled: ['Наполнен', 'st-filled']
};

function blockCard(b) {
  const [label, cls] = statusMap[b.status] || statusMap.waiting;
  const summary = (b.summary || []).map(p => `<p>${p}</p>`).join('');
  const explain = (b.explain || []).map(p => `<p>${p}</p>`).join('');
  const quiz = (b.quiz || []).map((item, i) =>
    `<div class="quiz-item">
       <span class="mono q-num">${String(i+1).padStart(2,'0')}</span>
       <p>${item.q}</p>
       <details class="answer"><summary class="mono">ответ</summary><p>${item.a}</p></details>
     </div>`
  ).join('');
  const quizBlock = b.quiz ? `
    <details class="quiz">
      <summary>Проверь себя <span class="mono count">${b.quiz.length}</span></summary>
      <div class="quiz-list">${quiz}</div>
    </details>` : '';
  const audio = b.audioKey
    ? `<audio class="player" controls preload="none" data-audio-key="${b.audioKey}"></audio>`
    : `<div class="audio-soon mono">🎧 аудио скоро — записываю следующим шагом</div>`;

  return `
  <article class="card block ${b.status} reveal">
    <div class="block-head">
      <span class="mono num">БЛОК ${String(b.num).padStart(2,'0')}</span>
      <span class="badge ${cls}">${label}</span>
    </div>
    <h2>${b.title}</h2>
    ${(b.status === 'done' || b.status === 'filled') ? `
    <section class="sec"><h3 class="mono sec-t">— КАК В КУРСЕ</h3>${summary}</section>
    <section class="sec"><h3 class="mono sec-t">— КАК ЭТО РАБОТАЕТ</h3>${explain}</section>
    ${b.practice ? `<section class="sec"><h3 class="mono sec-t">— МИНИ-ПРАКТИКА</h3>${(b.practice||[]).map(p=>`<p>${p}</p>`).join('')}</section>` : ''}
    ${b.glossary ? `<section class="sec"><h3 class="mono sec-t">— СЛОЖНЫЕ СЛОВА РАЗЖЕВАЛИ</h3><dl class="glossary">${(b.glossary||[]).map(g=>`<dt class="mono">${g.t}</dt><dd>${g.d}</dd>`).join('')}</dl></section>` : ''}
    ${audio}${quizBlock}` : `
    <p class="wait-note">${b.note || 'Ждёт материал от Ильи.'}</p>`}
  </article>`;
}

blocksEl.innerHTML = COURSE.blocks.map(blockCard).join('');

// Вшитое аудио: blob из audio01.js -> <audio data-audio-key>
blocksEl.querySelectorAll('audio[data-audio-key]').forEach(el => {
  const blob = window['AUDIO_' + el.dataset.audioKey];
  if (blob) el.src = blob;
});

// ===== Появление при скролле =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
