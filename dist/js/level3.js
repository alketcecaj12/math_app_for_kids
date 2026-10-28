/* Level 3 — ages 9–10, Italian classe quarta (4th grade of scuola primaria).
   Numbers up to hundreds of thousands, two-digit multiplication, division,
   decimals to hundredths, equivalent fractions, measure conversions,
   perimeter and area, angles. */

(function () {
  const K = window.MathKit;
  const { rnd, pick, make, fmt, chance, frac } = K;

  function bigNumbers() {
    switch (rnd(1, 5)) {
      case 1:
        return K.placeValueQ(12345, 987654);
      case 2: {
        const th = rnd(11, 999), r = pick([rnd(1, 9), rnd(10, 99), rnd(100, 999)]);
        const n = th * 1000 + r;
        return make({
          prompt: `Which number is this?<div class="big words">${K.cap(K.words(n))}</div>`,
          answer: n,
          wrong: [th * 1000 + r * 10, th * 100 + r, th * 10000 + r, th + r],
          explain: `${K.cap(K.words(th))} thousand is ${fmt(th * 1000)}, and ${K.words(r)} more makes ${fmt(n)}. After the thousands there are always three digits, so zeros fill any gaps.`
        });
      }
      case 3: {
        const place = pick([100, 1000, 10000]);
        let n;
        do n = rnd(10001, 989999); while (n % place === 0);
        return K.roundQ(n, place);
      }
      case 4: {
        const a = rnd(10000, 999999);
        const b = a + pick([-1, 1]) * pick([10, 900, 1000, 9000, 100000]);
        return K.compareQ(a, b > 0 ? b : a + 1000);
      }
      default: {
        const step = pick([1000, 10000, 100]), more = chance(0.5);
        const n = rnd(20000, 900000);
        const r = more ? n + step : n - step;
        return make({
          prompt: `What is <b>${fmt(step)} ${more ? 'more' : 'less'}</b> than ${fmt(n)}?`,
          answer: r,
          wrong: [more ? n + step * 10 : n - step * 10, more ? n + step / 10 : n - step / 10, more ? n - step : n + step],
          explain: `${fmt(n)} ${more ? '+' : '−'} ${fmt(step)} = ${fmt(r)}.`
        });
      }
    }
  }

  function multiply() {
    const a = chance(0.7) ? rnd(13, 99) : rnd(101, 499), b = rnd(12, a > 100 ? 29 : 59);
    const t = Math.floor(b / 10) * 10, u = b % 10;
    const explain = u
      ? `Split ${b} into ${t} + ${u}. ${fmt(a)} × ${u} = ${fmt(a * u)} and ${fmt(a)} × ${t} = ${fmt(a * t)}. Add them: ${fmt(a * u)} + ${fmt(a * t)} = ${fmt(a * b)}.`
      : `${fmt(a)} × ${b} = ${fmt(a)} × ${b / 10} × 10 = ${fmt(a * b / 10)} × 10 = ${fmt(a * b)}.`;
    return make({
      prompt: `<div class="big">${fmt(a)} × ${b} = <span class="blank">?</span></div>`,
      answer: a * b,
      // Forgetting to shift the second row is the classic mistake.
      wrong: [a * u + a * (t / 10), a * b + a, a * b - 10, a * b + 100],
      explain
    });
  }

  function divide() {
    switch (rnd(1, 4)) {
      case 1: {
        const d = rnd(2, 9), q = rnd(12, Math.floor(999 / d)), n = d * q;
        const qt = Math.floor(q / 10) * 10, qu = q % 10;
        return make({
          prompt: `<div class="big">${n} ÷ ${d} = <span class="blank">?</span></div>`,
          answer: q,
          wrong: [q + 1, q - 1, q + 10, q * 10],
          explain: qu
            ? `Take ${qt} groups of ${d} first: ${d} × ${qt} = ${d * qt}. That leaves ${n} − ${d * qt} = ${d * qu}, which is ${qu} more groups. So ${qt} + ${qu} = ${q}.`
            : `${d} × ${q} = ${n}, so ${n} ÷ ${d} = ${q}.`
        });
      }
      case 2: {
        const d = rnd(11, 25), q = rnd(2, 9), n = d * q;
        return make({
          prompt: `<div class="big">${n} ÷ ${d} = <span class="blank">?</span></div>`,
          answer: q,
          wrong: [q + 1, q - 1, n - d, q * 10],
          explain: `Count up in ${d}s: ${Array.from({ length: q }, (_, i) => d * (i + 1)).join(', ')}. That is ${q} jumps, so ${n} ÷ ${d} = ${q}.`
        });
      }
      case 3: {
        const d = rnd(3, 9), q = rnd(11, 60), r = rnd(1, d - 1), n = d * q + r;
        const show = (a, b) => `${a} r ${b}`;
        return make({
          prompt: `Divide and find the remainder.<div class="big">${n} ÷ ${d} = <span class="blank">?</span></div>`,
          answer: show(q, r),
          wrong: [show(q, r === d - 1 ? r - 1 : r + 1), show(q - 1, r + d), show(q + 1, r), show(q, 0)].filter(s => !/r -/.test(s)),
          explain: `${d} × ${q} = ${d * q}, and ${n} − ${d * q} = ${r} left over. So the answer is ${q} remainder ${r}.`
        });
      }
      default: {
        const z = pick([10, 100, 1000]), q = rnd(3, 999), n = q * z;
        return make({
          prompt: `<div class="big">${fmt(n)} ÷ ${fmt(z)} = <span class="blank">?</span></div>`,
          answer: q,
          wrong: [q * 10, n / (z / 10), q / 10 >= 1 ? q / 10 : q + 10],
          explain: `Dividing by ${fmt(z)} removes ${Math.log10(z)} zero${z > 10 ? 's' : ''}: ${fmt(n)} ÷ ${fmt(z)} = ${fmt(q)}.`
        });
      }
    }
  }

  function decimals() {
    switch (rnd(1, 5)) {
      case 1: {
        // The "longer number is bigger" trap: 0.7 vs 0.65.
        const w = rnd(0, 9), t = rnd(1, 9);
        let h;
        do h = rnd(11, 99); while (h % 10 === 0 || h === t * 10);
        const a = w + t / 10, b = w + h / 100;
        const big = a > b ? a : b;
        return make({
          prompt: `Which number is <b>bigger</b>?`,
          answer: fmt(big),
          wrong: [fmt(a), fmt(b), 'They are equal'],
          order: [fmt(a), fmt(b), 'They are equal'],
          explain: `Give both numbers two decimal places: ${w}.${t}0 and ${w}.${String(h).padStart(2, '0')}. Now compare the hundredths: ${t * 10} ${t * 10 > h ? '>' : '<'} ${h}, so ${fmt(big)} is bigger. A longer number is not always bigger!`
        });
      }
      case 2: {
        const a = rnd(110, 899), b = rnd(105, 999 - a);
        const A = a / 100, B = b / 100;
        return make({
          prompt: `<div class="big">${A.toFixed(2)} + ${B.toFixed(2)} = <span class="blank">?</span></div>`,
          answer: (a + b) / 100, step: 0.1,
          wrong: [(a + b) / 10, K.noCarryAdd(a, b) / 100, (a + b + 1) / 100],
          explain: `Line up the decimal points and add as usual. In hundredths: ${a} + ${b} = ${a + b}, so ${A.toFixed(2)} + ${B.toFixed(2)} = ${((a + b) / 100).toFixed(2)}.`
        });
      }
      case 3: {
        const a = rnd(300, 999), b = rnd(105, a - 50);
        const A = a / 100, B = b / 100;
        return make({
          prompt: `<div class="big">${A.toFixed(2)} − ${B.toFixed(2)} = <span class="blank">?</span></div>`,
          answer: (a - b) / 100, step: 0.1,
          wrong: [K.swapSub(a, b) / 100, (a - b) / 10, (a - b + 1) / 100],
          explain: `Line up the decimal points and subtract as usual. In hundredths: ${a} − ${b} = ${a - b}, so ${A.toFixed(2)} − ${B.toFixed(2)} = ${((a - b) / 100).toFixed(2)}.`
        });
      }
      case 4: {
        const t = rnd(1, 9), h = rnd(1, 9), w = rnd(0, 5);
        const n = w + t / 10 + h / 100;
        return make({
          prompt: `Write as a decimal: <b>${w ? `${w} whole${w > 1 ? 's' : ''}, ` : ''}${t} tenth${t > 1 ? 's' : ''} and ${h} hundredth${h > 1 ? 's' : ''}</b>`,
          answer: n.toFixed(2),
          wrong: [(w + h / 10 + t / 100).toFixed(2), (w * 100 + t * 10 + h).toString(), (w + t / 10 + h / 1000).toFixed(3), (w + t + h / 10).toFixed(1)],
          explain: `Tenths go in the first place after the point and hundredths in the second: ${n.toFixed(2)}.`
        });
      }
      default: {
        const d = pick([10, 100]), n = d === 10 ? rnd(1, 9) : rnd(11, 99);
        return make({
          prompt: `Write the fraction as a decimal.<div class="big">${frac(n, d)}</div>`,
          answer: n / d, step: d === 10 ? 0.1 : 0.01,
          wrong: [n, n / (d * 10), n / (d / 10) <= 9.9 ? n / (d / 10) : n / d + 1],
          explain: `${frac(n, d)} means ${n} ${d === 10 ? 'tenth' : 'hundredth'}${n > 1 ? 's' : ''}, which is ${fmt(n / d)}.`
        });
      }
    }
  }

  function fractions() {
    switch (rnd(1, 4)) {
      case 1: {
        let n, d;
        do { d = rnd(2, 6); n = rnd(1, d - 1); } while (K.gcd(n, d) !== 1);
        const k = rnd(2, 5);
        return make({
          prompt: `Find the missing number.<div class="big">${frac(n, d)} = ${frac('?', d * k)}</div>`,
          answer: n * k,
          wrong: [n + d * k - d, n * k + 1, n * k - 1, d * k - n * k],
          explain: `The bottom number was multiplied by ${k} (${d} × ${k} = ${d * k}). Do the same to the top: ${n} × ${k} = ${n * k}.`
        });
      }
      case 2: {
        const d = pick([3, 4, 5, 6, 8, 10]), n = rnd(2, d - 1), q = rnd(2, 12), total = d * q;
        const unit = pick([['cm of ribbon', 'cm'], ['children in a class', ''], ['euros', '€'], ['sweets', '']]);
        return make({
          prompt: `What is ${frac(n, d)} of ${unit[1] === '€' ? '€' + total : total + ' ' + unit[0]}?`,
          answer: n * q, unit: unit[1] || undefined,
          wrong: [q, total - n * q, n * q + q, n * q - 1],
          explain: `First find ${frac(1, d)}: ${total} ÷ ${d} = ${q}. Then take ${n} of those parts: ${n} × ${q} = ${n * q}.`
        });
      }
      case 3: {
        const d = rnd(5, 12);
        let a, b;
        do { a = rnd(1, d - 1); b = rnd(1, d - 1); } while (a === b);
        return make({
          prompt: `Which fraction is <b>bigger</b>?`,
          answer: frac(Math.max(a, b), d),
          wrong: [frac(Math.min(a, b), d), 'They are equal'],
          order: [frac(a, d), frac(b, d), 'They are equal'],
          explain: `Both are cut into ${d} equal parts, so the one with more parts is bigger: ${Math.max(a, b)} > ${Math.min(a, b)}.`
        });
      }
      default: {
        const k = rnd(2, 6);
        const others = K.shuffle([[1, 3], [2, 3], [3, 4], [1, 4], [2, 5], [3, 5], [3, 8], [5, 8], [4, 7]]).slice(0, 3).map(([n, d]) => {
          const m = rnd(1, 3);
          return frac(n * m, d * m);
        });
        return make({
          prompt: `Which fraction is <b>equal to</b> ${frac(1, 2)}?`,
          answer: frac(k, 2 * k),
          wrong: others,
          explain: `${frac(k, 2 * k)}: the top is half of the bottom (${k} is half of ${2 * k}), so it is the same as ${frac(1, 2)}.`
        });
      }
    }
  }

  const CONV = [
    { from: 'km', to: 'm', f: 1000 },
    { from: 'm', to: 'cm', f: 100 },
    { from: 'cm', to: 'mm', f: 10 },
    { from: 'kg', to: 'g', f: 1000 },
    { from: 'l', to: 'ml', f: 1000 }
  ];
  function measures() {
    const c = pick(CONV);
    // A decimal number of the big unit, e.g. 2.5 km or 1.75 m.
    const tenths = c.f === 10 ? rnd(11, 99) : rnd(1, 99);
    const bigVal = c.f === 10 ? tenths / 10 : chance(0.5) ? tenths / 10 : rnd(101, 999) / 100;
    const small = Math.round(bigVal * c.f);
    if (chance(0.5)) {
      return make({
        prompt: `<div class="big">${fmt(bigVal)} ${c.from} = <span class="blank">?</span> ${c.to}</div>`,
        answer: small, unit: c.to,
        wrong: [small * 10, small / 10, Math.round(bigVal * 100)],
        explain: `1 ${c.from} = ${fmt(c.f)} ${c.to}. Multiply by ${fmt(c.f)}: ${fmt(bigVal)} × ${fmt(c.f)} = ${fmt(small)} ${c.to}.`
      });
    }
    return make({
      prompt: `<div class="big">${fmt(small)} ${c.to} = <span class="blank">?</span> ${c.from}</div>`,
      answer: bigVal, unit: c.from, step: 0.1,
      wrong: [bigVal * 10, bigVal / 10, small / 100 !== bigVal ? small / 100 : small / 10000],
      explain: `1 ${c.from} = ${fmt(c.f)} ${c.to}. Divide by ${fmt(c.f)}: ${fmt(small)} ÷ ${fmt(c.f)} = ${fmt(bigVal)} ${c.from}.`
    });
  }

  function perimeterArea() {
    const square = chance(0.3);
    const w = rnd(2, 12);
    let h = w;
    if (!square) do h = rnd(2, 10); while (h === w);
    const P = 2 * (w + h), A = w * h, name = square ? 'square' : 'rectangle';
    switch (rnd(1, 3)) {
      case 1:
        return make({
          prompt: `What is the <b>perimeter</b> of this ${name}?`,
          visual: K.rect(w, h),
          answer: P, unit: 'cm',
          wrong: [A, w + h, P + 2, P - 2],
          explain: `Perimeter is the distance all the way round: ${w} + ${h} + ${w} + ${h} = ${P} cm.`
        });
      case 2:
        return make({
          prompt: `What is the <b>area</b> of this ${name}?`,
          visual: K.rect(w, h),
          answer: A, unit: 'cm²',
          wrong: [P, w + h, A + w, A - h],
          explain: `Area is how many 1 cm squares fit inside: ${w} × ${h} = ${A} cm².`
        });
      default:
        if (square) {
          return make({
            prompt: `A square has a perimeter of ${4 * w} cm. How long is one side?`,
            answer: w, unit: 'cm',
            wrong: [2 * w, 4 * w, w + 1, w - 1],
            explain: `A square has 4 equal sides: ${4 * w} ÷ 4 = ${w} cm.`
          });
        }
        return make({
          prompt: `A rectangle has an area of ${A} cm². One side is ${w} cm. How long is the other side?`,
          answer: h, unit: 'cm',
          wrong: [A - w, h + 1, h - 1, 2 * h],
          explain: `Area = side × side, so the missing side is ${A} ÷ ${w} = ${h} cm.`
        });
    }
  }

  const KINDS = ['Acute', 'Right', 'Obtuse', 'Straight'];
  function angles() {
    switch (rnd(1, 3)) {
      case 1: {
        const kind = pick(KINDS);
        const deg = kind === 'Acute' ? 5 * rnd(3, 16) : kind === 'Right' ? 90 : kind === 'Obtuse' ? 5 * rnd(20, 34) : 180;
        return make({
          prompt: `What kind of angle is this? It measures <b>${deg}°</b>.`,
          visual: K.angle(deg),
          answer: kind,
          wrong: KINDS,
          order: KINDS,
          explain: 'Acute angles are smaller than 90°. A right angle is exactly 90°. Obtuse angles are between 90° and 180°. A straight angle is 180°. ' + `So ${deg}° is ${kind.toLowerCase()}.`
        });
      }
      case 2: {
        const a = 5 * rnd(6, 20), b = 5 * rnd(6, 34 - a / 5);
        const c = 180 - a - b;
        return make({
          prompt: `Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`,
          answer: c, unit: '°', step: 5,
          wrong: [360 - a - b, 90 - (a + b) / 2 > 0 ? 90 - (a + b) / 2 : c + 10, c + 10],
          explain: `The angles of a triangle always add up to 180°. ${a} + ${b} = ${a + b}, and 180 − ${a + b} = ${c}°.`
        });
      }
      default: {
        const a = 5 * rnd(4, 32);
        return make({
          prompt: `Two angles sit together on a <b>straight line</b>. One is ${a}°. What is the other?`,
          answer: 180 - a, unit: '°', step: 5,
          wrong: [360 - a, Math.abs(90 - a), 180 - a + 10],
          explain: `Angles on a straight line add up to 180°: 180 − ${a} = ${180 - a}°.`
        });
      }
    }
  }

  function words() {
    const name = K.name();
    switch (rnd(1, 4)) {
      case 1: {
        const n = rnd(2, 6), p = pick([1.5, 2.5, 3.25, 1.2, 4.5, 0.75]);
        const pay = Math.floor(n * p / 5) * 5 + 5 * rnd(1, 2);
        const cost = n * p;
        return make({
          prompt: `${name} buys ${n} notebooks at ${K.euro(p)} each and pays with ${K.euro(pay)}. How much change does ${name} get?`,
          answer: pay - cost, unit: '€', step: 0.5,
          wrong: [cost, pay - p, pay - cost + 1],
          explain: `The notebooks cost ${n} × ${K.euro(p)} = ${K.euro(cost)}. Change: ${K.euro(pay)} − ${K.euro(cost)} = ${K.euro(pay - cost)}.`
        });
      }
      case 2: {
        const lap = pick([200, 250, 400, 500]), laps = rnd(3, 9);
        return make({
          prompt: `${name} runs ${laps} laps of a ${lap} m track. How many kilometres is that?`,
          answer: lap * laps / 1000, unit: 'km', step: 0.1,
          wrong: [lap * laps / 100, lap * laps / 10000, laps + lap / 1000],
          explain: `${laps} × ${lap} m = ${fmt(lap * laps)} m. 1 km = 1,000 m, so that is ${fmt(lap * laps / 1000)} km.`
        });
      }
      case 3: {
        const pages = rnd(120, 480), per = rnd(12, 30), days = Math.floor(pages / per);
        return make({
          prompt: `A book has ${pages} pages. ${name} reads ${per} pages every day. How many pages are left after ${Math.min(days, 7)} days?`,
          answer: pages - per * Math.min(days, 7),
          wrong: [per * Math.min(days, 7), pages - per, pages - per * Math.min(days, 7) + per],
          explain: `In ${Math.min(days, 7)} days ${name} reads ${Math.min(days, 7)} × ${per} = ${per * Math.min(days, 7)} pages. Left: ${pages} − ${per * Math.min(days, 7)} = ${pages - per * Math.min(days, 7)}.`
        });
      }
      default: {
        const kids = rnd(18, 28), each = pick([3, 4, 5, 6]), box = pick([10, 12, 20]);
        const need = Math.ceil(kids * each / box);
        return make({
          prompt: `A class of ${kids} children each needs ${each} crayons. Crayons come in boxes of ${box}. How many boxes does the teacher need to buy?`,
          answer: need,
          wrong: [Math.floor(kids * each / box) === need ? need + 1 : Math.floor(kids * each / box), kids * each, need + 2],
          explain: `Crayons needed: ${kids} × ${each} = ${kids * each}. ${kids * each} ÷ ${box} = ${Math.floor(kids * each / box)}${kids * each % box ? ` remainder ${kids * each % box}, so one more box is needed: ${need}` : ''} boxes.`
        });
      }
    }
  }

  window.MATH_LEVELS.push({
    id: 'L3',
    age: '9–10',
    grade: 'Italian 4th grade',
    gradeIt: 'classe quarta',
    title: 'Problem solvers',
    blurb: 'Big numbers, two-digit multiplication, decimals, fractions, perimeter, area and angles.',
    topics: [
      { id: 'numbers', icon: '10k', title: 'Big numbers', blurb: 'Up to 999,999: place value and rounding', gen: bigNumbers },
      { id: 'mult', icon: '×', title: 'Long multiplication', blurb: 'Multiplying by two-digit numbers', gen: multiply },
      { id: 'div', icon: '÷', title: 'Division', blurb: 'Bigger numbers, two-digit divisors', gen: divide },
      { id: 'decimals', icon: '0.5', title: 'Decimals', blurb: 'Tenths and hundredths', gen: decimals },
      { id: 'fractions', icon: '¾', title: 'Fractions', blurb: 'Equivalent fractions, fractions of amounts', gen: fractions },
      { id: 'measures', icon: 'km', title: 'Converting measures', blurb: 'km, m, cm, mm, kg, g, l, ml', gen: measures },
      { id: 'area', icon: '▭', title: 'Perimeter and area', blurb: 'Rectangles and squares', gen: perimeterArea },
      { id: 'angles', icon: '∠', title: 'Angles', blurb: 'Kinds of angles, angles in a triangle', gen: angles },
      { id: 'words', icon: '?', title: 'Word problems', blurb: 'Money, distance and planning', gen: words }
    ]
  });
})();
