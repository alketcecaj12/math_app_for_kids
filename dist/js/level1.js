/* Level 1 — ages 7–8, Italian classe seconda (2nd grade of scuola primaria).
   Numbers to 100, column addition and subtraction with carrying, the first
   times tables, doubles and halves, euros and cents, shapes. */

(function () {
  const K = window.MathKit;
  const { rnd, pick, make, fmt, chance } = K;

  function numbers() {
    const n = rnd(11, 99), t = Math.floor(n / 10), u = n % 10;
    switch (rnd(1, 5)) {
      case 1:
        return make({
          prompt: `How many <b>tens</b> are in this number?<div class="big">${n}</div>`,
          answer: t,
          wrong: [u, t * 10, t + 1, t - 1],
          explain: `${n} is ${t} tens and ${u} ones, so it has ${t} tens.`
        });
      case 2:
        return make({
          prompt: `What number has <b>${t} tens</b> and <b>${u} ones</b>?`,
          answer: n,
          wrong: [u * 10 + t, t + u, t * 100 + u, n + 10],
          explain: `${t} tens make ${t * 10}. Add ${u} ones and you get ${n}.`
        });
      case 3: {
        const after = chance(0.5);
        return make({
          prompt: `What number comes just <b>${after ? 'after' : 'before'}</b> ${n}?`,
          answer: after ? n + 1 : n - 1,
          wrong: [after ? n - 1 : n + 1, after ? n + 10 : n - 10, after ? n + 2 : n - 2],
          explain: after ? `Count on one: ${n}, ${n + 1}.` : `Count back one: ${n}, ${n - 1}.`
        });
      }
      case 4: {
        let m = u > 0 && u !== t ? u * 10 + t : rnd(11, 99);
        if (chance(0.15)) m = n;
        return K.compareQ(n, m);
      }
      default: {
        const step = pick([2, 5, 10]);
        const a = step * rnd(1, 5) + (step === 10 ? rnd(0, 9) : 0);
        const seq = [a, a + step, a + 2 * step];
        return make({
          prompt: `Count on in <b>${step}s</b>. What comes next?<div class="big">${seq.join(', ')}, <span class="blank">?</span></div>`,
          answer: a + 3 * step,
          wrong: [a + 3 * step + 1, a + 4 * step, a + 2 * step + 1],
          explain: `Each number is ${step} more than the one before: ${seq[2]} + ${step} = ${a + 3 * step}.`
        });
      }
    }
  }

  function twoDigits(carry) {
    const ua = rnd(1, 9);
    const ub = carry ? rnd(10 - ua, 9) : rnd(0, 9 - ua);
    const ta = rnd(1, carry ? 7 : 8);
    const tb = rnd(carry ? 1 : 0, (carry ? 8 : 9) - ta);
    return [ta * 10 + ua, tb * 10 + ub];
  }

  function addition() {
    const [a, b] = twoDigits(chance(0.7));
    if (chance(0.25)) {
      return make({
        prompt: `What is the missing number?<div class="big">${a} + <span class="blank">?</span> = ${a + b}</div>`,
        answer: b,
        wrong: [a + b + a, b + 10, b - 10, b + 1],
        explain: `Count up from ${a} to ${a + b}, or subtract: ${a + b} − ${a} = ${b}.`
      });
    }
    return make({
      prompt: `<div class="big">${a} + ${b} = <span class="blank">?</span></div>`,
      visual: K.column(a, b, '+'),
      answer: a + b,
      wrong: [K.noCarryAdd(a, b), a + b + 10, a + b - 1, a + b + 1],
      explain: K.explainAdd(a, b)
    });
  }

  function subtraction() {
    const borrow = chance(0.7);
    const ub = rnd(1, 9), ua = borrow ? rnd(0, ub - 1) : rnd(ub, 9);
    const tb = rnd(1, 7), ta = rnd(tb + (borrow ? 1 : 0), 9);
    const a = ta * 10 + ua, b = tb * 10 + ub;
    return make({
      prompt: `<div class="big">${a} − ${b} = <span class="blank">?</span></div>`,
      visual: K.column(a, b, '−'),
      answer: a - b,
      wrong: [K.swapSub(a, b), a - b + 10, a - b - 10, a - b + 1],
      explain: K.explainSub(a, b)
    });
  }

  function times() {
    const t = pick([2, 3, 4, 5, 10]), b = rnd(1, 10), p = t * b;
    const explain = t === 10
      ? `Multiplying by 10 is easy: ${b} × 10 = ${p}.`
      : `${t} × ${b} means ${t} groups of ${b}: ${Array(t).fill(b).join(' + ')} = ${p}.`;
    const wrong = [t * (b + 1), t * (b - 1), t + b, (t + 1) * b];
    if (chance(0.35) && t <= 5) {
      const thing = pick([['plates', 'biscuits'], ['boxes', 'pencils'], ['bags', 'apples'], ['vases', 'flowers']]);
      return make({
        prompt: `There are ${t} ${thing[0]} with ${b} ${thing[1]} in each. How many ${thing[1]} are there altogether?`,
        visual: p <= 40 ? K.dots(t, b) : '',
        answer: p, wrong, explain
      });
    }
    return make({
      prompt: `<div class="big">${t === 10 ? `${b} × 10` : `${t} × ${b}`} = <span class="blank">?</span></div>`,
      visual: t < 10 && p <= 40 ? K.dots(t, b) : '',
      answer: p, wrong, explain
    });
  }

  function doubles() {
    if (chance(0.5)) {
      const n = rnd(3, 50);
      return make({
        prompt: `What is <b>double</b> ${n}?`,
        answer: 2 * n,
        wrong: [n + 2, 2 * n + 1, 2 * n - 1, 2 * n + 10],
        explain: `Double means add the number to itself: ${n} + ${n} = ${2 * n}.`
      });
    }
    const h = rnd(2, 50), n = 2 * h;
    return make({
      prompt: `What is <b>half</b> of ${n}?`,
      answer: h,
      wrong: [n - 2, h + 1, h - 1, n * 2],
      explain: `Half means split into 2 equal parts. ${h} + ${h} = ${n}, so half of ${n} is ${h}.`
    });
  }

  function money() {
    switch (rnd(1, 3)) {
      case 1: {
        const p1 = 5 * rnd(2, 12), p2 = 5 * rnd(2, (100 - p1) / 5);
        const item = pick([['a pencil', 'a rubber'], ['an apple', 'a banana'], ['a sticker', 'a balloon'], ['a lolly', 'a bottle of water']]);
        return make({
          prompt: `${K.cap(item[0])} costs ${p1} cents and ${item[1]} costs ${p2} cents. How much do they cost together?`,
          answer: p1 + p2, unit: 'cents', step: 5,
          wrong: [p1 + p2 + 10, p1 + p2 - 10, Math.abs(p1 - p2)],
          explain: `${p1} + ${p2} = ${p1 + p2} cents.${p1 + p2 === 100 ? ' That is exactly 1 euro!' : ''}`
        });
      }
      case 2: {
        const p = 5 * rnd(3, 19);
        return make({
          prompt: `An ice lolly costs ${p} cents. You pay with a <b>1 euro</b> coin. How much change do you get?`,
          answer: 100 - p, unit: 'cents', step: 5,
          wrong: [p, 100 - p + 10, 100 - p - 10],
          explain: `1 euro is 100 cents. 100 − ${p} = ${100 - p} cents.`
        });
      }
      default: {
        const twos = rnd(1, 5), ones = rnd(0, 5), fifty = rnd(0, 1);
        const total = 2 * twos + ones;
        const coins = [`${twos} coin${twos > 1 ? 's' : ''} of €2`];
        if (ones) coins.push(`${ones} coin${ones > 1 ? 's' : ''} of €1`);
        if (fifty) {
          return make({
            prompt: `You have ${coins.join(', ')} and one 50-cent coin. How much money is that?`,
            answer: total + 0.5, unit: '€',
            wrong: [total, twos + ones + 0.5, total + 1.5, total + 1],
            explain: `${twos} × €2 = €${2 * twos}${ones ? `, plus €${ones}` : ''}, plus 50 cents makes ${K.euro(total + 0.5)}.`
          });
        }
        return make({
          prompt: `You have ${coins.join(' and ')}. How many euros is that?`,
          answer: total, unit: '€',
          wrong: [twos + ones, total + 2, total - 1, total + 1],
          explain: `${twos} × €2 = €${2 * twos}${ones ? `, plus €${ones} makes €${total}` : ''}.`
        });
      }
    }
  }

  const SHAPES = [['triangle', 3], ['square', 4], ['rectangle', 4], ['pentagon', 5], ['hexagon', 6], ['octagon', 8]];
  function shapes() {
    const [name, sides] = pick(SHAPES);
    switch (rnd(1, 3)) {
      case 1:
        return make({
          prompt: `How many <b>sides</b> does ${K.an(name)} have?`,
          answer: sides,
          wrong: [sides + 1, sides - 1, sides + 2],
          explain: `${K.cap(K.an(name))} has ${sides} straight sides.`
        });
      case 2:
        return make({
          prompt: `How many <b>corners</b> does ${K.an(name)} have?`,
          answer: sides,
          wrong: [sides + 1, sides - 1, sides * 2],
          explain: `A flat shape has as many corners as sides. ${K.cap(K.an(name))} has ${sides} sides, so it has ${sides} corners.`
        });
      default: {
        // Squares and rectangles both have 4 sides, so never offer both.
        const [target, n] = pick(SHAPES.filter(s => s[0] !== 'rectangle'));
        const others = SHAPES.filter(s => s[1] !== n).map(s => s[0]);
        return make({
          prompt: `Which shape has <b>${n}</b> sides?`,
          answer: K.cap(target),
          wrong: K.shuffle(others).map(K.cap),
          explain: `${K.cap(K.an(target))} has ${n} sides.`
        });
      }
    }
  }

  function words() {
    const name = K.name();
    switch (rnd(1, 5)) {
      case 1: {
        const [a, b] = twoDigits(chance(0.6));
        return make({
          prompt: `${name} has ${a} stickers and gets ${b} more. How many stickers does ${name} have now?`,
          answer: a + b,
          wrong: [K.noCarryAdd(a, b), a + b + 10, a - b > 0 ? a - b : a + b - 1],
          explain: `Getting more means add: ${a} + ${b} = ${a + b}.`
        });
      }
      case 2: {
        const a = rnd(30, 95), b = rnd(8, a - 10);
        return make({
          prompt: `There are ${a} birds in a tree. ${b} fly away. How many birds are left?`,
          answer: a - b,
          wrong: [a + b, K.swapSub(a, b), a - b + 10],
          explain: `Flying away means take away: ${a} − ${b} = ${a - b}.`
        });
      }
      case 3: {
        const t = pick([2, 3, 4, 5]), b = rnd(2, 10);
        return make({
          prompt: `A box holds ${b} crayons. How many crayons are in ${t} boxes?`,
          answer: t * b,
          wrong: [t + b, t * (b + 1), t * b - t],
          explain: `${t} boxes of ${b}: ${t} × ${b} = ${t * b}.`
        });
      }
      case 4: {
        const other = pick(K.names.filter(x => x !== name));
        const a = rnd(25, 90), b = rnd(10, a - 5);
        return make({
          prompt: `${name} has ${a} cards and ${other} has ${b} cards. How many <b>more</b> cards does ${name} have?`,
          answer: a - b,
          wrong: [a + b, a - b + 1, a - b - 10],
          explain: `To find how many more, subtract: ${a} − ${b} = ${a - b}.`
        });
      }
      default: {
        const h = rnd(3, 20);
        return make({
          prompt: `${2 * h} sweets are shared equally between 2 children. How many sweets does each child get?`,
          answer: h,
          wrong: [4 * h, h + 2, 2 * h - 2],
          explain: `Sharing between 2 means finding half: ${h} + ${h} = ${2 * h}, so each child gets ${h}.`
        });
      }
    }
  }

  window.MATH_LEVELS.push({
    id: 'L1',
    age: '7–8',
    grade: 'Italian 2nd grade',
    gradeIt: 'classe seconda',
    title: 'Little explorers',
    blurb: 'Numbers to 100, adding and subtracting with carrying, the first times tables, money and shapes.',
    topics: [
      { id: 'numbers', icon: '12', title: 'Numbers to 100', blurb: 'Tens and ones, before and after, counting on', gen: numbers },
      { id: 'add', icon: '+', title: 'Adding to 100', blurb: 'Column addition with carrying', gen: addition },
      { id: 'sub', icon: '−', title: 'Subtracting to 100', blurb: 'Column subtraction with borrowing', gen: subtraction },
      { id: 'times', icon: '×', title: 'Times tables 2, 3, 4, 5, 10', blurb: 'Multiplying as groups', gen: times },
      { id: 'doubles', icon: '2×', title: 'Doubles and halves', blurb: 'Double it, split it in two', gen: doubles },
      { id: 'money', icon: '€', title: 'Euros and cents', blurb: 'Paying, adding prices, change', gen: money },
      { id: 'shapes', icon: '▲', title: 'Shapes', blurb: 'Sides and corners of flat shapes', gen: shapes },
      { id: 'words', icon: '?', title: 'Word problems', blurb: 'Little stories with numbers', gen: words }
    ]
  });
})();
