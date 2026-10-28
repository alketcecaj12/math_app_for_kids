/* Level 2 — ages 8–9, Italian classe terza (3rd grade of scuola primaria).
   Numbers to 1,000, column addition and subtraction, all the times tables,
   multiplying by one digit, division with remainders, first fractions,
   measures and two-step word problems. */

(function () {
  const K = window.MathKit;
  const { rnd, pick, make, fmt, chance, frac } = K;

  function numbers() {
    switch (rnd(1, 5)) {
      case 1:
        return K.placeValueQ(102, 987);
      case 2: {
        const h = rnd(1, 9), t = pick([0, rnd(1, 9)]), u = rnd(0, 9);
        const n = h * 100 + t * 10 + u;
        return make({
          prompt: `Which number is this?<div class="big words">${K.cap(K.words(n))}</div>`,
          answer: n,
          wrong: [h * 100 + u * 10 + t, h * 1000 + t * 10 + u, h * 10 + t + u, n + 100],
          explain: `${h} hundreds, ${t} tens and ${u} ones make ${n}.`
        });
      }
      case 3: {
        const place = pick([10, 100]);
        let n;
        do n = rnd(101, 989); while (n % place === 0);
        return K.roundQ(n, place);
      }
      case 4: {
        const a = rnd(100, 999);
        const b = chance(0.5) ? Number(String(a).split('').reverse().join('')) || a + 1 : a + pick([-90, -9, 9, 90, 100, -100]);
        return K.compareQ(a, Math.max(100, Math.min(999, b)));
      }
      default: {
        const step = pick([10, 100]), more = chance(0.5);
        const n = more ? rnd(100, 999 - step) : rnd(100 + step, 999);
        const r = more ? n + step : n - step;
        return make({
          prompt: `What is <b>${step} ${more ? 'more' : 'less'}</b> than ${n}?`,
          answer: r,
          wrong: [more ? n + 1 : n - 1, more ? n + step * 10 : n - step * 10, more ? n - step : n + step, r + (step === 10 ? 100 : 10)],
          explain: `${step} ${more ? 'more' : 'less'} changes the ${step === 10 ? 'tens' : 'hundreds'} digit: ${n} ${more ? '+' : '−'} ${step} = ${r}.`
        });
      }
    }
  }

  function addition() {
    const a = rnd(105, 789), b = rnd(26, 999 - a);
    return make({
      prompt: `<div class="big">${a} + ${b} = <span class="blank">?</span></div>`,
      visual: K.column(a, b, '+'),
      answer: a + b,
      wrong: [K.noCarryAdd(a, b), a + b + 10, a + b - 10, a + b + 100],
      explain: K.explainAdd(a, b)
    });
  }

  function subtraction() {
    const a = rnd(201, 999), b = rnd(28, a - 20);
    if (chance(0.2)) {
      return make({
        prompt: `What is the missing number?<div class="big">${a} − <span class="blank">?</span> = ${a - b}</div>`,
        answer: b,
        wrong: [a + (a - b), b + 10, b - 10, b + 1],
        explain: `Subtract the result from the first number: ${a} − ${a - b} = ${b}. Check: ${a} − ${b} = ${a - b}.`
      });
    }
    return make({
      prompt: `<div class="big">${a} − ${b} = <span class="blank">?</span></div>`,
      visual: K.column(a, b, '−'),
      answer: a - b,
      wrong: [K.swapSub(a, b), a - b + 10, a - b - 10, a - b + 100],
      explain: K.explainSub(a, b)
    });
  }

  function tables() {
    const a = rnd(2, 10), b = rnd(2, 10), p = a * b;
    if (chance(0.3)) {
      return make({
        prompt: `What is the missing number?<div class="big">${a} × <span class="blank">?</span> = ${p}</div>`,
        answer: b,
        wrong: [b + 1, b - 1, p - a, a],
        explain: `${p} ÷ ${a} = ${b}, because ${a} × ${b} = ${p}.`
      });
    }
    const explain = a <= 4
      ? `${a} × ${b} = ${Array(a).fill(b).join(' + ')} = ${p}.`
      : `Build it from a fact you know: ${a} × ${b - 1} = ${a * (b - 1)}, and one more ${a} makes ${a * (b - 1)} + ${a} = ${p}.`;
    return make({
      prompt: `<div class="big">${a} × ${b} = <span class="blank">?</span></div>`,
      answer: p,
      wrong: [a * (b + 1), a * (b - 1), (a + 1) * b, a + b],
      explain
    });
  }

  function multiply() {
    if (chance(0.25)) {
      const n = rnd(2, 99), z = pick([10, 100]);
      return make({
        prompt: `<div class="big">${n} × ${z} = <span class="blank">?</span></div>`,
        answer: n * z,
        wrong: [n * z * 10, n * (z / 10), n + z],
        explain: `Multiplying by ${z} adds ${z === 10 ? 'one zero' : 'two zeros'}: ${n} × ${z} = ${fmt(n * z)}.`
      });
    }
    const a = chance(0.75) ? rnd(12, 99) : rnd(101, 249), b = rnd(2, a > 100 ? 4 : 9);
    const noCarry = K.parts(a).reduce((s, x) => s + ((x / 10 ** Math.floor(Math.log10(x))) * b % 10) * 10 ** Math.floor(Math.log10(x)), 0);
    return make({
      prompt: `<div class="big">${a} × ${b} = <span class="blank">?</span></div>`,
      answer: a * b,
      wrong: [noCarry || null, a * b + 10, a * b - b, a * (b + 1)],
      explain: K.explainMul(a, b)
    });
  }

  function division() {
    const d = rnd(2, 9), q = rnd(2, 12), r = chance(0.5) ? 0 : rnd(1, d - 1), n = d * q + r;
    if (r === 0) {
      const story = chance(0.4);
      return make({
        prompt: story
          ? `${n} stickers are shared equally between ${d} friends. How many stickers does each friend get?`
          : `<div class="big">${n} ÷ ${d} = <span class="blank">?</span></div>`,
        answer: q,
        wrong: [q + 1, q - 1, n - d, d],
        explain: `${d} × ${q} = ${n}, so ${n} ÷ ${d} = ${q}.`
      });
    }
    const show = (a, b) => `${a} r ${b}`;
    return make({
      prompt: `Divide and find the remainder.<div class="big">${n} ÷ ${d} = <span class="blank">?</span></div>`,
      answer: show(q, r),
      wrong: [show(q, r === d - 1 ? r - 1 : r + 1), show(q - 1, r + d), show(q + 1, r), show(q, 0)].filter(s => !/r -/.test(s)),
      explain: `${d} × ${q} = ${d * q}, and ${n} − ${d * q} = ${r} left over. So ${n} ÷ ${d} = ${q} remainder ${r} (written “${q} r ${r}”).`
    });
  }

  function fractions() {
    switch (rnd(1, 4)) {
      case 1: {
        const d = pick([2, 3, 4, 5, 6, 8, 10]), n = rnd(1, d - 1);
        return make({
          prompt: 'What fraction of the bar is coloured?',
          visual: K.bar(n, d),
          answer: frac(n, d),
          wrong: [frac(d - n, d), frac(n, d - n), n < d - 1 ? frac(n + 1, d) : frac(n - 1 || 1, d + 1), frac(d, n), frac(n, d + 2)],
          explain: `The bar has ${d} equal parts and ${n} ${n > 1 ? 'are' : 'is'} coloured, so the fraction is ${frac(n, d)}: the top number counts the coloured parts, the bottom number counts all the parts.`
        });
      }
      case 2: {
        const d = pick([2, 3, 4, 5, 10]), q = rnd(2, 10), n = d * q;
        return make({
          prompt: `What is ${frac(1, d)} of ${n}?`,
          answer: q,
          wrong: [n - d, q + 1, d, n * d],
          explain: `To find ${frac(1, d)} of a number, divide it by ${d}: ${n} ÷ ${d} = ${q}.`
        });
      }
      case 3: {
        const [a, b] = K.shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 2);
        const big = Math.min(a, b);
        return make({
          prompt: `Which fraction is <b>bigger</b>?`,
          answer: frac(1, big),
          wrong: [frac(1, a === big ? b : a), 'They are equal'],
          order: [frac(1, a), frac(1, b), 'They are equal'],
          explain: `The fewer parts you cut a whole into, the bigger each part is. Cutting into ${big} parts gives bigger pieces than cutting into ${Math.max(a, b)}, so ${frac(1, big)} is bigger.`
        });
      }
      default: {
        const d = pick([4, 6, 8, 10, 12]), n = rnd(1, d - 1), name = K.name();
        return make({
          prompt: `A pizza is cut into ${d} equal slices. ${name} eats ${n}. What fraction of the pizza did ${name} eat?`,
          answer: frac(n, d),
          wrong: [frac(d - n, d), frac(n, d - n), frac(d, n), frac(1, n)],
          explain: `There are ${d} slices in total and ${name} ate ${n}, so ${frac(n, d)} of the pizza.`
        });
      }
    }
  }

  const CONV = [
    { from: 'm', to: 'cm', f: 100 },
    { from: 'km', to: 'm', f: 1000 },
    { from: 'kg', to: 'g', f: 1000 },
    { from: 'l', to: 'ml', f: 1000 },
    { from: 'hours', to: 'minutes', f: 60 },
    { from: 'weeks', to: 'days', f: 7 },
    { from: 'minutes', to: 'seconds', f: 60 }
  ];
  function measures() {
    const c = pick(CONV), n = rnd(2, 9), big = n * c.f;
    const one = c.from.replace(/s$/, '');
    if (chance(0.5)) {
      return make({
        prompt: `<div class="big">${n} ${c.from} = <span class="blank">?</span> ${c.to}</div>`,
        answer: big, unit: c.to,
        wrong: [c.f === 100 ? n * 10 : n * 100, n * c.f * 10, n + c.f, big + c.f],
        explain: `1 ${one} = ${fmt(c.f)} ${c.to}, so ${n} ${c.from} = ${n} × ${fmt(c.f)} = ${fmt(big)} ${c.to}.`
      });
    }
    return make({
      prompt: `<div class="big">${fmt(big)} ${c.to} = <span class="blank">?</span> ${c.from}</div>`,
      answer: n, unit: c.from,
      wrong: [n * 10, n + 1, n - 1, big / 10],
      explain: `1 ${one} = ${fmt(c.f)} ${c.to}, so divide: ${fmt(big)} ÷ ${fmt(c.f)} = ${n} ${c.from}.`
    });
  }

  function words() {
    const name = K.name();
    switch (rnd(1, 5)) {
      case 1: {
        const k = rnd(3, 8), b = rnd(4, 12), c = rnd(3, k * b - 2);
        return make({
          prompt: `${name} buys ${k} packs of ${b} pencils and gives ${c} pencils to friends. How many pencils does ${name} have left?`,
          answer: k * b - c,
          wrong: [k * b + c, k * b, k + b - c > 0 ? k + b - c : k * b - c + 10],
          explain: `First multiply: ${k} × ${b} = ${k * b} pencils. Then take away: ${k * b} − ${c} = ${k * b - c}.`
        });
      }
      case 2: {
        const seats = pick([40, 48, 52, 60]), on = rnd(10, seats - 20), more = rnd(3, seats - on - 2);
        return make({
          prompt: `A bus has ${seats} seats. ${on} people are on the bus and ${more} more get on. How many seats are still empty?`,
          answer: seats - on - more,
          wrong: [on + more, seats - on, seats - on + more],
          explain: `People on the bus: ${on} + ${more} = ${on + more}. Empty seats: ${seats} − ${on + more} = ${seats - on - more}.`
        });
      }
      case 3: {
        const m = pick([20, 50, 100]), p1 = rnd(5, Math.floor(m / 2)), p2 = rnd(3, m - p1 - 1);
        return make({
          prompt: `${name} has €${m}. A book costs €${p1} and a game costs €${p2}. How much money is left after buying both?`,
          answer: m - p1 - p2, unit: '€',
          wrong: [p1 + p2, m - p1, m - p2, m - p1 - p2 + 10],
          explain: `Both cost ${p1} + ${p2} = €${p1 + p2}. Left: ${m} − ${p1 + p2} = €${m - p1 - p2}.`
        });
      }
      case 4: {
        const d = pick([6, 8, 9, 10, 12]);
        let n;
        do n = rnd(20, 90); while (n % d === 0);
        const need = Math.ceil(n / d);
        return make({
          prompt: `${n} children go on a school trip. Each minibus takes ${d} children. How many minibuses are needed?`,
          answer: need,
          wrong: [need - 1, need + 1, n - d],
          explain: `${n} ÷ ${d} = ${Math.floor(n / d)} remainder ${n % d}. The ${n % d} children left over still need a minibus, so you need ${need}.`
        });
      }
      default: {
        const t = rnd(3, 9), b = rnd(6, 12), s = rnd(5, t * b - 3);
        return make({
          prompt: `A baker makes ${t} trays of ${b} buns and sells ${s} of them. How many buns are left?`,
          answer: t * b - s,
          wrong: [t * b + s, t * b, t * b - s + 10],
          explain: `Buns baked: ${t} × ${b} = ${t * b}. Left: ${t * b} − ${s} = ${t * b - s}.`
        });
      }
    }
  }

  window.MATH_LEVELS.push({
    id: 'L2',
    age: '8–9',
    grade: 'Italian 3rd grade',
    gradeIt: 'classe terza',
    title: 'Number builders',
    blurb: 'Numbers to 1,000, all the times tables, division with remainders, first fractions and measures.',
    topics: [
      { id: 'numbers', icon: '100', title: 'Numbers to 1,000', blurb: 'Place value, rounding, number words', gen: numbers },
      { id: 'add', icon: '+', title: 'Column addition', blurb: 'Three-digit sums with carrying', gen: addition },
      { id: 'sub', icon: '−', title: 'Column subtraction', blurb: 'Three-digit differences with borrowing', gen: subtraction },
      { id: 'tables', icon: '×', title: 'All the times tables', blurb: 'Tables from 2 to 10', gen: tables },
      { id: 'mult', icon: '×1', title: 'Multiplying', blurb: 'By one digit, by 10 and 100', gen: multiply },
      { id: 'div', icon: '÷', title: 'Division', blurb: 'Sharing and remainders', gen: division },
      { id: 'fractions', icon: '½', title: 'Fractions', blurb: 'Parts of a whole and of a number', gen: fractions },
      { id: 'measures', icon: 'cm', title: 'Measures and time', blurb: 'Metres, grams, litres, minutes', gen: measures },
      { id: 'words', icon: '?', title: 'Word problems', blurb: 'Two-step stories', gen: words }
    ]
  });
})();
