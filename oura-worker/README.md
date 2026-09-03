# Oura Bridge

Ein winziges Cloudflare Worker Backend, das die Oura-Ring-Verbindung für "Mein
Dashboard" übernimmt: OAuth-Login gegen Oura, Token-Speicherung, automatischer
Token-Refresh, und ein Endpoint, den das Dashboard abfragt, um den heutigen
Readiness- und Schlaf-Score zu bekommen.

Client-ID und -Secret bleiben ausschließlich im Worker (server-seitig) –
niemals im Frontend-Code oder im Repo.

## Einmalige Einrichtung

1. **Oura-App registrieren**
   Auf https://cloud.ouraring.com/oauth/applications eine neue App anlegen.
   Redirect URI erstmal auf `https://oura-bridge.<dein-subdomain>.workers.dev/callback`
   setzen (den genauen Wert gibt's nach dem ersten Deploy, siehe Schritt 5).
   Client ID und Client Secret notieren.

2. **Cloudflare-Account + Wrangler**
   Falls noch nicht vorhanden: kostenlosen Account auf cloudflare.com anlegen.
   In diesem Ordner (`oura-worker/`):
   ```
   npm install
   npx wrangler login
   ```

3. **KV-Namespace anlegen** (hier landen die Tokens)
   ```
   npx wrangler kv namespace create OURA_TOKENS
   ```
   Die ausgegebene `id` in `wrangler.toml` bei `kv_namespaces` eintragen.

4. **Secrets setzen** (werden verschlüsselt bei Cloudflare gespeichert, landen nie im Repo)
   ```
   npx wrangler secret put OURA_CLIENT_ID
   npx wrangler secret put OURA_CLIENT_SECRET
   npx wrangler secret put DASHBOARD_API_KEY
   ```
   `DASHBOARD_API_KEY` ist ein frei gewählter, langer zufälliger String –
   z. B. mit `openssl rand -hex 32` erzeugen. Er schützt `/api/readiness`
   davor, dass jemand anderes deine Werte abfragt.

5. **Deployen**
   ```
   npx wrangler deploy
   ```
   Wrangler gibt die endgültige Worker-URL aus, z. B.
   `https://oura-bridge.natalia.workers.dev`.

6. **Redirect URI abgleichen**
   - In `wrangler.toml` bei `OURA_REDIRECT_URI` die echte Worker-URL + `/callback` eintragen.
   - Im Oura-App-Dashboard (Schritt 1) die Redirect URI auf denselben Wert setzen.
   - Erneut deployen: `npx wrangler deploy`.

7. **Einmalig verbinden**
   `https://<deine-worker-url>/login` im Browser öffnen, bei Oura einloggen
   und die App autorisieren. Danach zeigt `https://<deine-worker-url>/status`
   `{"connected": true}`.

8. **Im Dashboard eintragen**
   Im Tab "Bereich" bei Gesundheit & Balance die Worker-URL und den
   `DASHBOARD_API_KEY` im Oura-Sync-Feld eintragen (wird nur lokal in deinem
   Browser gespeichert, landet nirgends im Repo). Danach füllt "Jetzt
   synchronisieren" den Readiness-Score automatisch.

## Endpoints

| Route | Zweck |
|---|---|
| `GET /login` | Leitet zu Oura weiter, um die App zu autorisieren (einmalig, manuell im Browser öffnen) |
| `GET /callback` | Oura-Redirect-Ziel, tauscht den Code gegen Tokens und speichert sie |
| `GET /status` | `{"connected": true/false}` – ob Tokens gespeichert sind |
| `GET /api/readiness?date=YYYY-MM-DD` | Liefert `{date, readiness_score, sleep_score}` für ein Datum (Standard: heute). Erfordert Header `Authorization: Bearer <DASHBOARD_API_KEY>` |

## Token-Ablauf

Oura-Access-Tokens laufen nach kurzer Zeit ab. `/api/readiness` prüft das bei
jedem Aufruf und erneuert den Token bei Bedarf automatisch über den
`refresh_token` – dafür ist kein erneuter manueller Login nötig, solange der
Refresh-Token gültig bleibt.
