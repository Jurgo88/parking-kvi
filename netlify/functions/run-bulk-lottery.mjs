import { createClient } from "@supabase/supabase-js"

/**
 * Inline CRON – Netlify Scheduled Function
 * Spúšťa sa každý deň o 06:00
 */
export const config = {
  schedule: "0 6 * * *",
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const RANDOM_MAX = 50
const RESERVED_LAST_MINUTE = 5

export default async (event, context) => {
  try {
    /** 📅 dátum = dnes + 2 dni */
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 2)
    const parkingDate = targetDate.toISOString().split("T")[0]

    /* 1️⃣ Konfigurácia sekcií */
    const { data: sections, error: secErr } = await supabase
      .from("parking_configuration")
      .select("*")
      .order("lottery_order")

    if (secErr) throw secErr

    /* 2️⃣ Requesty na daný deň */
    const { data: requests, error: reqErr } = await supabase
      .from("requests")
      .select(`
        request_id,
        parking_date,
        preferred_section,
        users (
          user_id,
          priority_points
        )
      `)
      .eq("parking_date", parkingDate)

    if (reqErr) throw reqErr
    if (!requests || requests.length === 0) {
      return {
        statusCode: 200,
        body: `No requests for ${parkingDate}`,
      }
    }

    /* 3️⃣ Výpočet skóre */
    const scored = requests.map((r) => {
      const random = Math.floor(Math.random() * (RANDOM_MAX + 1))
      const score = random + r.users.priority_points

      return {
        ...r,
        score,
        random,
      }
    })

    /* 4️⃣ Zoradenie */
    scored.sort((a, b) => b.score - a.score)

    /* 5️⃣ Alokácia */
    const allocations = []
    const allocatedUsers = new Set()

    for (const section of sections) {
      let capacity = section.max_capacity - RESERVED_LAST_MINUTE
      if (capacity <= 0) continue

      for (const req of scored) {
        if (capacity <= 0) break
        if (allocatedUsers.has(req.users.user_id)) continue

        if (
          req.preferred_section &&
          req.preferred_section !== section.section_code
        ) {
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

    /* 6️⃣ Insert alokácií */
    if (allocations.length) {
      const { error } = await supabase
        .from("allocations")
        .insert(allocations)

      if (error) throw error
    }

    /* 7️⃣ Update bodov */
    for (const req of scored) {
      const won = allocatedUsers.has(req.users.user_id)
      const pointsChange = won ? -5 : +1

      await supabase
        .from("users")
        .update({
          priority_points:
            req.users.priority_points + pointsChange,
        })
        .eq("user_id", req.users.user_id)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        date: parkingDate,
        allocated: allocations.length,
      }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: err.message || "Bulk lottery failed",
    }
  }
}
