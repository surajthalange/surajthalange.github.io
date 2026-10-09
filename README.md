# surajthalange.github.io

The built output of my portfolio. Live at **<https://surajthalange.github.io>**.

Case studies on the Moodle plugins and themes I have published, notes on what a Moodle theme
costs in page weight and what the Marketplace plugin review actually checks, and what I do for
clients.

## What is in here

This repository holds the generated site only: HTML, CSS, one small JavaScript file and the
images. It is served by GitHub Pages straight from the default branch, so every file here is a
file the browser receives.

There is no framework and no client-side rendering. The pages are static HTML, the stylesheet is
hand-written, and the only JavaScript is a command palette, a scroll reveal and a playable demo
of one of the plugins. Nothing is fetched from a third party at run time: the fonts, the icons
and the images are all served from this origin.

## How it is built

From a separate source repository, by a small build script of my own rather than a static site
generator.

The part worth mentioning is how screenshots are handled. Pages declare images as placeholders:

```html
<x-shot frame="browser" src="transcript/learner-page.png" w="1600" h="1000"
        alt="A learner's transcript: course, started, completed, grade, outcome"></x-shot>
```

If the file exists, the build emits a figure with its frame and caption. If it does not, the
build emits **nothing at all** — no broken image, no empty box — and writes the missing shot to a
to-do list instead. A page is therefore never half-finished in public; it either shows the
screenshot or does not mention it.

The screenshots themselves are captured by a script that drives Chrome over the DevTools
protocol against a local Moodle, signs in as the right account, puts each page into the state the
shot needs, and writes the PNG under the exact name the placeholder already references. Every
shot asserts something about the page before the screenshot is taken — that it is not the login
form, not a permissions error, that the transcript has rows — because a capture harness that
cannot tell a real page from a login screen will quietly fill a site with pictures of login
screens.

## The plugins this site is about

| | |
|---|---|
| [mod_onelife](https://github.com/surajthalange/moodle-mod_onelife) | Streak-based revision from a course question bank. Published in the Moodle plugins directory |
| [report_transcript](https://github.com/surajthalange/moodle-report_transcript) | Learner transcript as a page, a branded PDF and a public verification page |
| [theme_atrium](https://github.com/surajthalange/moodle-theme_atrium) | A Boost child theme: collapsible sidebar, command palette, accessibility toolbar |

## Licence

The site content and images are © Suraj Thalange. The plugins linked above are GPLv3 or later,
each in its own repository.
