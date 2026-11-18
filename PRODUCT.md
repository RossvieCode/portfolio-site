# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Independent rap, drill and urban artists who need a record to sound finished. Two kinds of client:

- **Local studio artists** who book time to record in person, then have the same engineer mix and master.
- **Remote artists** who send stems and get back a mix and master, without ever being in the room.

The site has to work for a French-speaking audience and an English-speaking one (it ships an EN/FR switch). Most visitors arrive on a phone, often from a link shared on WhatsApp or Instagram. Their job: hear whether this engineer can make *their* song sound right, then start a conversation.

## Product Purpose

The site belongs to Ocompos (byocompos), a recording, mixing and mastering engineer. It exists to turn a curious artist into a WhatsApp conversation about a session. Success is a booking message that arrives with the project type, artist name and a preferred date.

## Positioning

**Proven credits.** Ocompos has already worked on released records by artists in the scene: Carty, Slime Sandro, Lil Kee, GGORDO, Tetsuya, YBS2SLIMEY, NHT, Dinho, KBL. The proof is the sound itself. Real tracks can be played in place, and real before/after clips show what the mix and master changed. A competing engineer can't truthfully claim these credits or play these comparisons.

## Operating Context

- Booking happens on WhatsApp, through a pre-filled message (project type, artist name, preferred date). The message's language follows the site language. There is no form, account or checkout.
- Each quote is given privately, in the conversation.
- The three-step process as stated on the site: send your project (track, reference song, deadline), then record in the studio or send stems for mix and master, then receive final files ready for Spotify, Apple Music and YouTube.
- Visitors listen on phone speakers and earbuds. Audio previews are 30-second clips.

## Capabilities and Constraints

- **Stack:** static HTML, CSS and JavaScript (`index.html`, `portfolio.html`, `style.css`, `script.js`, `i18n.js`), hosted on GitHub Pages at `rossviecode.github.io/portfolio-site`. GSAP and Lenis load from a CDN as optional enhancements, and the scripts fall back when they're missing. Don't add a framework or build step for small features.
- **Bilingual:** all copy is in English and French through `i18n.js` (`data-i18n` keys). New copy needs both languages.
- **Services:** recording, mixing and mastering, and nothing else. Sound design is **not** offered (removed from the site 2026-11-17).
- **No public prices.** Prices never appear on the site, and quotes are given only on WhatsApp.
- **Open, unconfirmed:**
  - Are the videos and cover art on `portfolio.html` Ocompos's own visual work? Not confirmed. Present them as releases Ocompos worked on (the audio), not as visual-design credits.
  - The Spotify, Apple Music, Instagram, YouTube, SoundCloud, X and TikTok links are placeholders or generic, and the `contact@byocompos.com` email is unverified. Never invent real URLs. Leave them hidden or as they are until the user supplies them.

## Brand Commitments

- Name: **Ocompos**, signed "by Ocompos" / BYOCOMPOS. Logo files: `resource/logo-ocompos.png` / `.webp`; portrait/avatar: `resource/logo.jpeg`; favicon: `favicon.svg`; share image: `resource/og-image.png`.
- Tagline in use: "Turning emotion into sound"; subtitle "Recording • Mix • Mastering".
- Voice: first person, direct, short sentences, with no studio jargon aimed at the artist ("make your record sound like the version you hear in your head").
- French addresses the artist as **tu**, never vous, matching the WhatsApp booking message ("Salut Ocompos…").
- Look: a dark, starry night ground. Don't use the release covers as hero or background decoration; they appear only where a specific track is shown.

## Evidence on Hand

- Playable previews in `resource/audio/`: Carty "Bamboula", Slime Sandro x Lil Kee x GGORDO "Attentat", Carty "Bastos", Tetsuya "Ndolo", YBS "Range Rover".
- Before/after pair: Carty "Bastos", raw against final, as 30-second clips.
- Cover art in `resource/covers/`, and YouTube links to released videos on `portfolio.html`.
- Collaborator names listed above.
- **Absent:** testimonials, client quotes, stream counts, awards, pricing and gear lists. Don't invent any of them.

## Product Principles

1. **Let the ears decide.** Every claim should sit one tap from audio that backs it up. Listening comes before reading.
2. **One path to booking.** Every route ends at the same pre-filled WhatsApp message, and nothing else competes with it.
3. **Credits are the proof, so keep them true.** Show only real artists and real releases.
4. **Phone first, in two languages.** The site has to work on a phone, on a mobile connection, in French and in English.
5. **The work is the hero.** The interface frames the music and never competes with it.

## Accessibility & Inclusion

Audio controls must work by keyboard and touch, with accessible names. Honor reduced-motion preferences for the site's heavy animation (3D hero, scroll reveals, carousels). Keep both languages at parity, including ARIA labels.
