// Command palette. Press Ctrl+K or Cmd+K anywhere on the site.
// Same idea as the Ctrl+K palette in theme_atrium, rebuilt here with no dependencies.
(function () {
    'use strict';

    var ITEMS = [
        { t: 'Home', s: 'Moodle that ships, and keeps working after handover', h: '/', k: 'start index' },
        { t: 'Work', s: 'Every project, client and plugin', h: '/work/', k: 'projects portfolio' },
        { t: 'Delivery and leadership', s: 'How I run a platform delivery end to end', h: '/delivery/', k: 'project manager technical lead team deployment sprint uat stakeholder agile scrum jira' },
        { t: 'Services', s: 'What I do for clients, and how engagements run', h: '/services/', k: 'hire pricing engagement' },
        { t: 'About', s: 'Technical profile, stack and experience', h: '/about/', k: 'cv resume bio recruiter' },
        { t: 'Contact', s: 'Start a project or ask a question', h: '/contact/', k: 'email hire message' },
        { t: 'Live demo', s: 'Authoring in Moodle without a developer', h: '/work/live-demo/', k: 'h5p content bank demo try' },
        { t: 'Compliance LMS case study', s: 'Moodle 5.2 on AWS for a fintech company', h: '/work/fintech-lms/', k: 'scorm client aws case study' },
        { t: 'theme_atrium', s: 'A complete Boost child theme for Moodle 5.1 and 5.2', h: '/work/theme-atrium/', k: 'theme boost design' },
        { t: 'mod_onelife', s: 'Streak-based revision, published on the Moodle Marketplace', h: '/work/mod-onelife/', k: 'plugin activity game question bank' },
        { t: 'report_transcript', s: 'A verifiable learner transcript', h: '/work/report-transcript/', k: 'plugin report pdf transcript' },
        { t: 'Play One Life in the browser', s: 'The plugin mechanic, no Moodle needed', h: '/work/mod-onelife/#play', k: 'try game play demo' },
        { t: 'Working hours and overlap', s: 'Pune, with your morning in my afternoon', h: '/#timezone', k: 'timezone ist uk eu us hours' },
        { t: 'One Life on the Moodle Marketplace', s: 'marketplace.moodle.com/plugins/4140', h: 'https://marketplace.moodle.com/plugins/4140', k: 'download install plugin directory', x: 1 },
        { t: 'GitHub', s: 'github.com/surajthalange', h: 'https://github.com/surajthalange', k: 'code source repository', x: 1 },
        { t: 'Moodle developer CV', s: 'PDF', h: '/assets/cv/Suraj_Thalange_Moodle_Developer.pdf', k: 'resume cv pdf download developer', x: 1 },
        { t: 'Technical project manager CV', s: 'PDF', h: '/assets/cv/Suraj_Thalange_Technical_Project_Manager.pdf', k: 'resume cv pdf download manager delivery pm', x: 1 },
        { t: 'LinkedIn', s: 'in/developersurajthalange', h: 'https://www.linkedin.com/in/developersurajthalange', k: 'profile network social', x: 1 },
        { t: 'Email Suraj', s: 'surajthalange18@gmail.com', h: 'mailto:surajthalange18@gmail.com', k: 'contact mail write', x: 1 },
    ];

    var dialog = null;
    var input = null;
    var list = null;

    function create() {
        if (dialog) {
            return;
        }
        dialog = document.createElement('dialog');
        dialog.className = 'palette';
    dialog.setAttribute('aria-label', 'Search this site');
    dialog.innerHTML = '<div class="palette-inner">'
        + '<div class="palette-search">'
        + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'
        + '<input type="text" placeholder="Search pages, projects and links" aria-label="Search" autocomplete="off" spellcheck="false">'
        + '</div><ul class="palette-list" role="listbox"></ul>'
        + '<div class="palette-foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>'
        + '</div>';
        document.body.appendChild(dialog);
        input = dialog.querySelector('input');
        list = dialog.querySelector('.palette-list');
        input.addEventListener('input', render);
        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) {
                dialog.close();
            }
        });
    }

    var shown = [];
    var cursor = 0;

    function score(item, q) {
        if (!q) {
            return 1;
        }
        var hay = (item.t + ' ' + item.s + ' ' + (item.k || '')).toLowerCase();
        if (item.t.toLowerCase().indexOf(q) === 0) {
            return 100;
        }
        if (hay.indexOf(q) !== -1) {
            return 50;
        }
        // Loose match: every letter of the query in order.
        var i = 0;
        for (var c = 0; c < hay.length && i < q.length; c++) {
            if (hay[c] === q[i]) {
                i++;
            }
        }
        return i === q.length ? 10 : 0;
    }

    function render() {
        var q = input.value.trim().toLowerCase();
        shown = ITEMS.map(function (it) {
            return { it: it, sc: score(it, q) };
        }).filter(function (r) {
            return r.sc > 0;
        }).sort(function (a, b) {
            return b.sc - a.sc;
        }).map(function (r) {
            return r.it;
        });
        cursor = 0;
        if (!shown.length) {
            list.innerHTML = '<li class="palette-empty">Nothing matches that. Try "plugin", "demo" or "contact".</li>';
            return;
        }
        list.innerHTML = shown.map(function (it, i) {
            var icon = it.x ? '&#8599;' : it.t.slice(0, 2).toUpperCase();
            return '<li role="option" aria-selected="' + (i === 0) + '">'
                + '<a class="palette-item" href="' + it.h + '" aria-selected="' + (i === 0) + '" data-i="' + i + '">'
                + '<span class="pi-icon" aria-hidden="true">' + icon + '</span>'
                + '<span class="pi-text"><span class="pi-title">' + it.t + '</span><span class="pi-sub">' + it.s + '</span></span>'
                + '</a></li>';
        }).join('');
    }

    function move(delta) {
        var links = list.querySelectorAll('.palette-item');
        if (!links.length) {
            return;
        }
        links[cursor].setAttribute('aria-selected', 'false');
        cursor = (cursor + delta + links.length) % links.length;
        links[cursor].setAttribute('aria-selected', 'true');
        links[cursor].scrollIntoView({ block: 'nearest' });
    }

    function open() {
        create();
        if (dialog.open) {
            return;
        }
        input.value = '';
        render();
        dialog.showModal();
        input.focus();
    }

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (dialog && dialog.open) {
                dialog.close();
            } else {
                open();
            }
            return;
        }
        if (!dialog || !dialog.open) {
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            move(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            move(-1);
        } else if (e.key === 'Enter') {
            var links = list.querySelectorAll('.palette-item');
            if (links.length) {
                e.preventDefault();
                links[cursor].click();
            }
        }
    });

    var trigger = document.querySelector('[data-palette-open]');
    if (trigger) {
        trigger.addEventListener('click', open);
    }
}());
