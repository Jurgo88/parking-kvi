import { createClient } from "https://esm.sh/@supabase/supabase-js@2"


// Inline scheduled function – každý deň o 06:00
export const config = {
  schedule: "0 /1 * * *",
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

)

const RANDOM_MAX = 50
const RESERVED_LAST_MINUTE = 5

export default async (event) => {
  try {
    // --- dátum lotérie ---
    let targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 2)
    const parkingDate = targetDate.toISOString().split("T")[0]
    console.log("📅 Running bulk lottery for date:", parkingDate)

    // --- načítanie sekcií ---
    const { data: sections, error: secErr } = await supabase
      .from("parking_configuration")
      .select("*")
      .order("lottery_order")
    if (secErr) console.error("❌ Sections error:", secErr)
    console.log("🅰️ Sections found:", sections?.length)

    // --- načítanie requestov ---
    const { data: requests, error: reqErr } = await supabase
      .from("requests")
      .select(`
        request_id,
        preferred_section,
        users (
          user_id,
          priority_points
        )
      `)
      .eq("parking_date", parkingDate)
    if (reqErr) console.error("❌ Requests error:", reqErr)
    console.log("🅱️ Requests found:", requests?.length)

    if (!requests || requests.length === 0) {
      return new Response(`No requests for ${parkingDate}`, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      })
    }

    // --- kontrola users ---
    requests.forEach((r) => {
      if (!r.users) console.warn("⚠️ Request missing user:", r.request_id)
    })

    // --- vypocet skóre ---
    const scored = requests.map((r) => {
      const random = Math.floor(Math.random() * (RANDOM_MAX + 1))
      const score = r.users ? r.users.priority_points + random : random
      return { ...r, score, random }
    })
    scored.sort((a, b) => b.score - a.score)

    // --- alokácie ---
    const allocations = []
    const allocatedUsers = new Set()

    for (const section of sections) {
      let capacity = section.max_capacity - RESERVED_LAST_MINUTE
      console.log(`🔹 Section ${section.section_code} capacity:`, capacity)
      if (capacity <= 0) continue

      for (const req of scored) {
        if (!req.users) continue
        if (capacity <= 0) break
        if (allocatedUsers.has(req.users.user_id)) continue

        if (req.preferred_section && req.preferred_section !== section.section_code) {
          console.log(
            `⏩ Skipping user ${req.users.user_id} (pref ${req.preferred_section})`
          )
          continue
        }

        allocations.push({
          request_id: req.request_id,
          user_id: req.users.user_id,
          parking_date: parkingDate,
          section_allocated: section.section_code,
          lottery_type: "bulk",
          lottery_score: req.score,
          random_max: RANDOM_MAX,
          points_change: 0,
        })

        allocatedUsers.add(req.users.user_id)
        capacity--
      }
    }

    console.log("✅ Allocations prepared:", allocations.length)

    // --- debug mód: zapíš len ak allocations existujú ---
    if (allocations.length > 0) {
      const { error: insertErr } = await supabase
        .from("allocations")
        .insert(allocations)
      if (insertErr) console.error("❌ Insert error:", insertErr)
      else console.log("💾 Allocations inserted")
    }

    // --- body používateľov ---
    for (const req of scored) {
      if (!req.users) continue
      const won = allocatedUsers.has(req.users.user_id)
      const pointsChange = won ? -5 : +1

      const { error: updateErr } = await supabase
        .from("users")
        .update({
          priority_points: req.users.priority_points + pointsChange,
        })
        .eq("user_id", req.users.user_id)
      if (updateErr) console.error("❌ Update points error:", updateErr)
    }

    return new Response(
      JSON.stringify({
        date: parkingDate,
        allocationsPrepared: allocations.length,
      }),
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (err) {
    console.error("🔥 Lottery failed:", err)
    return new Response(err.message || "Lottery failed", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
