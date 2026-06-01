# MVP Operating Inputs (Issue #6)

These values are now locked in repository defaults for MVP collection.

## Locked decisions

- **SpeedCurve parity:** no direct parity target in MVP (`directParityInMvp = false`)
- **Desktop profile:** `cable` throttle, viewport `1366x768`
- **Daily schedule:** `07:00 America/Los_Angeles`
- **Artifact retention:** `14 days`
- **Seed catalog:** keep current `urls.json` 10-page top-page list as the reference catalog

## Where defaults are encoded

- `config/operating-inputs.json`
- `.github/workflows/collect.yml`
- `urls.json`

## Schedule implementation note

GitHub Actions cron uses UTC only. The workflow uses dual UTC cron entries (`14:00` and `15:00`) plus an LA-time gate to run only when local time is exactly `07:00`.
