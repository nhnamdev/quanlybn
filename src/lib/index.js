// Barrel export for lib modules
export { supabase, testConnection }
from './supabaseClient';
export {
    patientsQueries,
    prescriptionsQueries,
    prescriptionItemsQueries,
    drugsQueries,
    medicinesQueries
}
from './supabaseQueries';