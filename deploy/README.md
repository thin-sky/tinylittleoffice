# Thin Sky Office

This fork adds worksheet, study, team, tier, and date-picker apps to the original Tiny Little Office suite. Documents use the existing TLO kernel, URL compression, sharing, exports and undo model. New controls currently use English; the original suite retains its translations.

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

Upgrade rollback: restore docker-compose.yml.office-backup.20261027T045226Z to docker-compose.yml and run sudo docker compose up -d --no-deps office from /opt/homelab. This restores image thin-sky-office:5d0d9d3; Caddy is unchanged by the upgrade. Keep office_data so short links remain available. To remove the entire service, use the initial Compose and Caddy backups ending 20261027T041613Z, stop office and reload Caddy. Code stays on dev/thin-sky-learning.

## Deployed release

The public service runs application commit c20c63a05d4005c505396b8c5bdf5d802ea46542, image thin-sky-office:c20c63a. Its verified build is retained under /opt/homelab/office/releases/c20c63a. The upgrade config backup uses the suffix .office-backup.20261027T045226Z. The persistent database is in homelab_office_data.

Public HTTPS, all ten desktop/mobile functional and accessibility checks, API link origins, decision and RPG formulas, actual Share short-link creation and decryption, and database persistence across container recreation were checked after deployment.

## Organizer additions

Tier List Maker ranks text and emoji cards in named rows, with desktop drag and drop and Edit controls for moving, reordering, renaming and removing cards on touch or keyboard. Pocket Calendar is inspired by [PocketCal](https://github.com/cassidoo/pocketcal): twelve months, named date groups, independent overlapping ranges, Monday/Sunday starts, optional weekends, and iCalendar export. Both use the same TLO tables and compressed document links. PocketCal code and its licensing/payment integration are not embedded.

The experiment stays in this fork; do not open upstream pull requests or create review PRs for routine experiments. The first draft PR in this fork was closed after the user clarified that preference.

Document payloads currently choose raw UTF-8, DEFLATE, or DEFLATE with the frozen shared dictionary; Brotli is not enabled. HTTP compression is separately configured as zstd/gzip in Caddy. Old document URLs continue to open.

The organizer upgrade passed the same ten checks on the live public site, the live API/iCalendar export check, and opening an encrypted short link created before the upgrade. The service is healthy.
