// Cloudflare Worker - Failover automatico a maintenance page
// Quando il server è giù, mostra automaticamente la pagina di maintenance

const MAINTENANCE_PAGE_URL = 'https://btcp-srl.github.io/maintenance-page/';
const MAINTENANCE_PAGE_BPAY = 'https://btcp-srl.github.io/maintenance-page/index.html';
const MAINTENANCE_PAGE_BITCOINPEOPLE = 'https://btcp-srl.github.io/maintenance-page/bitcoinpeople.html';

// Codici di errore che attivano il failover
const ERROR_CODES = [502, 503, 504, 520, 521, 522, 523, 524];

// Timeout per la richiesta al server originale (ms)
const ORIGIN_TIMEOUT = 10000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      // Crea un controller per il timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ORIGIN_TIMEOUT);

      // Prova a raggiungere il server originale
      const response = await fetch(request, {
        signal: controller.signal,
        cf: {
          // Bypassa la cache per avere sempre lo stato reale del server
          cacheTtl: 0,
          cacheEverything: false
        }
      });

      clearTimeout(timeoutId);

      // Se il server risponde con un errore, mostra la maintenance page
      if (ERROR_CODES.includes(response.status)) {
        return await showMaintenancePage(url);
      }

      // Altrimenti, restituisci la risposta normale
      return response;

    } catch (error) {
      // Timeout o errore di connessione → mostra maintenance page
      console.log(`Origin error: ${error.message}`);
      return await showMaintenancePage(url);
    }
  }
};

async function showMaintenancePage(url) {
  // Scegli la pagina giusta in base al sottodominio
  let maintenanceUrl = MAINTENANCE_PAGE_BITCOINPEOPLE;

  if (url.hostname.includes('bpay') || url.hostname.includes('mybpay')) {
    maintenanceUrl = MAINTENANCE_PAGE_BPAY;
  }

  try {
    const maintenanceResponse = await fetch(maintenanceUrl);

    // Restituisci la pagina con status 503 (Service Unavailable)
    return new Response(await maintenanceResponse.text(), {
      status: 503,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Retry-After': '300' // Suggerisce di riprovare dopo 5 minuti
      }
    });
  } catch (e) {
    // Fallback se anche GitHub Pages non risponde
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Manutenzione in corso</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a2e; color: white; }
          .container { text-align: center; }
          h1 { color: #f7b500; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Torneremo Presto</h1>
          <p>Stiamo lavorando per migliorare la tua esperienza.</p>
        </div>
      </body>
      </html>
    `, {
      status: 503,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
}
