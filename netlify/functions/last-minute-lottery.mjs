// netlify/functions/last-minute-lottery.mjs
// KROK 82: Nový formát pre Netlify Scheduled Edge Function

// DÔLEŽITÉ: Premenné prostredia MUSIA byť nastavené v Netlify
const SUPABASE_SERVICE_KEY = Netlify.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY'); 
const EDGE_FUNCTION_URL = 'https://nefhvubtimekjfusxozo.supabase.co/functions/v1/last-minute-lottery'; 


// Funkcia spúšťaná Cronom (Edge Function formát)
export default async (req) => {
    
    // Nové: Edge Functions používajú fetch v Deno runtime
    // Logika pripojenia a volania Supabase klienta je pre túto funkciu irelevantná
    if (!SUPABASE_SERVICE_KEY) {
        return new Response(
            JSON.stringify({ message: "Konfigurácia chyby: Chýba Service Key." }), 
            { status: 500 }
        );
    }
    
    try {
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                // Použitie Service Key na autorizáciu volania Edge Function
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trigger: 'netlify_cron' }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Edge Function Failed: ${response.status} - ${JSON.stringify(data)}`);
        }

        console.log('Last Minute Lotéria (Supabase Edge Function) bola úspešne spustená Netlify Cronom.');

        return new Response(
            JSON.stringify({ message: 'Lotéria úspešne spustená' }), 
            { status: 200 }
        );
    } catch (err) {
        console.error('Kritická chyba v Netlify Cron Spúšťači:', err);
        return new Response(
            JSON.stringify({ message: 'Netlify Spúšťač zlyhal', error: err.message }), 
            { status: 500 }
        );
    }
};

// KROK 82: Konfigurácia plánu (Cron Job) priamo v kóde
export const config = {
    // Spustenie KAŽDÝ PRACOVNÝ DEŇ o 7:00 UTC (napr. 8:00 SEČ). Upravte podľa potreby.
    schedule: '0 7 * * 1-5',

    timezone: 'Europe/Bratislava'
}