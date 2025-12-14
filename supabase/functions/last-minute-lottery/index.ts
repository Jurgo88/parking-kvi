import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Dátum pre Last-Minute Lottery (D) - Spúšťa sa ráno, pre parkovanie V TEN ISTÝ DEŇ
const todayLotteryDate = new Date();
todayLotteryDate.setDate(todayLotteryDate.getDate() + 0); // Zostávame na dnešnom dátume (D)
const todayDateString = todayLotteryDate.toISOString().split('T')[0];

// Priame volanie databázovej funkcie z Edge Function
async function callDatabaseFunction(functionName: string, targetDate: string) {
  // POZOR: Používame Service Role Key!
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
  );

  console.log(`Spúšťam LAST-MINUTE LOTÉRIU pre dátum ${targetDate}`);
  
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
    // Voláme funkciu Last-Minute
    await callDatabaseFunction('run_last_minute_lottery', todayDateString);

    return new Response(JSON.stringify({ 
      message: 'Last-Minute Lotéria (7:00) úspešne spustená.', 
      target_date: todayDateString // Dnešný dátum
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