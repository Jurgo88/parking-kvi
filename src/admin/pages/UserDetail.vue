<script setup>
    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import { supabase } from '@/supabase/supabaseClient'
    
    const route = useRoute()
    const userId = route.params.id
    
    const user = ref(null)
    const requests = ref([])
    const allocations = ref([])
    const loading = ref(true)
    
    onMounted(async () => {
      loading.value = true
    
      // Načítanie používateľa
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()
    
      if (!userError) user.value = userData
    
      // Requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', userId)
    
      if (!requestsError) requests.value = requestsData
    
      // Allocations
      const { data: allocationsData, error: allocationsError } = await supabase
        .from('allocations')
        .select(`
          *,
          parking_spots (
            spot_number
          )
        `)
        .eq('user_id', userId)
    
      if (!allocationsError) allocations.value = allocationsData
    
      loading.value = false
    })
    </script>
    
    <template>
      <div class="page">
        <div v-if="loading" class="loading">
          Loading user data…
        </div>
    
        <div v-else>
          <!-- Používateľ info -->
          <h1 class="title">Name: {{ user?.name }} </h1> 
          <h2> Email: {{ user?.email }}</h2> <!-- Closed the <h2> tag properly -->
          <div class="priority">Priority points: <span class="success">{{ user?.priority_points ?? 0 }}</span></div>
    
          <!-- Requests -->
          <section class="card">
            <h2>Requests</h2>
    
            <ul v-if="requests.length" class="list">
              <li v-for="r in requests" :key="r.id" class="list-item-row">
                <div class="request-info">
                  <strong>{{ r.parking_date }}</strong>
                  <div class="muted">Preferred section: {{ r.preferred_section }}</div>
                </div>
    
                <span
                  class="badge"
                  :class="r.is_successful ? 'success' : 'danger'"
                >
                  {{ r.is_successful ? '✅ Successful' : '❌ Unsuccessful' }}
                </span>
    
                <!-- Allocation info priradená k requestu -->
                <div class="allocation-info" v-if="allocations.length">
                  <span
                    v-for="a in allocations.filter(a => a.parking_date === r.parking_date)"
                    :key="a.id"
                  >
                    – Section: {{ a.section_allocated }} 
                    – 🚗 Spot: {{ a.parking_spots?.spot_number ?? 'N/A' }}
                  </span>
                </div>
              </li>
            </ul>
    
            <p v-else class="empty">No requests found.</p>
          </section>
        </div>
      </div>
    </template>
    
    <style scoped>
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    
    .title {
      margin-bottom: 0.25rem;
    }
    
    .priority {
      font-size: 2.0rem;
      color: #555;
      margin-bottom: 1rem;
    }
    .priority span {
      font-weight: bold;
    }
    
    .loading {
      text-align: center;
      color: #666;
    }
    
    .card {
      background: #fff;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .list-item-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
      align-items: center;
    }
    
    .list-item-row:last-child {
      border-bottom: none;
    }
    
    .request-info {
      min-width: 150px;
    }
    
    .muted {
      font-size: 0.85rem;
      color: #666;
    }
    
    .allocation-info {
      font-size: 0.85rem;
      color: #333;
      margin-left: 0.5rem;
    }
    
    .badge {
      padding: 0.2rem 0.5rem;
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
    
    .empty {
      color: #777;
      font-style: italic;
    }
    </style>
    