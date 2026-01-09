<script setup>
    import { ref, watch } from "vue"
    import { supabase } from "@/supabase/supabaseClient"
    
    const selectedDate = ref(new Date().toISOString().slice(0, 10))
    const parkingData = ref([])
    
    async function fetchParking() {
      const { data, error } = await supabase
        .rpc("admin_parking_status_for_date", {
            p_date: selectedDate.value
        })
    
      if (error) {
        console.error("❌ Supabase error:", error)
      } else {
        parkingData.value = data
      }
    }
    
    watch(selectedDate, fetchParking, { immediate: true })
    </script>
    
    
    
    <template>
      <div class="admin-parking">
        <h1>Admin Parking Status</h1>
    
        <label>
          Date:
          <input type="date" v-model="selectedDate" />
        </label>
    
        <table>
          <thead>
            <tr>
              <th>Spot</th>
              <th>Section</th>
              <th>Status</th>
              <th>User</th>
              <!-- <th>Points</th> -->
              <th>Lottery Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in parkingData" :key="row.spot_id">
                <td>{{ row.spot_number }}</td>
                <td>{{ row.section_code }}</td>
                <td>
                    <span :class="row.user_id ? 'taken' : 'free'">
                    {{ row.user_id ? "🔴 Taken" : "🟢 Free" }}
                    </span>
                </td>
                <td>{{ row.user_id ? row.email : "-" }}</td>
                <!-- <td>{{ row.user_id ? row.priority_points : "-" }}</td> -->
                <td>{{ row.lottery_type || "-" }}</td>
                </tr>

          </tbody>
        </table>
      </div>
    </template>
    
    <style>
    .free {
      color: green;
    }
    .taken {
      color: red;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td, th {
      padding: 8px;
      border: 1px solid #ddd;
    }
    </style>
    