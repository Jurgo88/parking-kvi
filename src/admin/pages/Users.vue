<script setup>
    import { onMounted, ref } from 'vue'
    import { supabase } from "@/supabase/supabaseClient"
    
    const users = ref([])
    const loading = ref(true)
    
    function formatDate(d) {
      if (!d) return '-'
      return new Date(d).toLocaleDateString('sk-SK')
    }
    
    onMounted(async () => {
      const { data, error } = await supabase
        .from('admin_users_overview')
        .select('*')
        .order('success_rate', { ascending: false })
    
      if (error) {
        console.error('❌ Users load error:', error)
      } else {
        users.value = data
      }
    
      loading.value = false
    })
    </script>
    
    <template>
      <div class="page">
        <h1>Admin – Users</h1>
    
        <div v-if="loading">Loading users…</div>
    
        <table v-else>
          <thead>
            <tr>
              <th>Email</th>
              <th>Points</th>
              <th>Requests</th>
              <th>Allocations</th>
              <th>Success</th>
              <th>Last Allocation</th>
            </tr>
          </thead>
    
          <tbody>
            <tr v-for="u in users" :key="u.user_id">
              <td>
                <RouterLink :to="`/admin/users/${u.user_id}`">
                  {{ u.email }}
                </RouterLink>
              </td>
    
              <td>{{ u.priority_points }}</td>
              <td>{{ u.requests_count }}</td>
              <td>{{ u.allocations_count }}</td>
    
              <td>
                <span
                  class="badge"
                  :class="u.success_rate >= 50 ? 'success' : 'danger'"
                >
                  {{ u.success_rate }} %
                </span>
              </td>
    
              <td>{{ formatDate(u.last_allocated_date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    
    <style scoped>
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: center;
    }
    
    th {
      background: #f4f4f4;
    }
    
    .badge {
      padding: 0.2rem 0.6rem;
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
    