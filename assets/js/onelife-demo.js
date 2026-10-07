// A browser recreation of the One Life mechanic, so the page can be tried without installing Moodle.
// The real plugin draws its questions from the course question bank; these are invented for the demo.
(function () {
    'use strict';

    var root = document.getElementById('onelife-demo');
    if (!root) {
        return;
    }

    var BANK = {
        'Cell structure': [
            ['Which organelle releases most of a cell’s usable energy?', ['Mitochondrion', 'Ribosome', 'Golgi body', 'Vacuole'], 0,
                'Mitochondria carry out aerobic respiration, which is where most ATP is produced.'],
            ['What is the main job of the cell membrane?', ['Controlling what enters and leaves', 'Storing genetic material', 'Making proteins', 'Digesting waste'], 0,
                'The membrane is partially permeable, so it decides what crosses in each direction.'],
            ['Which structure is found in plant cells but not animal cells?', ['Cell wall', 'Nucleus', 'Mitochondrion', 'Cytoplasm'], 0,
                'A cellulose cell wall gives plant cells their shape and resists turgor pressure.'],
            ['Where are proteins assembled?', ['Ribosomes', 'Lysosomes', 'Nucleolus', 'Chloroplast'], 0,
                'Ribosomes read messenger RNA and join amino acids into a chain.'],
        ],
        'Photosynthesis': [
            ['Which gas is taken in during photosynthesis?', ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], 0,
                'Carbon dioxide enters through the stomata and supplies the carbon for glucose.'],
            ['What pigment absorbs the light?', ['Chlorophyll', 'Carotene', 'Haemoglobin', 'Melanin'], 0,
                'Chlorophyll sits in the thylakoid membranes and absorbs mostly red and blue light.'],
            ['Which product of photosynthesis is released as a waste gas?', ['Oxygen', 'Glucose', 'Starch', 'Water'], 0,
                'Oxygen comes from splitting water in the light-dependent stage.'],
            ['Photosynthesis happens in which organelle?', ['Chloroplast', 'Mitochondrion', 'Nucleus', 'Ribosome'], 0,
                'Chloroplasts hold the chlorophyll and the enzymes for both stages.'],
        ],
        'Enzymes': [
            ['What happens to an enzyme well above its optimum temperature?', ['It denatures', 'It speeds up forever', 'It becomes a substrate', 'It turns into protein'], 0,
                'Heat breaks the bonds holding the tertiary structure, so the active site changes shape.'],
            ['An enzyme is best described as a', ['Biological catalyst', 'Source of energy', 'Type of sugar', 'Waste product'], 0,
                'Enzymes lower the activation energy and are not used up in the reaction.'],
            ['What is the substrate?', ['The molecule the enzyme acts on', 'The enzyme itself', 'The product', 'The temperature'], 0,
                'The substrate binds to the active site and is converted into the product.'],
            ['Which factor does NOT usually affect enzyme activity?', ['The colour of the container', 'pH', 'Temperature', 'Substrate concentration'], 0,
                'Colour has no bearing on it; pH, temperature and concentration all do.'],
        ],
    };

    var TOPICS = Object.keys(BANK);
    var picked = TOPICS.slice();
    var queue = [];
    var streak = 0;
    var best = 0;
    try {
        best = parseInt(localStorage.getItem('onelife-demo-best') || '0', 10) || 0;
    } catch (e) {
        best = 0;
    }

    function shuffle(a) {
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        return a;
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function build() {
        queue = [];
        picked.forEach(function (topic) {
            BANK[topic].forEach(function (q) {
                // Each question carries its options with the correct answer tracked by value.
                var opts = q[1].map(function (text, i) {
                    return { text: text, right: i === q[2] };
                });
                queue.push({ topic: topic, q: q[0], opts: shuffle(opts), why: q[3] });
            });
        });
        shuffle(queue);
    }

    function chrome(bodyHtml, extraClass) {
        root.className = 'onelife-demo' + (extraClass ? ' ' + extraClass : '');
        root.innerHTML = '<div class="od-bar">'
            + '<span class="od-streak" aria-live="polite"><span class="od-heart" aria-hidden="true">&#9829;</span> Streak <strong>' + streak + '</strong></span>'
            + '<span class="od-best">Personal best <strong>' + best + '</strong></span>'
            + '</div>' + bodyHtml;
    }

    function scopeScreen() {
        var chips = TOPICS.map(function (t) {
            var on = picked.indexOf(t) !== -1;
            return '<button type="button" class="od-chip" aria-pressed="' + on + '" data-topic="' + esc(t) + '">'
                + esc(t) + ' <span class="od-count">' + BANK[t].length + '</span></button>';
        }).join('');
        chrome('<div class="od-body">'
            + '<p class="od-kicker">Choose what to practise</p>'
            + '<div class="od-chips">' + chips + '</div>'
            + '<p class="od-note">One wrong answer ends the run. The score is the streak.</p>'
            + '<button type="button" class="btn od-start">Start a run <span class="arrow" aria-hidden="true">&rarr;</span></button>'
            + '</div>');
        root.querySelectorAll('.od-chip').forEach(function (b) {
            b.addEventListener('click', function () {
                var t = b.getAttribute('data-topic');
                var i = picked.indexOf(t);
                if (i === -1) {
                    picked.push(t);
                } else if (picked.length > 1) {
                    picked.splice(i, 1);
                }
                scopeScreen();
            });
        });
        root.querySelector('.od-start').addEventListener('click', function () {
            streak = 0;
            build();
            question();
        });
    }

    function question() {
        if (!queue.length) {
            build();
        }
        var item = queue.shift();
        var opts = item.opts.map(function (o, i) {
            return '<button type="button" class="od-option" data-right="' + o.right + '" data-i="' + i + '">' + esc(o.text) + '</button>';
        }).join('');
        chrome('<div class="od-body">'
            + '<p class="od-kicker">' + esc(item.topic) + '</p>'
            + '<p class="od-question">' + esc(item.q) + '</p>'
            + '<div class="od-options">' + opts + '</div>'
            + '</div>');
        root.querySelectorAll('.od-option').forEach(function (b) {
            b.addEventListener('click', function () {
                answer(b, item);
            });
        });
    }

    function answer(btn, item) {
        var right = btn.getAttribute('data-right') === 'true';
        root.querySelectorAll('.od-option').forEach(function (b) {
            b.disabled = true;
            if (b.getAttribute('data-right') === 'true') {
                b.classList.add('is-right');
            }
        });
        if (!right) {
            btn.classList.add('is-wrong');
        }
        if (right) {
            streak++;
            if (streak > best) {
                best = streak;
                try {
                    localStorage.setItem('onelife-demo-best', String(best));
                } catch (e) {
                    // Private browsing; the best lasts for this page only.
                }
            }
        }
        var foot = document.createElement('div');
        foot.className = 'od-feedback ' + (right ? 'is-right' : 'is-wrong');
        foot.innerHTML = '<p>' + (right ? '<strong>Correct.</strong> ' : '<strong>Wrong. The run ends here.</strong> ') + esc(item.why) + '</p>'
            + '<button type="button" class="btn btn-small od-next">' + (right ? 'Next question' : 'Play again') + '</button>';
        root.querySelector('.od-body').appendChild(foot);
        root.querySelector('.od-streak strong').textContent = streak;
        root.querySelector('.od-best strong').textContent = best;
        root.querySelector('.od-next').addEventListener('click', function () {
            if (right) {
                question();
            } else {
                streak = 0;
                scopeScreen();
            }
        });
        root.querySelector('.od-next').focus();
    }

    scopeScreen();
}());
