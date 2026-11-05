// Answer check for practice problems (see exercise.lua)
(function () {
  "use strict";

  // An answer within 0.1 % of the result counts as correct, so rounding in
  // intermediate steps does not matter; an exercise can set tol="..." instead
  const RELATIVE_TOLERANCE = 0.001;

  // Read "1 630 294,70", "1630294.70", "1,630,294.70", "4 %" or "−6" as a number
  function parseNumber(text) {
    let s = text.replace(/[\s  ]/g, "").replace(/kč|%|,-$/gi, "").replace("−", "-");
    const comma = s.lastIndexOf(","), dot = s.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
      // both used: the last one is the decimal separator
      const thousands = comma > dot ? "." : ",";
      s = s.split(thousands).join("").replace(",", ".");
    } else if (s.split(",").length > 2 || s.split(".").length > 2) {
      // the same separator twice can only group thousands
      s = s.replace(/[.,]/g, "");
    } else {
      s = s.replace(",", ".");
    }
    return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
  }

  function matches(value, target, exercise, tolerance) {
    tolerance = tolerance ?? RELATIVE_TOLERANCE * Math.abs(target);
    const close = (x) => Math.abs(x - target) <= tolerance;
    // a percentage may also be entered as a decimal: 0,04 for 4 %
    return close(value) || (exercise.dataset.unit === "%" && close(value * 100));
  }

  // Is the value in this input right? tol applies to the results, not to the hints
  function isRight(value, input, exercise, inputs) {
    const tolerance = exercise.dataset.tol ? parseFloat(exercise.dataset.tol) : undefined;
    const targets = [input.dataset.answer];
    if (inputs.length === 1 && exercise.dataset.accept) {
      targets.push(...exercise.dataset.accept.split(";"));
    }
    return targets.some((t) => matches(value, parseFloat(t), exercise, tolerance));
  }

  function check(exercise) {
    const inputs = Array.from(exercise.querySelectorAll(".exercise-check input"));
    const feedback = exercise.querySelector(".exercise-feedback");
    const solution = exercise.querySelector(".exercise-solution");
    const mistakes = Array.from(exercise.querySelectorAll(".exercise-mistake"));
    const several = inputs.length > 1;

    mistakes.forEach((m) => { m.hidden = true; });
    inputs.forEach((input) => input.classList.remove("is-valid", "is-invalid"));
    exercise.classList.remove("is-correct", "is-wrong");

    if (inputs.some((input) => input.value.trim() === "")) {
      feedback.textContent = several ? "Vyplňte všechna pole." : "Nejdřív zadejte svůj výsledek.";
      return;
    }
    const values = inputs.map((input) => parseNumber(input.value));
    if (values.some(Number.isNaN)) {
      feedback.textContent = "Tomu nerozumím. Zadejte číslo, třeba 1 234,56.";
      return;
    }

    const right = values.map((value, k) => isRight(value, inputs[k], exercise, inputs));
    if (several) {
      inputs.forEach((input, k) => input.classList.add(right[k] ? "is-valid" : "is-invalid"));
    }
    if (right.every(Boolean)) {
      exercise.classList.add("is-correct");
      feedback.textContent = "Správně!" + (solution ? " Celý postup najdete níže." : "");
      if (solution) solution.open = true;
      return;
    }

    exercise.classList.add("is-wrong");
    const wrong = values.filter((value, k) => !right[k]);
    const mistake = mistakes.find((m) => m.dataset.answer.split(";").some((target) =>
      wrong.some((value) => matches(value, parseFloat(target), exercise))));
    if (mistake) mistake.hidden = false;
    if (wrong.length < values.length) {
      feedback.textContent = "Část máte správně, zbytek nesedí.";
    } else if (mistake) {
      feedback.textContent = "To nesedí. Nápověda:";
    } else {
      feedback.textContent = "To nesedí. Zkuste to znovu, nebo si otevřete řešení.";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".exercise").forEach((exercise) => {
      const form = exercise.querySelector(".exercise-check");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        check(exercise);
      });
      const solution = exercise.querySelector(".exercise-solution");
      if (solution) {
        solution.addEventListener("toggle", () => {
          solution.querySelector("summary").textContent =
            solution.open ? "Skrýt řešení" : "Zobrazit řešení";
        });
      }
    });
  });
})();
