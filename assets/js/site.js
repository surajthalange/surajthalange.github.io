// Small progressive enhancements. The site works without this file.
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Theme: follows the OS until the visitor chooses; the choice is remembered.
    var toggle = document.querySelector('[data-theme-toggle]');
    var osDark = window.matchMedia('(prefers-color-scheme: dark)');
    function currentTheme() {
        var set = root.getAttribute('data-theme');
        if (set === 'light' || set === 'dark') {
            return set;
        }
        return osDark.matches ? 'dark' : 'light';
    }
    function labelToggle() {
        if (toggle) {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
        }
    }
    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) {
                // Storage may be unavailable; the choice then lasts for this page only.
            }
            labelToggle();
        });
        osDark.addEventListener('change', labelToggle);
        labelToggle();
    }

    // Mobile navigation toggle.
    var navToggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    // Reveal on scroll. Elements start visible if there is no IntersectionObserver or motion is reduced.
    var revealNodes = document.querySelectorAll('.reveal');
    var cssDrivesReveals = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
    if (revealNodes.length && cssDrivesReveals) {
        // CSS runs the animation. The only thing left to do is settle anything sitting in the last
        // screenful, where the timeline cannot reach its end.
        var settle = function () {
            var vh = window.innerHeight;
            var docH = document.documentElement.scrollHeight;
            var atEnd = window.scrollY + vh >= docH - 2;
            revealNodes.forEach(function (n) {
                var r = n.getBoundingClientRect();
                if (r.top >= vh || r.bottom <= 0) {
                    return;
                }
                // Anything ending inside the final screenful can never finish its timeline.
                var endsInLastScreen = r.bottom + window.scrollY > docH - vh;
                if (endsInLastScreen || atEnd) {
                    n.classList.add('is-visible');
                }
            });
        };
        var queued = false;
        var onScroll = function () {
            if (queued) {
                return;
            }
            queued = true;
            requestAnimationFrame(function () {
                queued = false;
                settle();
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        settle();
        setTimeout(settle, 400);
    }
    if (revealNodes.length && !cssDrivesReveals) {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            revealNodes.forEach(function (n) { n.classList.add('is-visible'); });
        } else {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px 10% 0px', threshold: 0.05 });
            revealNodes.forEach(function (n) {
                // Anything already on screen shows at once; only later sections animate in.
                if (n.getBoundingClientRect().top < window.innerHeight * 1.2) {
                    n.classList.add('is-visible', 'no-anim');
                } else {
                    io.observe(n);
                }
            });
            // Safety net: nothing stays hidden if the observer never fires (print, odd embeds).
            setTimeout(function () {
                revealNodes.forEach(function (n) { n.classList.add('is-visible'); });
            }, 2000);
        }
    }

    // Contact form: composes an email in the visitor's mail client. No backend needed.
    var form = document.getElementById('contact-form');
    if (form) {
        // /contact/?kind=demo preselects the matching option.
        var wanted = new URLSearchParams(window.location.search).get('kind');
        if (wanted) {
            var opt = form.querySelector('option[data-kind="' + wanted + '"]');
            if (opt) {
                opt.selected = true;
            }
        }
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var kind = data.get('kind') || 'Enquiry';
            var subject = kind + ' from ' + (data.get('name') || 'website visitor');
            var lines = [
                'Name: ' + (data.get('name') || ''),
                'Organisation: ' + (data.get('org') || ''),
                'Type: ' + kind,
                'Timeline: ' + (data.get('timeline') || ''),
                '',
                data.get('message') || ''
            ];
            var to = form.getAttribute('data-to');
            window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
        });
    }

    // Screenshot lightbox: plain <dialog>, one image at a time.
    var links = document.querySelectorAll('.gallery a[href$=".png"], .gallery a[href$=".jpg"], .hero-shot a[href$=".png"], .browser a[href$=".png"]');
    if (links.length && typeof HTMLDialogElement === 'function') {
        var dialog = document.createElement('dialog');
        dialog.className = 'lightbox';
        dialog.innerHTML = '<button type="button" class="lightbox-close" aria-label="Close">×</button><img alt="">';
        dialog.style.cssText = 'border:0;padding:0;background:transparent;max-width:min(96vw,1400px);max-height:96vh;';
        var img = dialog.querySelector('img');
        img.style.cssText = 'max-width:100%;max-height:92vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.5)';
        var close = dialog.querySelector('button');
        close.style.cssText = 'position:absolute;top:8px;right:8px;width:40px;height:40px;border:0;border-radius:50%;background:#fff;color:#172022;font-size:24px;cursor:pointer;';
        close.addEventListener('click', function () { dialog.close(); });
        dialog.addEventListener('click', function (e) { if (e.target === dialog) { dialog.close(); } });
        document.body.appendChild(dialog);
        links.forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                img.src = a.getAttribute('href');
                img.alt = (a.querySelector('img') || {}).alt || '';
                dialog.showModal();
            });
        });
    }
}());
