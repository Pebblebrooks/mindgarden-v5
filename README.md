# Mind Garden v5.0.0

Approved compact menus, separate account tasks, per-player preferences and retained device records, with optional WebAuthn device sign-in.

v5.0.0 shows the games on first load, uses a labelled Menu button, adds a language picker and tidies All Games, My Games and My Progress. See `docs/RELEASE-v5.0.0.md`.

Build: `python3 scripts/build-release.py`.
Deploy the existing Cloudflare Pages project from `main`, output directory `public`.

Preserve the existing D1 `DB` binding and `MG_ACCOUNT_PEPPER`. Account saving requires `migrate-v4.0.33.sql`; new registrations require `MG_ACCOUNT_SIGNUP=enabled`. Device sign-in additionally requires the additive `migrate-passkeys.sql` migration. Password sign-in does not depend on the optional passkey tables.

See `README-UPDATE.txt`, `README-PASSKEYS.md`, and `docs/account-saving.md`. Historical review documents describe earlier drafts, not current deployment status.
