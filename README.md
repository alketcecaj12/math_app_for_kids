<div align="center">

# ➕ Math Trainer

### Math practice for children aged 7 to 11, one school year ahead, following the Italian primary-school curriculum

### 👉 [**Open the app**](https://alketcecaj12.github.io/math_app_for_kids/) 👈

*Free, no sign-up, works on phone, tablet and desktop.*

</div>

---

## 👋 What is it?

Math Trainer is a browser app for children. You pick a level and a topic, then answer a round of 10 questions. You get feedback and an explanation straight after each answer, and the results screen goes back over your mistakes at the end.

The questions are made up fresh each time, so the app never runs out of exercises. The interface is in English.

## 🎯 Levels

The four levels follow the Italian *Indicazioni Nazionali* for *scuola primaria*, which runs a little ahead of the Danish *Fælles Mål* at the same ages.

| Level | Age | Italian grade | Topics |
|---|---|---|---|
| Little explorers | 7–8 | 2nd (*classe seconda*) | Numbers to 100, column addition with carrying, column subtraction with borrowing, the 2, 3, 4, 5 and 10 times tables, doubles and halves, euros and cents, shapes, word problems |
| Number builders | 8–9 | 3rd (*classe terza*) | Numbers to 1,000 and rounding, three-digit column sums, all the times tables, multiplying by one digit, division with remainders, first fractions, measures and time, two-step word problems |
| Problem solvers | 9–10 | 4th (*classe quarta*) | Numbers to 999,999, long multiplication, division by one and two digits, decimals, equivalent fractions, converting measures, perimeter and area, angles, money and distance problems |
| Math masters | 10–11 | 5th (*classe quinta*) | Millions and powers, decimal operations, adding, subtracting and simplifying fractions, percentages, primes and multiples, area of triangles, parallelograms and trapezoids, mean, median, mode and chance, negative numbers |

Every level also has a **Mixed practice** round that draws on all of its topics.

## ⭐ Progress

- Each round gives 0 to 3 stars (5, 7 and 9 correct answers out of 10).
- The best score for each topic, and the best streak, are saved in the browser's local storage, so progress stays on that device.

## 🛠 Technology

Plain HTML, CSS and JavaScript, with no build step and no dependencies. Only the Nunito font comes from Google Fonts.

```
dist/
  index.html
  css/styles.css
  js/core.js      shared helpers: random numbers, formatting, pictures, answer options
  js/level1.js    ages 7–8
  js/level2.js    ages 8–9
  js/level3.js    ages 9–10
  js/level4.js    ages 10–11
  js/app.js       screens, rounds and saved progress
```

To add a topic, write a generator function in one of the `levelN.js` files. The function should return `MathKit.make({ prompt, answer, wrong, explain })`, and you add it to that level's `topics` list. Numeric answers are topped up to four options automatically.

## 🚀 Run and deploy

- **Run locally:** open `dist/index.html` in a browser.
- **Deploy:** push to `main`. The workflow in `.github/workflows/deploy.yml` publishes the `dist` folder to GitHub Pages. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions** once.
# math_app_for_kids
