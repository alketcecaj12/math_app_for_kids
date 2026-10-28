/* Math Trainer — screens and round logic.
   Home → level → topic → 10 questions with instant feedback → results.
   Progress (best score per topic, best streak) is kept in localStorage. */

(function () {
  const K = window.MathKit;
  const LEVELS = window.MATH_LEVELS;
  const ROUND = 10;
  const app = document.getElementById('app');
  const live = document.getElementById('liveRegion');
  const PRAISE = ['Great job!', 'Brilliant!', 'Well done!', 'Spot on!', 'Fantastic!', 'You got it!'];

  // ---------- Saved progress ----------
  const KEY = 'mathTrainer.v1';
  let saved = { best: {}, bestStreak: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = Object.assign(saved, JSON.parse(raw));
  } catch (e) { /* private mode: progress just isn't remembered */ }
  const persist = () => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ }
  };

  const starsFor = score => (score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0);
  const starRow = (n, max = 3) => `<span class="stars" aria-label="${n} of ${max} stars">${'★'.repeat(n)}<span class="off">${'★'.repeat(max - n)}</span></span>`;

  function updateTopbar() {
    const total = Object.values(saved.best).reduce((s, v) => s + starsFor(v), 0);
    document.getElementById('totalStars').textContent = total;
    document.getElementById('bestStreak').textContent = saved.bestStreak;
  }

  // ---------- State ----------
  let state = { view: 'home' };
  const level = () => LEVELS.find(l => l.id === state.level);
  const topic = () => (state.topic === 'mixed' ? MIXED : level().topics.find(t => t.id === state.topic));
  const MIXED = { id: 'mixed', icon: '✦', title: 'Mixed practice', blurb: 'A bit of everything from this level' };

  function go(next) {
    state = Object.assign({}, state, next);
    render();
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ---------- Questions ----------
  function newRound() {
    const lv = level();
    const qs = [], seen = new Set();
    for (let i = 0, tries = 0; qs.length < ROUND && tries < 200; tries++) {
      const t = state.topic === 'mixed' ? K.pick(lv.topics) : topic();
      const q = t.gen();
      const key = q.prompt + q.visual + q.options.join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      q.topicTitle = t.title;
      qs.push(q);
    }
    return { questions: qs, index: 0, picked: null, score: 0, streak: 0, mistakes: [], results: [] };
  }
  // ---------- Screens ----------
  function home() {
    return `
      <section class="hero">
        <p class="eyebrow">Ages 7 to 11</p>
        <h1>Practise math one step ahead.</h1>
        <p class="lead">Four levels that follow what children learn in Italian primary school, one school year at a time. Pick a level, pick a topic and answer 10 questions.</p>
      </section>
      <ol class="level-grid" role="list">
        ${LEVELS.map((l, i) => {
          const done = l.topics.reduce((s, t) => s + starsFor(saved.best[`${l.id}:${t.id}`] || 0), 0);
          return `
          <li>
            <button class="level-card lvl-${i + 1}" data-action="level" data-id="${l.id}">
              <span class="level-age">Ages ${l.age}</span>
              <span class="level-title">${l.title}</span>
              <span class="level-grade">${l.grade} · <i lang="it">${l.gradeIt}</i></span>
              <span class="level-blurb">${l.blurb}</span>
              <span class="level-foot">${l.topics.length} topics <span class="level-stars">★ ${done} / ${l.topics.length * 3}</span></span>
            </button>
          </li>`;
        }).join('')}
      </ol>`;
  }

  function levelView() {
    const lv = level(), i = LEVELS.indexOf(lv) + 1;
    const card = t => {
      const best = saved.best[`${lv.id}:${t.id}`];
      return `
        <li>
          <button class="topic-card${t.id === 'mixed' ? ' mixed' : ''}" data-action="topic" data-id="${t.id}">
            <span class="topic-icon" aria-hidden="true">${t.icon}</span>
            <span class="topic-text">
              <span class="topic-title">${t.title}</span>
              <span class="topic-blurb">${t.blurb}</span>
            </span>
            <span class="topic-best">${best === undefined ? '<span class="new">New</span>' : starRow(starsFor(best))}</span>
          </button>
        </li>`;
    };
    return `
      <div class="lvl-${i}">
        <button class="back" data-action="home">← All levels</button>
        <header class="page-head">
          <p class="eyebrow">Ages ${lv.age} · ${lv.grade} (<i lang="it">${lv.gradeIt}</i>)</p>
          <h1>${lv.title}</h1>
          <p class="lead">${lv.blurb}</p>
        </header>
        <ul class="topic-grid" role="list">
          ${card(MIXED)}
          ${lv.topics.map(card).join('')}
        </ul>
      </div>`;
  }

  function quizView() {
    const r = state.round, q = r.questions[r.index], i = LEVELS.indexOf(level()) + 1;
    const answered = r.picked !== null;
    const right = answered && r.picked === q.correct;
    const opts = q.options.map((o, k) => {
      let cls = 'option';
      if (answered) {
        if (k === q.correct) cls += ' is-correct';
        else if (k === r.picked) cls += ' is-wrong';
        else cls += ' is-dim';
      }
      return `<button class="${cls}" data-action="answer" data-k="${k}" ${answered ? 'disabled' : ''}><span class="key" aria-hidden="true">${k + 1}</span><span class="val">${o}</span></button>`;
    }).join('');
    const feedback = !answered ? '' : `
      <div class="feedback ${right ? 'good' : 'bad'}" role="status">
        <p class="feedback-title">${right ? K.pick(PRAISE) + (r.streak >= 3 ? ` <span class="streak-badge">${r.streak} in a row!</span>` : '') : `Not quite. The answer is <b>${q.options[q.correct]}</b>.`}</p>
        <div class="feedback-why">${q.explain}</div>
        <button class="btn primary" data-action="next" id="nextBtn">${r.index + 1 < r.questions.length ? 'Next question →' : 'See my results →'}</button>
      </div>`;
    return `
      <div class="quiz lvl-${i}">
        <div class="quiz-top">
          <button class="back" data-action="level" data-id="${state.level}">← ${level().title}</button>
          <span class="quiz-count">Question ${r.index + 1} of ${r.questions.length}</span>
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${r.questions.length}" aria-valuenow="${r.index + (answered ? 1 : 0)}">
          ${r.questions.map((_, k) => `<span class="${k < r.index || (k === r.index && answered) ? (r.results[k] ? 'ok' : 'no') : k === r.index ? 'now' : ''}"></span>`).join('')}
        </div>
        <article class="question-card">
          <p class="question-topic">${state.topic === 'mixed' ? q.topicTitle : topic().title}</p>
          <div class="question">${q.prompt}</div>
          ${q.visual ? `<div class="visual">${q.visual}</div>` : ''}
        </article>
        <div class="options${q.options.length === 3 ? ' three' : ''}">${opts}</div>
        ${feedback}
      </div>`;
  }

  function resultsView() {
    const r = state.round, lv = level(), i = LEVELS.indexOf(lv) + 1;
    const stars = starsFor(r.score);
    const msg = r.score === ROUND ? 'Perfect score! You are a math champion!'
      : stars === 3 ? 'Amazing work!'
      : stars === 2 ? 'Really good! A little more practice and you will get 3 stars.'
      : stars === 1 ? 'Good effort! Look at the mistakes below and try again.'
      : 'Keep going! Every try makes you better. Read the explanations and have another go.';
    return `
      <div class="results lvl-${i}">
        <section class="results-hero">
          <p class="eyebrow">${topic().title}</p>
          <div class="big-stars">${starRow(stars)}</div>
          <h1>${r.score} out of ${ROUND}</h1>
          <p class="lead">${msg}</p>
          ${r.newBest ? '<p class="new-best">New best score for this topic!</p>' : ''}
          <div class="actions">
            <button class="btn primary" data-action="topic" data-id="${state.topic}">Play again</button>
            <button class="btn" data-action="level" data-id="${lv.id}">Choose another topic</button>
          </div>
        </section>
        ${r.mistakes.length ? `
          <section class="review">
            <h2>Let's look at the tricky ones</h2>
            <ol role="list">
              ${r.mistakes.map(m => `
                <li class="review-item">
                  <div class="question small">${m.q.prompt}</div>
                  <p><span class="tag bad">You said</span> ${m.q.options[m.picked]} <span class="tag good">Answer</span> ${m.q.options[m.q.correct]}</p>
                  <div class="feedback-why">${m.q.explain}</div>
                </li>`).join('')}
            </ol>
          </section>` : ''}
      </div>`;
  }

  function render() {
    updateTopbar();
    if (state.view === 'level') app.innerHTML = levelView();
    else if (state.view === 'quiz') app.innerHTML = quizView();
    else if (state.view === 'results') app.innerHTML = resultsView();
    else app.innerHTML = home();
  }

  // ---------- Actions ----------
  function answer(k) {
    const r = state.round;
    if (r.picked !== null) return;
    const q = r.questions[r.index];
    r.picked = k;
    const right = k === q.correct;
    r.results[r.index] = right;
    if (right) {
      r.score++;
      r.streak++;
      if (r.streak > saved.bestStreak) { saved.bestStreak = r.streak; persist(); }
    } else {
      r.streak = 0;
      r.mistakes.push({ q, picked: k });
    }
    render();
    live.textContent = right ? 'Correct!' : `Not quite. The answer is ${app.querySelector('.option.is-correct .val').textContent}.`;
    const next = document.getElementById('nextBtn');
    if (next) next.focus({ preventScroll: true });
    const fb = app.querySelector('.feedback');
    if (fb && fb.getBoundingClientRect().bottom > window.innerHeight) fb.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function next() {
    const r = state.round;
    if (r.index + 1 < r.questions.length) {
      r.index++;
      r.picked = null;
      go({});
      return;
    }
    const key = `${state.level}:${state.topic}`;
    if (saved.best[key] === undefined || r.score > saved.best[key]) {
      r.newBest = saved.best[key] !== undefined;
      saved.best[key] = r.score;
      persist();
    }
    go({ view: 'results' });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const a = b.dataset.action;
    if (a === 'home') go({ view: 'home' });
    else if (a === 'level') go({ view: 'level', level: b.dataset.id });
    else if (a === 'topic') {
      state.topic = b.dataset.id;
      go({ view: 'quiz', round: newRound() });
    } else if (a === 'answer') answer(Number(b.dataset.k));
    else if (a === 'next') next();
  });

  document.addEventListener('keydown', e => {
    if (state.view !== 'quiz' || e.altKey || e.ctrlKey || e.metaKey) return;
    const r = state.round;
    const n = Number(e.key);
    if (r.picked === null && n >= 1 && n <= r.questions[r.index].options.length) answer(n - 1);
    else if (r.picked !== null && e.key === 'Enter' && document.activeElement?.id !== 'nextBtn') next();
  });

  render();
})();
