import 'dotenv/config'   // načíta premenné z .env
import { createClient } from "@supabase/supabase-js"

// --- Supabase client ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// --- pomocné funkcie ---
function addDays(date, days) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function formatDate(date) {
  return date.toISOString().split("T")[0]
}

// --- bulk lottery simulácia ---
async function runBulkLotteryForDate(parkingDate) {
  console.log(`🎯 Bulk Lottery for ${parkingDate}`)
  try {
    const res = await supabase.rpc("run_bulk_lottery", { target_date: parkingDate })
    if (res.error) console.error("❌ Bulk lottery error:", res.error)
  } catch (err) {
    console.error("❌ Bulk lottery exception:", err)
  }
}

// --- last minute lottery simulácia ---
async function runLastMinuteLotteryForDate(parkingDate) {
  console.log(`🕐 Last-Minute Lottery for ${parkingDate}`)
  try {
    const res = await supabase.rpc("run_last_minute_lottery", { target_date: parkingDate })
    if (res.error) console.error("❌ Last-minute lottery error:", res.error)
  } catch (err) {
    console.error("❌ Last-minute lottery exception:", err)
  }
}

// --- generovanie requestov pre deň ---
// async function generateRequestsForDate(targetDate) {
//   console.log(`📝 Generating requests for ${targetDate}`)
//   const { data: users } = await supabase.from("users").select("user_id")
  
//   // určujeme počet requestov podľa dňa v týždni
//   // pondelok-streda viac, štvrtok-piatok menej, víkend najmenej
//   const dayOfWeek = new Date(targetDate).getDay() // 0=nedeľa ... 6=sobota
//   let minRequests = 10, maxRequests = 30
//   if (dayOfWeek >= 1 && dayOfWeek <= 3) maxRequests = 50   // pondelok-streda
//   if (dayOfWeek === 4 || dayOfWeek === 5) maxRequests = 25  // štvrtok-piatok
//   if (dayOfWeek === 0 || dayOfWeek === 6) maxRequests = 15  // víkend

//   const requestCount = Math.floor(Math.random() * (maxRequests - minRequests + 1)) + minRequests
//   const shuffledUsers = [...users].sort(() => Math.random() - 0.5)
//   const requestsToInsert = shuffledUsers.slice(0, requestCount).map(u => ({
//     user_id: u.user_id,
//     parking_date: targetDate,
//     preferred_section: null
//   }))

//   if (requestsToInsert.length) {
//     await supabase.from("requests").insert(requestsToInsert)
//     console.log(`📝 ${requestsToInsert.length} requests generated for ${targetDate}`)
//   }
// }

// --- spustenie simulácie ---
async function runMonthlySimulation() {
  const startDate = new Date("2026-01-01")
  const endDate = new Date("2026-01-31")

  // vyčisti alokácie a requesty
//   await supabase.from("allocations").delete()
//   await supabase.from("requests").delete()
//   console.log("🗑️ All previous allocations and requests deleted")

  let currentDate = startDate
  while (currentDate <= endDate) {
    const targetDate = formatDate(currentDate)

    // --- generovanie requestov ---
    // await generateRequestsForDate(targetDate)

    // Bulk lottery: D+2
    const bulkDate = formatDate(addDays(currentDate, -2))
    await runBulkLotteryForDate(bulkDate)

    // Last-minute lottery: D+1
    const lastMinuteDate = formatDate(addDays(currentDate, -1))
    await runLastMinuteLotteryForDate(lastMinuteDate)

    currentDate = addDays(currentDate, 1)
  }

  console.log("✅ Monthly simulation completed")

  // --- štatistiky ---
  const { data: allocations } = await supabase.from("allocations").select("*")
  const { data: requests } = await supabase.from("requests").select("user_id")
  const { data: users } = await supabase.from("users").select("user_id, email")

  const userStats = {}
  users.forEach(u => userStats[u.user_id] = { email: u.email, requests: 0, allocations: 0 })
  requests.forEach(r => { if (userStats[r.user_id]) userStats[r.user_id].requests++ })
  allocations.forEach(a => { if (userStats[a.user_id]) userStats[a.user_id].allocations++ })

  console.log("\n📊 Statistics:")
  console.log("📌 Allocations per user:")
  for (const uid in userStats) {
    const s = userStats[uid]
    console.log(`- ${s.email}: requests=${s.requests}, allocations=${s.allocations}`)
  }

  const allocationsPerSection = {}
  allocations.forEach(a => {
    allocationsPerSection[a.section_allocated] = (allocationsPerSection[a.section_allocated] || 0) + 1
  })
  console.log("\n📌 Allocations per section:")
  for (const sec in allocationsPerSection) console.log(`- ${sec}: ${allocationsPerSection[sec]}`)

  const allocationsPerDay = {}
  allocations.forEach(a => {
    allocationsPerDay[a.parking_date] = (allocationsPerDay[a.parking_date] || 0) + 1
  })

  const requestsPerDay = {}
  requests.forEach(r => {
    requestsPerDay[r.parking_date] = (requestsPerDay[r.parking_date] || 0) + 1
  })

  console.log("\n📌 Requests per day:")
  for (const day in requestsPerDay) console.log(`- ${day}: ${requestsPerDay[day]}`)
    console.log("\n📌 Allocations per day:")
  for (const day in allocationsPerDay) console.log(`- ${day}: ${allocationsPerDay[day]}`)
}

// --- spustenie ---
runMonthlySimulation()
