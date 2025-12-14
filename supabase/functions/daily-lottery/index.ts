import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Dátum pre Bulk Lottery (D+2) - Spúšťa sa večer, pre parkovanie o 2 dni
const bulkLotteryDate = new Date();
bulkLotteryDate.setDate(bulkLotteryDate.getDate() + 2); 
const bulkDateString = bulkLotteryDate.toISOString().split('T')[0];

// Priame volanie databázovej funkcie z Edge Function
async function callDatabaseFunction(functionName: string, targetDate: string) {
  // POZOR: Používame Service Role Key!
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
  );

  console.log(`Spúšťam BULK LOTÉRIU pre dátum ${targetDate}`);
  
  const { error } = await supabaseAdmin.rpc(functionName, { 
      target_date: targetDate 
  });

  if (error) {
    console.error(`Chyba pri ${functionName}:`, error);
    return { success: false, error: error.message };
  }
  return { success: true };
}


Deno.serve(async (req) => {
  try {
    // Iba Bulk Lotéria
    await callDatabaseFunction('run_bulk_lottery', bulkDateString);

    return new Response(JSON.stringify({ 
      message: 'Bulk Lotéria (21:00) úspešne spustená.', 
      target_date: bulkDateString,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});