# Pagine di Maintenance - Bitcoin People

Pagine eleganti con animazioni per quando i servizi sono offline o in manutenzione.

## File Disponibili

| File | Uso |
|------|-----|
| `index.html` | Per **bpay.bitcoinpeople.it** (con logo MyBPay) |
| `bitcoinpeople.html` | Per **bitcoinpeople.it** (con logo Bitcoin People) |

## Preview Locale

```bash
cd /Users/elhadjindiaye/maintenance-page

# Con Python (già installato su Mac)
python3 -m http.server 8080

# Poi apri: http://localhost:8080
```

---

## Opzioni di Hosting per Failover

### Opzione 1: GitHub Pages (Consigliata - Gratis)

1. **Crea repository su GitHub:**
   ```bash
   cd /Users/elhadjindiaye/maintenance-page
   git init
   git add .
   git commit -m "Add maintenance pages"
   gh repo create btcp-srl/maintenance-pages --public --source=. --push
   ```

2. **Abilita GitHub Pages:**
   - Vai su GitHub → Repository → Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`

3. **URL risultanti:**
   - `https://btcp-srl.github.io/maintenance-pages/` → index.html (BPay)
   - `https://btcp-srl.github.io/maintenance-pages/bitcoinpeople.html`

4. **Configura dominio custom (opzionale):**
   - Aggiungi file `CNAME` con contenuto: `maintenance.bitcoinpeople.it`
   - Configura DNS su GoDaddy (vedi sotto)

---

### Opzione 2: Cloudflare Pages (Gratis)

1. Vai su [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect to GitHub
3. Seleziona il repository
4. Deploy automatico

---

### Opzione 3: Netlify (Gratis)

1. Vai su [Netlify](https://app.netlify.com/drop)
2. Trascina la cartella `maintenance-page`
3. Ottieni URL tipo: `https://xyz-123.netlify.app`

---

## Configurazione DNS su GoDaddy

### Per Manutenzione Programmata

Quando devi fare manutenzione, cambia i record DNS su GoDaddy:

**Prima (normale):**
```
bpay.bitcoinpeople.it  →  A  →  51.161.122.78 (server OVH)
```

**Durante manutenzione:**
```
bpay.bitcoinpeople.it  →  CNAME  →  btcp-srl.github.io
```

### Procedura su GoDaddy:

1. Vai su [GoDaddy DNS Manager](https://dcc.godaddy.com/manage/dns)
2. Seleziona `bitcoinpeople.it`
3. Trova il record per `bpay`
4. Cambia:
   - **Tipo:** da `A` a `CNAME`
   - **Valore:** `btcp-srl.github.io`
   - **TTL:** 600 (10 minuti)

5. **IMPORTANTE:** Dopo la manutenzione, ripristina il record originale!

---

## Soluzione Avanzata: Cloudflare (Failover Automatico)

Per avere failover **automatico** (senza toccare DNS manualmente), considera di migrare i DNS a Cloudflare:

### Vantaggi Cloudflare:
- **Health Checks:** Monitora automaticamente se il server risponde
- **Failover automatico:** Se il server è giù, mostra la pagina di maintenance
- **Always Online™:** Mostra una copia cache del sito se il server è irraggiungibile
- **Custom Error Pages:** Pagine di errore personalizzate per 502, 503, etc.

### Setup Cloudflare:

1. **Aggiungi sito su Cloudflare** (gratuito)
2. **Cambia nameserver su GoDaddy** per puntare a Cloudflare
3. **Configura Custom Error Pages:**
   - Dashboard → Rules → Custom Error Responses
   - Per errore 502/503: mostra `maintenance-page/index.html`

4. **Configura Health Check (piano Pro):**
   - Dashboard → Traffic → Health Checks
   - Monitora `https://bpay.bitcoinpeople.it/health`
   - Se fallisce → redirect a pagina maintenance

---

## Script di Switch Rapido (usando API GoDaddy)

Se vuoi automatizzare lo switch DNS, puoi usare le API GoDaddy:

```bash
#!/bin/bash
# switch-to-maintenance.sh

GODADDY_KEY="your-api-key"
GODADDY_SECRET="your-api-secret"
DOMAIN="bitcoinpeople.it"
SUBDOMAIN="bpay"
MAINTENANCE_TARGET="btcp-srl.github.io"

# Switch a maintenance
curl -X PUT "https://api.godaddy.com/v1/domains/${DOMAIN}/records/CNAME/${SUBDOMAIN}" \
  -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
  -H "Content-Type: application/json" \
  -d "[{\"data\": \"${MAINTENANCE_TARGET}\", \"ttl\": 600}]"

echo "DNS switched to maintenance page"
```

```bash
#!/bin/bash
# switch-to-production.sh

GODADDY_KEY="your-api-key"
GODADDY_SECRET="your-api-secret"
DOMAIN="bitcoinpeople.it"
SUBDOMAIN="bpay"
PRODUCTION_IP="51.161.122.78"

# Switch a production
curl -X PUT "https://api.godaddy.com/v1/domains/${DOMAIN}/records/A/${SUBDOMAIN}" \
  -H "Authorization: sso-key ${GODADDY_KEY}:${GODADDY_SECRET}" \
  -H "Content-Type: application/json" \
  -d "[{\"data\": \"${PRODUCTION_IP}\", \"ttl\": 600}]"

echo "DNS switched back to production"
```

---

## Personalizzazione

### Cambiare il messaggio:
Modifica queste sezioni nei file HTML:

```html
<h1>Torneremo Presto</h1>

<p class="subtitle">
    Stiamo lavorando per migliorare la tua esperienza.<br>
    Il servizio sarà nuovamente disponibile a breve.
</p>
```

### Cambiare i colori:
I colori principali sono:
- **Oro Bitcoin:** `#f7b500` (particelle, accenti)
- **Sfondo:** gradient da `#0a0a0a` a `#16213e`

### Aggiungere countdown:
Puoi aggiungere un countdown JavaScript per mostrare quando il servizio tornerà online.

---

## Checklist Manutenzione

- [ ] Comunicare ai clienti in anticipo (email, social)
- [ ] Testare la pagina maintenance localmente
- [ ] Assicurarsi che sia hostata su GitHub Pages/Netlify
- [ ] Cambiare DNS su GoDaddy
- [ ] Verificare che la pagina sia visibile
- [ ] Fare la manutenzione
- [ ] Ripristinare DNS originale
- [ ] Verificare che il servizio funzioni
- [ ] Comunicare fine manutenzione
