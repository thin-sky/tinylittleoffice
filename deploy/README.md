# Thin Sky Office

This fork adds worksheet, study, and team apps to the original Tiny Little Office suite. Documents use the existing TLO kernel, URL compression, sharing, exports and undo model. New controls currently use English; the original suite retains its translations.

## Examples

- Worksheet / Decision scorecard: a weighted decision.
- Worksheet / Recipe card: pancakes with live ingredient scaling.
- Worksheet / Adventure sheet: Moss, an original system-neutral character, with editable health, supplies and quests.
- Study / Toki Pona: sixteen original cards with vocabulary, sentences and a cloze exercise. This is a practice session, not a spaced-repetition scheduler. Progress stays in memory and the URL contains the answers.
- Team / Rain: three original demonstration sets in Showdown export syntax. The viewer preserves unfamiliar fields and does not validate battle-format legality.

Customize edits the worksheet or study pack's Markdown table. New applications require this fork; the upstream npm package does not contain them. Use this checkout's npm run tinyoffice or the deployed /api.js.

## Build and validate

Use Node 24 or newer, in a supported even-numbered release.

    npm ci
    TZ=UTC npm run test:unit
    VITE_SITE_URL=https://office.thin-sky.cloud/ VITE_TINIER=https://office.thin-sky.cloud/tinier/ npm run build

Focused desktop Chrome and mobile WebKit checks:

    npm run dev -- --host 127.0.0.1
    npx playwright test -c playwright.sky.config.ts

Set SKY_BASE_URL to run the same checks against a built preview or the live service.

## Hosting

The service belongs in /opt/homelab/docker-compose.yml as office, container thin-sky-office, with a persistent office_data volume. Build the image using deploy/Dockerfile and the verified dist output. Merge the entries in office.compose.yml into that file; the existing homelab network is explicitly reused to avoid Compose recreating a network with running services. Published ports bind to loopback; Caddy reaches the two listeners through the homelab Docker network.

The site is https://office.thin-sky.cloud/; /tinier/ routes to the encrypted short-link listener. Retain the existing DNS record. Caddy manages public TLS. The site-specific tls force_automate setting obtains a publicly trusted certificate even though other services load a Cloudflare origin wildcard. No extra Cloudflare Worker, D1 database or npm publication is needed.

An untracked service environment file holds a generated BRAKE_KEY, the fixed site origin, and IP_HEADER=x-forwarded-for. Never commit it. Back up the office_data volume containing the shortener's SQLite database. Ordinary long-link documents remain in their URL fragments.

Before changing homelab files, copy their previous versions with a timestamp. Validate complete Compose and Caddy configurations before applying only the new service and reloading Caddy.

Rollback: restore previous Compose and Caddy files, stop office, and reload Caddy. Keep office_data so short links can be recovered. Code stays on dev/thin-sky-learning; no direct main push is needed.

## Deployed release

The public service runs application commit 5d0d9d38c5b40ddc315fa3e496f134d5a9f260dc, image thin-sky-office:5d0d9d3. Its verified build is retained under /opt/homelab/office/releases/5d0d9d3. Config backups use the suffix .office-backup.20261027T041613Z. The persistent database is in homelab_office_data.

Public HTTPS, all six desktop/mobile functional and accessibility checks, API link origins, decision and RPG formulas, actual Share short-link creation and decryption, and database persistence across container recreation were checked after deployment.
