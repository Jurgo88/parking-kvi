import { createClient } from "@supabase/supabase-js"

export const config = {
  schedule: "0 20 * * *", // test: každú minútu
}

const RANDOM_MAX = 10

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
    const { data: existing, error: existingErr } = await supabase
      .from("allocations")
      .select("allocation_id")
      .eq("parking_date", parkingDate)
      .limit(1)

    if (existingErr) {
      console.error("❌ DB error checking existing allocations:", existingErr)
      throw existingErr
    }

    if (existing?.length) {
      console.log("⛔ Allocations already exist, exiting")
      return
    }

    // --- sekcie ---
    const { data: sections = [], error: sectionsErr } = await supabase
      .from("parking_configuration")
      .select("*")
      .order("lottery_order")

    if (sectionsErr) {
      console.error("❌ DB error loading sections:", sectionsErr)
      throw sectionsErr
    }

    console.log(
      "🅰️ Sections:",
      sections.map(s => `${s.section_code}(${s.bulk_allocation_limit})`).join(", ")
    )

    // --- requests ---
    const { data: requests = [], error: requestsErr } = await supabase
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

    if (requestsErr) {
      console.error("❌ DB error loading requests:", requestsErr)
      throw requestsErr
    }

    console.log("🅱️ Requests found:", (requests || []).length)
    if (!requests || !requests.length) return

    // --- skóre ---
    const scored = requests
      .map(r => {
        const rand = Math.floor(Math.random() * (RANDOM_MAX + 1))
        const userPoints = Number(r.users?.priority_points) || 0
        const score = userPoints + rand
        console.log(
          `🎲 ${r.users?.email || r.users?.user_id}: base=${userPoints}, rand=${rand}, score=${score}`
        )
        return { ...r, score }
      })
      .sort((a, b) => b.score - a.score)

    // --- načítaj VOĽNÉ MIESTA ---
    const { data: occupied = [], error: occupiedErr } = await supabase
      .from("allocations")
      .select("parking_spot_id")
      .eq("parking_date", parkingDate)

    if (occupiedErr) {
      console.error("❌ DB error loading occupied allocations:", occupiedErr)
      throw occupiedErr
    }

    const occupiedIds = new Set((occupied || []).map(o => o.parking_spot_id))

    const { data: allSpots = [], error: spotsErr } = await supabase
      .from("parking_spots")
      .select("*")

    if (spotsErr) {
      console.error("❌ DB error loading parking_spots:", spotsErr)
      throw spotsErr
    }

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
      capacity[s.section_code] = Number(s.bulk_allocation_limit) || 0
    })

    const allocations = []
    const allocatedUsers = new Set()

    // --- ALOKÁCIA ---
    for (const r of scored) {
      const userId = r.users?.user_id
      if (!userId) continue
      if (allocatedUsers.has(userId)) continue

      let chosenSection = null

      // preferencia
      if (
        r.preferred_section &&
        (capacity[r.preferred_section] || 0) > 0 &&
        (freeSpotsBySection[r.preferred_section]?.length || 0) > 0
      ) {
        chosenSection = r.preferred_section
      }

      // fallback
      if (!chosenSection) {
        for (const s of sections) {
          if (
            (capacity[s.section_code] || 0) > 0 &&
            (freeSpotsBySection[s.section_code]?.length || 0) > 0
          ) {
            chosenSection = s.section_code
            break
          }
        }
      }

      if (!chosenSection) {
        console.log(`❌ No free spot for ${r.users?.email || r.users?.user_id}`)
        continue
      }

      const spot = freeSpotsBySection[chosenSection].shift()
      if (!spot) {
        console.log(`❌ No spot object available for section ${chosenSection} for ${r.users?.email}`)
        continue
      }

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
        `🅿️ Allocated ${r.users?.email || r.users?.user_id} → ${spot.spot_number}`
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
        const uid = r.users?.user_id
        if (!uid) continue
        const delta = allocatedUsers.has(uid) ? -5 : +1

        // Preferred approach: have a DB RPC that performs atomic increment:
        // CREATE FUNCTION increment_user_priority_points(p_user_id uuid, p_delta int) ...
        // and then call the rpc below. If it exists, it will provide atomic increment.
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc("increment_priority_points", {
            p_user_id: uid,
            p_delta: delta,
          })

          if (rpcErr) {
            console.warn("⚠️ RPC increment_priority_points failed:", rpcErr)

            // fallback: read fresh value a deterministicky update
            const { data: userRow, error: selErr } = await supabase
              .from("users")
              .select("priority_points")
              .eq("user_id", uid)
              .single()

            if (selErr) {
              console.error("❌ Failed to read user for fallback:", selErr)
              continue
            }

            const current = Number(userRow?.priority_points) || 0
            const newVal = current + delta

            const { error: updErr } = await supabase
              .from("users")
              .update({ priority_points: newVal })
              .eq("user_id", uid)

            if (updErr) {
              console.error("❌ Fallback UPDATE failed for user", uid, ":", updErr)
            } else {
              console.log(`🔁 Fallback updated user ${uid} priority_points: ${current} → ${newVal}`)
            }
          } else {
            console.log(`✅ RPC increment_priority_points OK for ${uid} (delta=${delta})`, rpcData)
          }
        } catch (rpcException) {
          console.error("❌ RPC exception increment_priority_points:", rpcException)

          // fallback same as above
          try {
            const { data: userRow, error: selErr } = await supabase
              .from("users")
              .select("priority_points")
              .eq("user_id", uid)
              .single()

            if (selErr) {
              console.error("❌ Failed to read user for fallback after RPC exception:", selErr)
              continue
            }

            const current = Number(userRow?.priority_points) || 0
            const newVal = current + delta

            const { error: updErr } = await supabase
              .from("users")
              .update({ priority_points: newVal })
              .eq("user_id", uid)

            if (updErr) {
              console.error("❌ Fallback UPDATE failed for user", uid, ":", updErr)
            } else {
              console.log(`🔁 Fallback updated user ${uid} priority_points: ${current} → ${newVal}`)
            }
          } catch (finalErr) {
            console.error("❌ Unexpected fallback error for", uid, finalErr)
          }
        }
      }
    }

    console.log("🏁 DAILY LOTTERY FINISHED")
  } catch (err) {
    console.error("🔥 DAILY LOTTERY FAILED:", err)
    throw err
  }
}