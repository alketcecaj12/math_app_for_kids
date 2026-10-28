/* Level 4 — ages 10–11, Italian classe quinta (5th grade of scuola primaria).
   Millions and powers, operations with decimals, adding and simplifying
   fractions, percentages, primes and multiples, area of triangles and
   trapezoids, averages and chance, negative numbers. */

(function () {
  const K = window.MathKit;
  const { rnd, pick, make, fmt, chance, frac } = K;

  function powers() {
    switch (rnd(1, 4)) {
      case 1: {
        const b = rnd(2, 10), e = b <= 3 ? rnd(2, 5) : b <= 5 ? rnd(2, 4) : rnd(2, 3);
        const v = b ** e;
        return make({
          prompt: `<div class="big">${b}<sup>${e}</sup> = <span class="blank">?</span></div>`,
          answer: v,
          wrong: [b * e, b ** (e - 1), v + b, e ** b <= 100000 ? e ** b : v * b],
          explain: `${b}<sup>${e}</sup> means ${e} ${b}s multiplied together: ${Array(e).fill(b).join(' × ')} = ${fmt(v)}. It is not ${b} × ${e}.`
        });
      }
      case 2: {
        const e = rnd(2, 7);
        return make({
          prompt: `Write ${fmt(10 ** e)} as a power of 10.`,
          answer: `10<sup>${e}</sup>`,
          wrong: [`10<sup>${e + 1}</sup>`, `10<sup>${e - 1}</sup>`, `${e}<sup>10</sup>`, `10 × ${e}`],
          explain: `${fmt(10 ** e)} has ${e} zeros, so it is 10 multiplied by itself ${e} times: 10<sup>${e}</sup>.`
        });
      }
      case 3:
        return K.placeValueQ(1234567, 987654321);
      default: {
        const place = pick([100000, 1000000]);
        let n;
        do n = rnd(1000001, 99999999); while (n % place === 0);
        return K.roundQ(n, place);
      }
    }
  }

  function decimals() {
    switch (rnd(1, 4)) {
      case 1: {
        const z = pick([10, 100, 1000]), x = rnd(101, 9999) / 100, times = chance(0.5);
        const r = times ? x * z : x / z;
        const zeros = Math.log10(z);
        return make({
          prompt: `<div class="big">${fmt(x)} ${times ? '×' : '÷'} ${fmt(z)} = <span class="blank">?</span></div>`,
          answer: K.round(r),
          wrong: [times ? x * z * 10 : x / z / 10, times ? x * z / 10 : x / z * 10, times ? x / z : x * z],
          explain: `${times ? 'Multiplying' : 'Dividing'} by ${fmt(z)} moves the digits ${zeros} place${zeros > 1 ? 's' : ''} to the ${times ? 'left (the number gets bigger)' : 'right (the number gets smaller)'}: ${fmt(x)} ${times ? '×' : '÷'} ${fmt(z)} = ${fmt(r)}.`
        });
      }
      case 2: {
        const a = rnd(11, 99), w = rnd(2, 9), A = a / 10;
        return make({
          prompt: `<div class="big">${fmt(A)} × ${w} = <span class="blank">?</span></div>`,
          answer: (a * w) / 10, step: 0.1,
          wrong: [a * w, (a * w) / 100, Math.floor(A) * w + (a % 10) * w / 100],
          explain: `Ignore the point first: ${a} × ${w} = ${a * w}. ${fmt(A)} has one decimal place, so the answer has one too: ${fmt((a * w) / 10)}.`
        });
      }
      case 3: {
        const W = pick([5, 10, 20]), b = rnd(105, W * 100 - 50);
        return make({
          prompt: `<div class="big">${W} − ${(b / 100).toFixed(2)} = <span class="blank">?</span></div>`,
          answer: (W * 100 - b) / 100, step: 0.1,
          wrong: [(W * 100 - b) / 100 + 1, K.swapSub(W * 100, b) / 100, (W * 100 - b) / 10],
          explain: `Write ${W} as ${W}.00 and subtract in hundredths: ${W * 100} − ${b} = ${W * 100 - b}, so the answer is ${((W * 100 - b) / 100).toFixed(2)}.`
        });
      }
      default: {
        const w = rnd(2, 9), r = rnd(11, 99), A = (r * w) / 10;
        return make({
          prompt: `<div class="big">${fmt(A)} ÷ ${w} = <span class="blank">?</span></div>`,
          answer: r / 10, step: 0.1,
          wrong: [r, r / 100, r / 10 + 1],
          explain: `Think in tenths: ${fmt(A)} is ${r * w} tenths. ${r * w} ÷ ${w} = ${r} tenths = ${fmt(r / 10)}. Check: ${fmt(r / 10)} × ${w} = ${fmt(A)}.`
        });
      }
    }
  }

  // Fractions as HTML, never offering a wrong option equal in value to the answer.
  function fracOptions(answer, candidates) {
    const val = answer[0] / answer[1];
    return candidates.filter(([n, d]) => d > 0 && n > 0 && Math.abs(n / d - val) > 1e-9).map(([n, d]) => K.mixed(n, d));
  }

  function fractions() {
    const PAIRS = [[2, 4], [2, 6], [3, 6], [4, 8], [2, 8], [3, 9], [5, 10], [2, 10], [2, 3], [3, 4], [4, 6], [3, 5]];
    switch (rnd(1, 4)) {
      case 1:
      case 2: {
        const [d1, d2] = K.shuffle(pick(PAIRS));
        const add = chance(0.6);
        const n1 = rnd(1, d1 - 1), n2 = rnd(1, d2 - 1);
        const L = K.lcm(d1, d2);
        const a = n1 * (L / d1), b = n2 * (L / d2);
        if (!add && a <= b) return fractions();
        const top = add ? a + b : a - b;
        const [sn, sd] = K.simplify(top, L);
        const op = add ? '+' : '−';
        const same = d1 === d2;
        return make({
          prompt: `<div class="big">${frac(n1, d1)} ${op} ${frac(n2, d2)} = <span class="blank">?</span></div>`,
          answer: K.mixed(sn, sd),
          wrong: fracOptions([sn, sd], [[add ? n1 + n2 : Math.abs(n1 - n2), d1 + d2], [top, L + 1], [add ? n1 + n2 : Math.abs(n1 - n2), L], [sn + 1, sd], [sn, sd + 1], [add ? top + 1 : top + 2, L]]),
          explain: `${same ? '' : `First give both fractions the same bottom number, ${L}: ${frac(n1, d1)} = ${frac(a, L)} and ${frac(n2, d2)} = ${frac(b, L)}. `}Now ${add ? 'add' : 'subtract'} the tops: ${a} ${op} ${b} = ${top}, so ${frac(top, L)}${sn !== top ? `, which simplifies to ${K.mixed(sn, sd)}` : ''}${sn === top && sn > sd ? ` = ${K.mixed(sn, sd)}` : ''}. Never add the bottom numbers!`
        });
      }
      case 3: {
        let n, d;
        do { d = rnd(3, 10); n = rnd(1, d - 1); } while (K.gcd(n, d) !== 1);
        const k = rnd(2, 6);
        return make({
          prompt: `Simplify this fraction as much as possible.<div class="big">${frac(n * k, d * k)}</div>`,
          answer: frac(n, d),
          wrong: fracOptions([n, d], [[n + 1, d], [n, d + 1], [d, n], [n * k - 1, d * k], [n + k, d + k], [n * 2, d * 3]]).filter(s => s),
          explain: `Divide the top and bottom by ${k}: ${n * k} ÷ ${k} = ${n} and ${d * k} ÷ ${k} = ${d}. So ${frac(n * k, d * k)} = ${frac(n, d)}.`
        });
      }
      default: {
        const d = rnd(2, 8), w = rnd(1, 5), r = rnd(1, d - 1);
        const imp = w * d + r;
        return make({
          prompt: `Write as an improper fraction.<div class="big">${w}&thinsp;${frac(r, d)}</div>`,
          answer: frac(imp, d),
          wrong: [frac(w + r, d), frac(w * r + d, d), frac(imp, w * d), frac(w * d, r)],
          explain: `${w} whole${w > 1 ? 's' : ''} = ${frac(w * d, d)}. Add ${frac(r, d)}: ${w * d} + ${r} = ${imp}, so ${frac(imp, d)}.`
        });
      }
    }
  }

  function percentOf() {
    const p = pick([10, 20, 30, 40, 25, 75, 50, 5]);
    let N;
    if (p % 10 === 0 && p !== 50) N = 10 * rnd(2, 30);
    else if (p === 25 || p === 75) N = 4 * rnd(3, 40);
    else if (p === 50) N = 2 * rnd(5, 100);
    else N = 20 * rnd(1, 20);
    const ans = (p * N) / 100;
    let how;
    if (p === 50) how = `50% is half: ${N} ÷ 2 = ${ans}.`;
    else if (p === 25) how = `25% is a quarter: ${N} ÷ 4 = ${ans}.`;
    else if (p === 75) how = `75% is three quarters: ${N} ÷ 4 = ${N / 4}, and 3 × ${N / 4} = ${ans}.`;
    else if (p === 5) how = `10% of ${N} is ${N / 10}, and 5% is half of that: ${ans}.`;
    else how = `10% of ${N} is ${N} ÷ 10 = ${N / 10}. ${p}% is ${p / 10} × ${N / 10} = ${ans}.`;
    return { p, N, ans, how };
  }

  function percent() {
    switch (rnd(1, 3)) {
      case 1: {
        const { p, N, ans, how } = percentOf();
        return make({
          prompt: `What is <b>${p}%</b> of ${N}?`,
          answer: ans,
          wrong: [N - ans, p, ans * 10, ans + N / 10],
          explain: `“Percent” means out of 100. ${how}`
        });
      }
      case 2: {
        const { p, N, ans, how } = percentOf();
        const item = pick(['bike helmet', 'football', 'jacket', 'board game', 'pair of trainers']);
        return make({
          prompt: `A ${item} costs €${N}. In the sale it is <b>${p}% off</b>. What is the sale price?`,
          answer: N - ans, unit: '€',
          wrong: [ans, N - p, N + ans, N - ans - N / 10],
          explain: `First find the discount. ${how} Then take it off: €${N} − €${ans} = €${N - ans}.`
        });
      }
      default: {
        const [shown, pc, why] = pick([
          [frac(1, 2), 50, 'half of 100 is 50'],
          [frac(1, 4), 25, '100 ÷ 4 = 25'],
          [frac(3, 4), 75, '3 × 25 = 75'],
          [frac(1, 5), 20, '100 ÷ 5 = 20'],
          [frac(2, 5), 40, '2 × 20 = 40'],
          [frac(1, 10), 10, '100 ÷ 10 = 10'],
          [frac(7, 10), 70, '7 × 10 = 70'],
          [frac(3, 20), 15, '3 × 5 = 15'],
          ['0.35', 35, '0.35 is 35 hundredths'],
          ['0.6', 60, '0.6 is 6 tenths, which is 60 hundredths'],
          ['0.08', 8, '0.08 is 8 hundredths']
        ]);
        return make({
          prompt: `Write as a percentage.<div class="big">${shown}</div>`,
          answer: pc, unit: '%', step: 5,
          wrong: [pc === 8 ? 80 : pc / 10 >= 1 ? pc / 10 : pc + 5, 100 - pc, pc + 10],
          explain: `A percentage is a number out of 100: ${why}, so it is ${pc}%.`
        });
      }
    }
  }

  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const smallestFactor = n => {
    for (let f = 2; f * f <= n; f++) if (n % f === 0) return f;
    return n;
  };
  function divisibility() {
    switch (rnd(1, 4)) {
      case 1: {
        const p = pick(PRIMES.slice(4));
        const fakes = K.shuffle([1, 9, 15, 21, 25, 27, 33, 35, 39, 49, 51, 57, 63, 77, 81, 87, 91]).slice(0, 3);
        const why = fakes.map(n => (n === 1 ? '1 has only one factor' : `${n} = ${smallestFactor(n)} × ${n / smallestFactor(n)}`)).join(', ');
        return make({
          prompt: 'Which number is <b>prime</b>?',
          answer: p,
          wrong: fakes,
          explain: `A prime number can only be divided exactly by 1 and itself. ${p} is prime. The others are not: ${why}.`
        });
      }
      case 2: {
        const k = rnd(3, 9), m = rnd(3, 12), c = k * m;
        const fakes = [c + 1, c - 1, c + 2, c - 2, c + k + 1].filter(n => n % k !== 0);
        return make({
          prompt: `Which number is a <b>multiple of ${k}</b>?`,
          answer: c,
          wrong: K.shuffle(fakes),
          explain: `${c} = ${k} × ${m}, so it is in the ${k} times table.`
        });
      }
      case 3: {
        const n = pick([24, 36, 48, 60, 72, 84, 90, 96]);
        const factors = [];
        for (let f = 3; f < n; f++) if (n % f === 0) factors.push(f);
        const f = pick(factors.filter(x => x <= 20));
        const fakes = K.shuffle([5, 7, 9, 10, 11, 13, 14, 15, 16, 18].filter(x => n % x !== 0));
        return make({
          prompt: `Which number is a <b>factor</b> of ${n}?`,
          answer: f,
          wrong: fakes,
          explain: `A factor divides a number exactly. ${n} ÷ ${f} = ${n / f}, with nothing left over.`
        });
      }
      default: {
        const [a, b] = pick([[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [6, 10], [9, 12], [10, 15], [3, 4], [5, 6]]);
        const L = K.lcm(a, b);
        const list = n => Array.from({ length: Math.ceil(L / n) }, (_, i) => n * (i + 1)).join(', ');
        return make({
          prompt: `What is the <b>smallest common multiple</b> of ${a} and ${b}?`,
          answer: L,
          wrong: [a * b, a + b, L * 2, L / 2],
          explain: `Multiples of ${a}: ${list(a)}. Multiples of ${b}: ${list(b)}. The first one in both lists is ${L}.`
        });
      }
    }
  }

  function area() {
    switch (rnd(1, 3)) {
      case 1: {
        let b, h;
        do { b = rnd(3, 16); h = rnd(2, 12); } while ((b * h) % 2);
        return make({
          prompt: 'What is the <b>area</b> of this triangle?',
          visual: K.poly('triangle', b, h),
          answer: (b * h) / 2, unit: 'cm²',
          wrong: [b * h, b + h, (b * h) / 2 + b],
          explain: `Area of a triangle = base × height ÷ 2: ${b} × ${h} = ${b * h}, and ${b * h} ÷ 2 = ${(b * h) / 2} cm². A triangle is half of a rectangle.`
        });
      }
      case 2: {
        const b = rnd(4, 15), h = rnd(2, 10);
        return make({
          prompt: 'What is the <b>area</b> of this parallelogram?',
          visual: K.poly('parallelogram', b, h),
          answer: b * h, unit: 'cm²',
          wrong: [(b * h) / 2, 2 * (b + h), b * h + h],
          explain: `Area of a parallelogram = base × height: ${b} × ${h} = ${b * h} cm². Cut off the slanted end and move it across, and you get a rectangle.`
        });
      }
      default: {
        let B, t, h;
        do { B = rnd(6, 16); t = rnd(2, B - 2); h = rnd(2, 10); } while (((B + t) * h) % 2);
        const A = ((B + t) * h) / 2;
        return make({
          prompt: 'What is the <b>area</b> of this trapezoid?',
          visual: K.poly('trapezoid', B, h, t),
          answer: A, unit: 'cm²',
          wrong: [(B + t) * h, B * h, t * h, A + h],
          explain: `Area of a trapezoid = (long base + short base) × height ÷ 2: (${B} + ${t}) × ${h} ÷ 2 = ${B + t} × ${h} ÷ 2 = ${A} cm².`
        });
      }
    }
  }

  function stats() {
    switch (rnd(1, 4)) {
      case 1: {
        const n = rnd(3, 5), mean = rnd(4, 20);
        let vals;
        do {
          vals = Array.from({ length: n - 1 }, () => mean + rnd(-4, 4));
          vals.push(mean * n - vals.reduce((s, v) => s + v, 0));
        } while (vals.some(v => v < 0) || new Set(vals).size === 1);
        const sum = mean * n;
        return make({
          prompt: `What is the <b>mean</b> (average)?<div class="big">${vals.join(', ')}</div>`,
          answer: mean,
          wrong: [sum, Math.max(...vals), mean + 1, mean - 1],
          explain: `Add them up: ${vals.join(' + ')} = ${sum}. Divide by how many there are (${n}): ${sum} ÷ ${n} = ${mean}.`
        });
      }
      case 2: {
        const mode = rnd(1, 12);
        const others = K.shuffle([...Array(15).keys()].map(x => x + 1).filter(x => x !== mode)).slice(0, 4);
        const vals = K.shuffle([mode, mode, mode, others[0], others[0], others[1], others[2]]);
        return make({
          prompt: `What is the <b>mode</b>?<div class="big">${vals.join(', ')}</div>`,
          answer: mode,
          wrong: [others[0], others[1], Math.max(...vals)],
          explain: `The mode is the number that appears most often. ${mode} appears 3 times, more than any other number.`
        });
      }
      case 3: {
        const n = pick([5, 7]);
        const vals = K.shuffle([...Array(30).keys()].map(x => x + 1)).slice(0, n);
        const sorted = vals.slice().sort((a, b) => a - b);
        const med = sorted[(n - 1) / 2];
        return make({
          prompt: `What is the <b>median</b>?<div class="big">${vals.join(', ')}</div>`,
          answer: med,
          wrong: [vals[(n - 1) / 2], sorted[(n - 1) / 2 + 1], Math.round(vals.reduce((s, v) => s + v, 0) / n)],
          explain: `Put them in order: ${sorted.join(', ')}. The median is the middle one: ${med}.`
        });
      }
      default: {
        const r = rnd(1, 6), b = rnd(1, 6), g = rnd(0, 4), total = r + b + g;
        const colour = pick(['red', 'blue']);
        const c = colour === 'red' ? r : b;
        const val = c / total;
        const cands = [[c, total - c], [total - c, total], [1, total], [c, total + 1], [c + 1, total]]
          .filter(([n, d]) => n > 0 && d > 0 && Math.abs(n / d - val) > 1e-9)
          .map(([n, d]) => frac(n, d));
        const [sn, sd] = K.simplify(c, total);
        return make({
          prompt: `A bag has ${r} red, ${b} blue${g ? ` and ${g} green` : ''} marbles. You pick one without looking. What is the chance it is <b>${colour}</b>?`,
          answer: frac(c, total),
          wrong: cands,
          explain: `There are ${total} marbles and ${c} of them are ${colour}, so the chance is ${c} out of ${total}: ${frac(c, total)}${sn !== c ? ` (which simplifies to ${frac(sn, sd)})` : ''}.`
        });
      }
    }
  }

  function negatives() {
    switch (rnd(1, 3)) {
      case 1: {
        const t = rnd(-10, 6), c = rnd(2, 12), warmer = chance(0.5);
        const r = warmer ? t + c : t - c;
        return make({
          prompt: `In the morning it is ${fmt(t)}°C. By the evening it is ${c} degrees ${warmer ? 'warmer' : 'colder'}. What is the temperature now?`,
          answer: r, unit: '°C', min: -40,
          wrong: [warmer ? t - c : t + c, -r, r + 1, r - 1],
          explain: `${warmer ? 'Warmer means count up' : 'Colder means count down'} ${c} steps from ${fmt(t)}: ${fmt(t)} ${warmer ? '+' : '−'} ${c} = ${fmt(r)}°C.${t < 0 && r > 0 ? ' You pass 0 on the way.' : ''}`
        });
      }
      case 2: {
        const lo = rnd(-12, -1), hi = rnd(1, 12);
        return make({
          prompt: `How many degrees is it from <b>${fmt(lo)}°C</b> up to <b>${hi}°C</b>?`,
          answer: hi - lo, unit: '°',
          wrong: [hi + lo > 0 ? hi + lo : -(hi + lo) + 1, hi - lo - 1, hi - lo + 1],
          explain: `From ${fmt(lo)} up to 0 is ${-lo} degrees, and from 0 up to ${hi} is ${hi} more: ${-lo} + ${hi} = ${hi - lo}°.`
        });
      }
      default: {
        const nums = K.shuffle([-12, -9, -7, -5, -3, -2, -1, 0, 1, 2, 4, 6]).slice(0, 4);
        const lowest = chance(0.5);
        const ans = lowest ? Math.min(...nums) : Math.max(...nums);
        return make({
          prompt: `Which number is the <b>${lowest ? 'smallest' : 'largest'}</b>?`,
          answer: ans, min: -40,
          wrong: nums.filter(n => n !== ans),
          explain: `On a number line, numbers get smaller as you go left. ${lowest ? `${fmt(ans)} is furthest to the left, so it is the smallest. Remember: −9 is smaller than −2.` : `${fmt(ans)} is furthest to the right, so it is the largest.`}`
        });
      }
    }
  }

  window.MATH_LEVELS.push({
    id: 'L4',
    age: '10–11',
    grade: 'Italian 5th grade',
    gradeIt: 'classe quinta',
    title: 'Math masters',
    blurb: 'Millions and powers, decimals, fraction sums, percentages, primes, area, averages and negative numbers.',
    topics: [
      { id: 'powers', icon: 'x²', title: 'Millions and powers', blurb: 'Huge numbers, squares, powers of 10', gen: powers },
      { id: 'decimals', icon: '0.1', title: 'Working with decimals', blurb: 'Multiplying, dividing, subtracting', gen: decimals },
      { id: 'fractions', icon: '⅝', title: 'Fraction sums', blurb: 'Add, subtract and simplify', gen: fractions },
      { id: 'percent', icon: '%', title: 'Percentages', blurb: 'Percent of a number, sales', gen: percent },
      { id: 'primes', icon: '7', title: 'Primes and multiples', blurb: 'Factors, primes, common multiples', gen: divisibility },
      { id: 'area', icon: '◢', title: 'Area of shapes', blurb: 'Triangles, parallelograms, trapezoids', gen: area },
      { id: 'stats', icon: 'x̄', title: 'Averages and chance', blurb: 'Mean, mode, median, probability', gen: stats },
      { id: 'negatives', icon: '−5', title: 'Negative numbers', blurb: 'Temperatures and the number line', gen: negatives }
    ]
  });
})();
