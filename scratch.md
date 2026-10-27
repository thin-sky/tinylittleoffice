# Thin Sky Office

Task: fork and self-host Tiny Little Office at office.thin-sky.cloud, add interactive worksheets, a Toki Pona study pack, and recipe/RPG/team-paste examples.

Owner: this Codex chat, local checkout. Branch: dev/thin-sky-learning. Upstream: aboard-io/tinylittleoffice, base 399d217.

Hosting: user initially selected a private preview, then explicitly requested office.thin-sky.cloud. The latest choice authorizes public hosting there. DNS already resolves to the VPS address; preserve the existing record. VPS services belong in /opt/homelab/docker-compose.yml. Bind published ports to loopback. Use Docker with Node 24 because the VPS host currently runs Node 22.

Validation: 1,275 unit tests passed; nine insertion commands exercised by three browser embedding tests; six desktop Chrome/mobile WebKit functional and accessibility checks passed; production build passed lint and size budgets (129 files, five first-paint requests). Initial deployment: https://office.thin-sky.cloud, application commit 5d0d9d3. Config backups: .office-backup.20261027T041613Z; source/build: /opt/homelab/office/releases/5d0d9d3; volume: homelab_office_data. Public HTTPS and the six desktop/mobile checks passed again on the live site. Actual Share short-link creation, decryption/redirect, API links and decision/RPG formulas passed.

Rollback: remove only the new office Caddy block and new office service from the backed-up homelab files, reload Caddy, and stop the office container. Preserve the office data volume.

Follow-up: add a text/emoji tier list and a PocketCal-inspired date picker. The user clarified that the site stays public and there should be no upstream contributions. The draft PR in our fork was closed and unlinked; use branch history for the experiment without opening more PRs. URL compression remains the existing dictionary DEFLATE/raw codec; Caddy offers zstd/gzip, with no Brotli enabled.

Follow-up validation: 1,282 unit tests pass; all ten desktop/mobile functional and accessibility checks pass; three embedding tests exercise all fifteen Thin Sky insertion commands. Deployed application commit c20c63a at https://office.thin-sky.cloud. Image thin-sky-office:c20c63a is healthy; the ten desktop/mobile checks also passed on the public domain, the live API exports iCalendar, and the pre-upgrade encrypted link still opens. Upgrade backup: docker-compose.yml.office-backup.20261027T045226Z.
