import { createClient } from "@supabase/supabase-js"

export const config = {
  schedule: "0 20 * * *", // test: každú minútu
}

const RANDOM_MAX = 100

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(event) {
  try {
    const DRY_RUN = event.queryStringParameters?.dryRun === "true"

    console.log("🚀 DAILY LOTTERY STARTED")
    console.log("🧪 Dry run:", DRY_RUN)

    // --- D+2 ---
    const d = new Date()
    d.setDate(d.getDate() + 2)
    const parkingDate = d.toISOString().split("T")[0]
    console.log("📆 Parking date:", parkingDate)

    // --- ochrana proti opakovaniu ---
    const { data: existing } = await supabase
      .from("allocations")
      .select("allocation_id")
      .eq("parking_date", parkingDate)
      .limit(1)

    if (existing?.length) {
      console.log("⛔ Allocations already exist, exiting")
      return
    }

    // --- sekcie ---
    const { data: sections } = await supabase
      .from("parking_configuration")
      .select("*")
      .order("lottery_order")

    console.log(
      "🅰️ Sections:",
      sections.map(s => `${s.section_code}(${s.bulk_allocation_limit})`).join(", ")
    )

    // --- requests ---
    const { data: requests } = await supabase
      .from("requests")
      .select(`
        request_id,
        preferred_section,
        users (
          user_id,
          email,
          priority_points
        )
      `)
      .eq("parking_date", parkingDate)

    console.log("🅱️ Requests found:", requests.length)
    if (!requests.length) return

    // --- skóre ---
    const scored = requests
      .map(r => {
        const rand = Math.floor(Math.random() * (RANDOM_MAX + 1))
        const score = r.users.priority_points + rand
        console.log(
          `🎲 ${r.users.email}: base=${r.users.priority_points}, rand=${rand}, score=${score}`
        )
        return { ...r, score }
      })
      .sort((a, b) => b.score - a.score)

    // --- načítaj VOĽNÉ MIESTA ---
    const { data: occupied } = await supabase
      .from("allocations")
      .select("parking_spot_id")
      .eq("parking_date", parkingDate)

    const occupiedIds = new Set(occupied.map(o => o.parking_spot_id))

    const { data: allSpots } = await supabase
      .from("parking_spots")
      .select("*")

    const freeSpotsBySection = {}
    allSpots.forEach(s => {
      if (occupiedIds.has(s.id)) return
      if (!freeSpotsBySection[s.section]) {
        freeSpotsBySection[s.section] = []
      }
      freeSpotsBySection[s.section].push(s)
    })

    sections.forEach(s =>
      console.log(
        `🅿️ Free spots ${s.section_code}:`,
        freeSpotsBySection[s.section_code]?.length || 0
      )
    )

    // --- kapacity ---
    const capacity = {}
    sections.forEach(s => {
      capacity[s.section_code] = s.bulk_allocation_limit
    })

    const allocations = []
    const allocatedUsers = new Set()

    // --- ALOKÁCIA ---
    for (const r of scored) {
      const userId = r.users.user_id
      if (allocatedUsers.has(userId)) continue

      let chosenSection = null

      // preferencia
      if (
        r.preferred_section &&
        capacity[r.preferred_section] > 0 &&
        freeSpotsBySection[r.preferred_section]?.length
      ) {
        chosenSection = r.preferred_section
      }

      // fallback
      if (!chosenSection) {
        for (const s of sections) {
          if (
            capacity[s.section_code] > 0 &&
            freeSpotsBySection[s.section_code]?.length
          ) {
            chosenSection = s.section_code
            break
          }
        }
      }

      if (!chosenSection) {
        console.log(`❌ No free spot for ${users.email}`)
        continue
      }

      const spot = freeSpotsBySection[chosenSection].shift()

      allocations.push({
        request_id: r.request_id,
        user_id: userId,
        parking_date: parkingDate,
        section_allocated: chosenSection,
        parking_spot_id: spot.id,
        lottery_type: "bulk",
        lottery_score: r.score,
        random_max: RANDOM_MAX,
        points_change: -5,
      })

      capacity[chosenSection]--
      allocatedUsers.add(userId)

      console.log(
        `🅿️ Allocated ${r.users.email} → ${spot.spot_number}`
      )
    }

    console.log("✅ Allocations prepared:", allocations.length)

    // --- zápis ---
    if (!DRY_RUN && allocations.length) {
        console.log(`💾 Inserting ${allocations.length} allocations`)
    
        const { error: insertError } = await supabase
        .from("allocations")
        .insert(allocations)
    
        if (insertError) {
        console.error("❌ INSERT FAILED:", insertError)
        throw insertError
        }
    
        console.log("✅ Allocations successfully inserted")
    }
    
    // --- body ---
    if (!DRY_RUN) {
      for (const r of scored) {
        const delta = allocatedUsers.has(r.users.user_id) ? -5 : +1
        await supabase
          .from("users")
          .update({
            priority_points: r.users.priority_points + delta,
          })
          .eq("user_id", r.users.user_id)
      }
    }

    console.log("🏁 DAILY LOTTERY FINISHED")
  } catch (err) {
    console.error("🔥 DAILY LOTTERY FAILED:", err)
    throw err
  }
}
