/* Math Trainer — shared helpers for building questions.
   Every topic is a generator function that returns a fresh random question,
   so a round never runs out of exercises. Generators call MathKit.make()
   to turn { prompt, answer, wrong, explain } into four answer buttons. */

(function () {
  const M = (window.MathKit = {});
  window.MATH_LEVELS = [];

  // ---------- Random numbers ----------
  M.rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  M.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  M.chance = p => Math.random() < p;
  M.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  M.gcd = (a, b) => (b ? M.gcd(b, a % b) : Math.abs(a));
  M.lcm = (a, b) => (a * b) / M.gcd(a, b);
  M.round = n => Math.round(n * 1e6) / 1e6;
  M.names = ['Luca', 'Sofia', 'Marco', 'Emma', 'Leo', 'Giulia', 'Noah', 'Alma', 'Matteo', 'Freja', 'Oscar', 'Chiara'];
  M.name = () => M.pick(M.names);

  // ---------- Formatting ----------
  // English number style: 12,345.6 and a real minus sign for negatives.
  M.fmt = n => {
    const s = Math.abs(M.round(n)).toLocaleString('en-US', { maximumFractionDigits: 6 });
    return n < 0 ? '−' + s : s;
  };
  M.euro = n => '€' + (Number.isInteger(M.round(n)) ? M.fmt(n) : M.round(n).toFixed(2));
  M.frac = (n, d) => `<span class="frac" aria-label="${n} over ${d}"><span>${n}</span><span>${d}</span></span>`;
  // Shows improper fractions as mixed numbers, e.g. 5/4 as 1 1/4.
  M.mixed = (n, d) => {
    if (n % d === 0) return String(n / d);
    if (n < d) return M.frac(n, d);
    return `${Math.floor(n / d)}&thinsp;${M.frac(n % d, d)}`;
  };
  M.simplify = (n, d) => {
    const g = M.gcd(n, d);
    return [n / g, d / g];
  };
  M.cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  M.an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

  M.PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions', 'ten millions', 'hundred millions'];

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const under100 = n => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
  const under1000 = n => {
    const h = Math.floor(n / 100), r = n % 100;
    if (!h) return under100(r);
    return ONES[h] + ' hundred' + (r ? ' and ' + under100(r) : '');
  };
  // British-style number words up to 999,999 ("forty-five thousand and twenty").
  M.words = n => {
    if (n === 0) return 'zero';
    const th = Math.floor(n / 1000), r = n % 1000;
    let s = th ? under1000(th) + ' thousand' : '';
    if (r) s += (th ? (r < 100 ? ' and ' : ' ') : '') + under1000(r);
    return s;
  };

  // ---------- Building a question ----------
  // q.answer and q.wrong can be numbers (formatted with q.unit) or HTML strings.
  // Numeric questions are topped up to four options with nearby numbers.
  M.make = function (q) {
    const show = v => {
      if (typeof v !== 'number') return String(v);
      if (q.unit === '€') return M.euro(v);
      if (q.unit === '%' || q.unit === '°C' || q.unit === '°') return M.fmt(v) + q.unit;
      return M.fmt(v) + (q.unit ? ' ' + q.unit : '');
    };
    const min = q.min ?? 0;
    const right = show(q.answer);
    const options = [right];
    const seen = new Set([right]);
    const add = v => {
      if (v === null || v === undefined || options.length >= 4) return;
      if (typeof v === 'number' && (!Number.isFinite(v) || v < min)) return;
      const s = show(typeof v === 'number' ? M.round(v) : v);
      if (seen.has(s)) return;
      seen.add(s);
      options.push(s);
    };
    (q.wrong || []).forEach(add);
    if (typeof q.answer === 'number') {
      const step = q.step || 1;
      for (let k = 1; options.length < 4 && k < 40; k++) {
        add(q.answer + k * step);
        add(q.answer - k * step);
      }
    }
    let order;
    if (q.order) order = q.order.filter(o => seen.has(o));
    else order = M.shuffle(options);
    return {
      prompt: q.prompt,
      visual: q.visual || '',
      options: order,
      correct: order.indexOf(right),
      explain: q.explain
    };
  };

  // ---------- Reusable question types ----------
  M.compareQ = function (a, b, show = M.fmt) {
    const sign = a < b ? '&lt;' : a > b ? '&gt;' : '=';
    const words = a < b ? 'is less than' : a > b ? 'is greater than' : 'is equal to';
    let why = '';
    if (a !== b) {
      const sa = String(a), sb = String(b);
      if (sa.length !== sb.length) why = `${show(a > b ? a : b)} has more digits, so it is bigger. `;
      else {
        let i = 0;
        while (sa[i] === sb[i]) i++;
        const place = M.PLACES[sa.length - 1 - i];
        why = `Compare from the left. The first digits that differ are in the ${place}: ${sa[i]} and ${sb[i]}. `;
      }
    }
    return M.make({
      prompt: `Which sign makes this true?<div class="big">${show(a)} <span class="blank">?</span> ${show(b)}</div>`,
      answer: sign,
      wrong: ['&lt;', '=', '&gt;'],
      order: ['&lt;', '=', '&gt;'],
      explain: `${why}${show(a)} ${words} ${show(b)}, so the sign is ${sign}.`
    });
  };

  // "What is the value of the 7 in 4,725?"
  M.placeValueQ = function (min, max) {
    let n, s;
    do {
      n = M.rnd(min, max);
      s = String(n);
    } while (new Set(s).size !== s.length || s.includes('0'));
    const i = M.rnd(0, s.length - 1);
    const d = Number(s[i]);
    const p = s.length - 1 - i;
    const value = d * 10 ** p;
    const shown = M.fmt(n).replace(/\d/g, (ch, at, all) => {
      // Underline the digit we ask about (count only digits, skip commas).
      const idx = all.slice(0, at).replace(/,/g, '').length;
      return idx === i ? `<u>${ch}</u>` : ch;
    });
    return M.make({
      prompt: `What is the value of the underlined digit?<div class="big">${shown}</div>`,
      answer: value,
      wrong: [d, d * 10 ** (p + 1), p > 0 ? d * 10 ** (p - 1) : d * 100, d * 10 ** (p + 2)],
      explain: `The ${d} is in the ${M.PLACES[p]} place, so it is worth ${d}${p ? ' × ' + M.fmt(10 ** p) : ''} = ${M.fmt(value)}.`
    });
  };

  M.roundQ = function (n, place) {
    const r = Math.round(n / place) * place;
    const down = Math.floor(n / place) * place, up = down + place;
    const next = Math.floor((n % place) / (place / 10));
    const placeName = M.PLACES[Math.log10(place)];
    const nextName = M.PLACES[Math.log10(place) - 1];
    return M.make({
      prompt: `Round to the nearest <b>${place === 10 ? 'ten' : M.fmt(place)}</b>.<div class="big">${M.fmt(n)}</div>`,
      answer: r,
      wrong: [r === up ? down : up, Math.round(n / (place * 10)) * place * 10, Math.round(n / (place / 10)) * (place / 10), r + place],
      explain: `Look at the ${nextName} digit: ${next}. ${next >= 5 ? '5 or more rounds up' : 'Less than 5 rounds down'}, so ${M.fmt(n)} rounds to ${M.fmt(r)} (nearest ${placeName.replace(/s$/, '')}).`
    });
  };

  // ---------- Step-by-step explanations ----------
  M.explainAdd = function (a, b) {
    const steps = [];
    let carry = 0, x = a, y = b;
    for (let i = 0; x > 0 || y > 0; i++) {
      const da = x % 10, db = y % 10, s = da + db + carry;
      const more = x >= 10 || y >= 10;
      steps.push(`${M.cap(M.PLACES[i])}: ${da} + ${db}${carry ? ' + 1' : ''} = ${s}${s >= 10 && more ? `, write ${s % 10} and carry 1` : ''}`);
      carry = s >= 10 ? 1 : 0;
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return steps.join('. ') + `. So ${M.fmt(a)} + ${M.fmt(b)} = ${M.fmt(a + b)}.`;
  };

  M.explainSub = function (a, b) {
    const steps = [];
    let borrow = 0, x = a, y = b;
    for (let i = 0; x > 0; i++) {
      const top = x % 10 - borrow, db = y % 10;
      const lent = borrow ? ` (it lent 1, so ${x % 10} became ${top})` : '';
      if (x < 10 && top === 0 && db === 0) break;
      if (top < db) {
        steps.push(`${M.cap(M.PLACES[i])}${lent}: ${top} is smaller than ${db}, so borrow 1 from the ${M.PLACES[i + 1]}: ${top + 10} − ${db} = ${top + 10 - db}`);
        borrow = 1;
      } else {
        steps.push(`${M.cap(M.PLACES[i])}${lent}: ${top} − ${db} = ${top - db}`);
        borrow = 0;
      }
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return steps.join('. ') + `. So ${M.fmt(a)} − ${M.fmt(b)} = ${M.fmt(a - b)}.`;
  };

  // Splits a number into place parts: 347 → [300, 40, 7].
  M.parts = n => String(n).split('').map((d, i, all) => Number(d) * 10 ** (all.length - 1 - i)).filter(Boolean);
  M.explainMul = function (a, b) {
    const p = M.parts(a);
    if (p.length === 1) return `${M.fmt(a)} × ${b} = ${M.fmt(a * b)}.`;
    return `Split ${M.fmt(a)} into ${p.map(M.fmt).join(' + ')}. ${p.map(x => `${M.fmt(x)} × ${b} = ${M.fmt(x * b)}`).join(', ')}. Add them: ${p.map(x => M.fmt(x * b)).join(' + ')} = ${M.fmt(a * b)}.`;
  };

  // Common slips, used as wrong answers.
  M.noCarryAdd = (a, b) => {
    let r = 0;
    for (let p = 1, x = a, y = b; x > 0 || y > 0; p *= 10, x = Math.floor(x / 10), y = Math.floor(y / 10)) r += ((x % 10 + y % 10) % 10) * p;
    return r;
  };
  M.swapSub = (a, b) => {
    let r = 0;
    for (let p = 1, x = a, y = b; x > 0 || y > 0; p *= 10, x = Math.floor(x / 10), y = Math.floor(y / 10)) r += Math.abs(x % 10 - y % 10) * p;
    return r;
  };

  // ---------- Pictures (inline SVG, coloured from CSS) ----------
  // A written column sum, like in an Italian exercise book.
  M.column = (a, b, op) => {
    const sa = String(a), sb = String(b), w = Math.max(sa.length, sb.length) + 1;
    const row = (s, first = '') => {
      const cells = Array(w).fill('');
      cells[0] = first;
      s.split('').forEach((c, i) => (cells[w - s.length + i] = c));
      return cells.map(c => `<span>${c}</span>`).join('');
    };
    return `<div class="column" style="--cols:${w}" aria-hidden="true">${row(sa)}${row(sb, op)}<span class="rule"></span>${row('?')}</div>`;
  };

  M.dots = (rows, cols) => {
    const r = 9, gap = 26, w = cols * gap + 10, h = rows * gap + 10;
    let c = '';
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) c += `<circle cx="${18 + j * gap}" cy="${18 + i * gap}" r="${r}"/>`;
    return `<svg class="pic dots" viewBox="0 0 ${w + 10} ${h + 10}" width="${w + 10}" role="img" aria-label="${rows} rows of ${cols} dots">${c}</svg>`;
  };

  M.bar = (n, d) => {
    const W = 300, H = 56, cw = W / d;
    let c = '';
    for (let i = 0; i < d; i++) c += `<rect x="${4 + i * cw}" y="4" width="${cw}" height="${H}" class="${i < n ? 'fill' : 'empty'}"/>`;
    return `<svg class="pic" viewBox="0 0 ${W + 8} ${H + 8}" width="${W + 8}" role="img" aria-label="A bar cut into ${d} equal parts, ${n} coloured">${c}</svg>`;
  };

  M.rect = (w, h, unit = 'cm') => {
    const s = Math.min(200 / w, 110 / h), rw = w * s, rh = h * s, x = (260 - rw) / 2, y = 20;
    return `<svg class="pic" viewBox="0 0 300 ${rh + 60}" width="300" role="img" aria-label="Rectangle ${w} ${unit} by ${h} ${unit}">
      <rect x="${x}" y="${y}" width="${rw}" height="${rh}" class="shape"/>
      <text x="${x + rw / 2}" y="${y + rh + 26}" text-anchor="middle">${w} ${unit}</text>
      <text x="${x + rw + 10}" y="${y + rh / 2 + 6}">${h} ${unit}</text></svg>`;
  };

  // Triangle, parallelogram or trapezoid with base, top and dashed height.
  M.poly = (kind, base, h, top = 0, unit = 'cm') => {
    const s = Math.min(200 / Math.max(base, top || 0, 1), 110 / h);
    const bw = base * s, hh = h * s, y0 = 20 + hh;
    const off = kind === 'parallelogram' ? Math.min(40, bw * 0.3) : 0;
    const x0 = (300 - bw - off) / 2;
    let pts, hx;
    if (kind === 'triangle') {
      hx = x0 + bw * 0.35;
      pts = `${x0},${y0} ${x0 + bw},${y0} ${hx},${y0 - hh}`;
    } else if (kind === 'parallelogram') {
      hx = x0 + off;
      pts = `${x0},${y0} ${x0 + bw},${y0} ${x0 + bw + off},${y0 - hh} ${x0 + off},${y0 - hh}`;
    } else {
      const tw = top * s, inset = (bw - tw) / 2;
      hx = x0 + inset;
      pts = `${x0},${y0} ${x0 + bw},${y0} ${x0 + inset + tw},${y0 - hh} ${x0 + inset},${y0 - hh}`;
    }
    const topLabel = kind === 'trapezoid' ? `<text x="${x0 + bw / 2}" y="${y0 - hh - 8}" text-anchor="middle">${top} ${unit}</text>` : '';
    return `<svg class="pic" viewBox="0 0 300 ${hh + 70}" width="300" role="img" aria-label="A ${kind} with base ${base} ${unit} and height ${h} ${unit}">
      <polygon points="${pts}" class="shape"/>
      <line x1="${hx}" y1="${y0}" x2="${hx}" y2="${y0 - hh}" class="height"/>
      <text x="${hx + 6}" y="${y0 - hh / 2 + 5}">h = ${h} ${unit}</text>
      <text x="${x0 + bw / 2}" y="${y0 + 26}" text-anchor="middle">${base} ${unit}</text>${topLabel}</svg>`;
  };

  M.angle = deg => {
    const cx = 60, cy = 120, L = 110, rad = (deg * Math.PI) / 180;
    const x2 = cx + L * Math.cos(rad), y2 = cy - L * Math.sin(rad);
    const ar = 30, ax = cx + ar * Math.cos(rad), ay = cy - ar * Math.sin(rad);
    const arc = deg === 90
      ? `<path d="M ${cx + 18} ${cy} L ${cx + 18} ${cy - 18} L ${cx} ${cy - 18}" class="arc"/>`
      : `<path d="M ${cx + ar} ${cy} A ${ar} ${ar} 0 ${deg > 180 ? 1 : 0} 0 ${ax} ${ay}" class="arc"/>`;
    const left = deg > 90 ? Math.ceil(-L * Math.cos(rad)) : 0;
    return `<svg class="pic" viewBox="${-left} 0 ${200 + left} 140" width="${Math.min(300, 200 + left)}" role="img" aria-label="An angle">
      <line x1="${cx}" y1="${cy}" x2="${cx + L}" y2="${cy}" class="ray"/>
      <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" class="ray"/>${arc}</svg>`;
  };
})();
