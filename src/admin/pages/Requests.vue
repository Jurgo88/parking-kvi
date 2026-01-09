<script setup>
    import { ref, watch } from 'vue'
    import { supabase } from '@/supabase/supabaseClient'
    
    // ---- Stav ----
    const requests = ref([])
    const loading = ref(false)
    
    // Filter na deň (default dnes)
    const filterDate = ref(new Date().toISOString().slice(0, 10))
    
    // ---- Helpers ----
    function formatDate(dateStr) {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat('sk-SK', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(d)
    }
    
    // ---- Fetch cez RPC ----
    async function fetchRequests() {
      if (!filterDate.value) return
    
      loading.value = true
      requests.value = []
    
      const { data, error } = await supabase.rpc(
        'admin_requests_for_date',
        { p_date: filterDate.value }
      )
    
      if (error) {
        console.error('❌ Supabase RPC error:', error)
      } else {
        requests.value = data ?? []
      }
    
      loading.value = false
    }
    
    // automaticky refetch pri zmene dátumu
    watch(filterDate, fetchRequests, { immediate: true })
    </script>
    
    <template>
      <div class="page">
        <h1 class="title">Admin – Requests</h1>
    
        <!-- Filter -->
        <div class="filter">
          <label>
            Date:
            <input type="date" v-model="filterDate" />
          </label>
        </div>
    
        <div v-if="loading" class="loading">Loading requests…</div>
    
        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Preferred</th>
              <th>Status</th>
              <th>Allocated</th>
              <th>Lottery</th>
              <th>Score</th>
            </tr>
          </thead>
    
          <tbody>
            <tr v-for="r in requests" :key="r.request_id">
              <td>{{ r.request_id }}</td>
    
              <td>{{ r.email }}</td>
    
              <td>{{ r.preferred_section ?? '-' }}</td>
    
              <td>
                <span
                  class="badge"
                  :class="r.has_allocation ? 'success' : 'danger'"
                >
                  {{ r.has_allocation ? 'ALLOCATED' : 'NOT SELECTED' }}
                </span>
              </td>
    
              <td>
                {{ r.parking_spot_number ?? 'N/A' }}

              </td>
    
              <td>
                {{ r.lottery_type ?? '-' }}
              </td>
    
              <td>
                {{ r.lottery_score ?? '-' }}
              </td>
            </tr>
          </tbody>
        </table>
    
        <div v-if="!loading && !requests.length" class="no-more">
          No requests for selected date
        </div>
      </div>
    </template>
    
    <style scoped>
    .page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .title {
      margin-bottom: 1rem;
    }
    
    .filter {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .loading,
    .no-more {
      text-align: center;
      margin: 1rem 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th,
    td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: center;
    }
    
    th {
      background: #f4f4f4;
    }
    
    .badge {
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .success {
      background: #e6f7ee;
      color: #137a4a;
    }
    
    .danger {
      background: #fdecec;
      color: #b42318;
    }
    </style>
    