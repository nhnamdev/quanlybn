import { supabase } from './supabaseClient';

// ============= PATIENTS =============
export const patientsQueries = {
    // Get all patients
    getAll: async() => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('createdAt', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // Get patient by ID
    getById: async(id) => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // Search patients by name or phone
    search: async(query) => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .or(`name.ilike.%${query}%,phone_number.ilike.%${query}%`)
            .order('createdAt', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // Create patient
    create: async(patientData) => {
        const { data, error } = await supabase
            .from('patients')
            .insert([{
                id: patientData.id,
                name: patientData.name,
                dob: patientData.dob,
                gender: patientData.gender,
                phone: patientData.phone_number,
                phone_number: patientData.phone_number,
                address: patientData.address || null,
                notes: patientData.notes || null,
                bloodType: patientData.bloodType || null,
                insurance: patientData.insurance || null,
                identity_number: patientData.identity_number || null,
                examination_types: patientData.examination_types || null
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Update patient
    update: async(id, patientData) => {
        const { data, error } = await supabase
            .from('patients')
            .update({
                name: patientData.name,
                dob: patientData.dob,
                gender: patientData.gender,
                phone: patientData.phone_number,
                phone_number: patientData.phone_number,
                address: patientData.address || null,
                notes: patientData.notes || null,
                bloodType: patientData.bloodType || null,
                insurance: patientData.insurance || null,
                identity_number: patientData.identity_number || null,
                examination_types: patientData.examination_types || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Delete patient
    delete: async(id) => {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};

// ============= PRESCRIPTIONS =============
export const prescriptionsQueries = {
    // Get all prescriptions with patient info
    getAll: async() => {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                patients:patient_id(name, dob, gender, phone_number),
                prescription_items(medicine_name)
            `)
            .order('prescription_date', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // Get prescriptions by patient ID
    getByPatientId: async(patientId) => {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                prescription_items(*)
            `)
            .eq('patient_id', patientId)
            .order('prescription_date', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // Get prescription details with items
    getById: async(id) => {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                prescription_items(*),
                patients:patient_id(name, dob, gender, phone_number, bloodType)
            `)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // Create prescription
    create: async(prescriptionData, items = []) => {
        // Create prescription
        const { data: prescription, error: prescError } = await supabase
            .from('prescriptions')
            .insert([{
                id: prescriptionData.id,
                patient_id: prescriptionData.patient_id,
                prescription_date: prescriptionData.prescription_date || new Date().toISOString().split('T')[0],
                diagnosis: prescriptionData.diagnosis,
                doctor_name: prescriptionData.doctor_name,
                notes: prescriptionData.notes || null
            }])
            .select()
            .single();
        if (prescError) throw prescError;

        // Insert items if provided
        if (items.length > 0) {
            const itemsToInsert = items.map(item => ({
                prescription_id: prescription.id,
                drug_id: item.drug_id || null,
                medicine_name: item.medicine_name,
                usage: item.usage,
                dose: item.dose,
                days: item.days,
                quantity: Number(item.quantity) || 1,
                unit_price: item.unit_price == null ? null : Number(item.unit_price),
                line_total: item.line_total == null ? null : Number(item.line_total)
            }));

            const { error: itemsError } = await supabase
                .from('prescription_items')
                .insert(itemsToInsert);
            if (itemsError) throw itemsError;
        }

        return prescription;
    },

    // Get all item rows for a prescription
    getItems: async(prescriptionId) => {
        const { data, error } = await supabase
            .from('prescription_items')
            .select('*')
            .eq('prescription_id', prescriptionId)
            .order('id', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Replace all items in a prescription
    replaceItems: async(prescriptionId, items = []) => {
        const { error: deleteError } = await supabase
            .from('prescription_items')
            .delete()
            .eq('prescription_id', prescriptionId);
        if (deleteError) throw deleteError;

        if (!items.length) return [];

        const payload = items.map((item) => ({
            prescription_id: prescriptionId,
            drug_id: item.drug_id || null,
            medicine_name: item.medicine_name,
            usage: item.usage || null,
            dose: item.dose || null,
            days: Number(item.days) || null,
            quantity: Number(item.quantity) || 1,
            unit_price: item.unit_price == null ? null : Number(item.unit_price),
            line_total: item.line_total == null ? null : Number(item.line_total)
        }));

        const { data, error } = await supabase
            .from('prescription_items')
            .insert(payload)
            .select('*');
        if (error) throw error;
        return data || [];
    },

    // Update prescription
    update: async(id, prescriptionData) => {
        const { data, error } = await supabase
            .from('prescriptions')
            .update({
                diagnosis: prescriptionData.diagnosis,
                doctor_name: prescriptionData.doctor_name,
                notes: prescriptionData.notes || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Delete prescription (cascade deletes items)
    delete: async(id) => {
        const { error } = await supabase
            .from('prescriptions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // Get prescriptions by date range
    getByDateRange: async(startDate, endDate) => {
        const { data, error } = await supabase
            .from('prescriptions')
            .select(`
                *,
                patients:patient_id(name, gender, dob)
            `)
            .gte('prescription_date', startDate)
            .lte('prescription_date', endDate)
            .order('prescription_date', { ascending: false });
        if (error) throw error;
        return data || [];
    }
};

// ============= PRESCRIPTION ITEMS =============
export const prescriptionItemsQueries = {
    // Get all items for a prescription
    getByPrescriptionId: async(prescriptionId) => {
        const { data, error } = await supabase
            .from('prescription_items')
            .select('*')
            .eq('prescription_id', prescriptionId)
            .order('id', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Add item to prescription
    create: async(itemData) => {
        const { data, error } = await supabase
            .from('prescription_items')
            .insert([{
                prescription_id: itemData.prescription_id,
                medicine_name: itemData.medicine_name,
                usage: itemData.usage,
                dose: itemData.dose,
                days: itemData.days
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Update item
    update: async(id, itemData) => {
        const { data, error } = await supabase
            .from('prescription_items')
            .update({
                medicine_name: itemData.medicine_name,
                usage: itemData.usage,
                dose: itemData.dose,
                days: itemData.days
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Delete item
    delete: async(id) => {
        const { error } = await supabase
            .from('prescription_items')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};

// ============= DRUGS =============
export const drugsQueries = {
    // Get all drugs
    getAll: async() => {
        const { data, error } = await supabase
            .from('drugs')
            .select('*')
            .order('drug_name', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Get drug by ID
    getById: async(id) => {
        const { data, error } = await supabase
            .from('drugs')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // Search drugs
    search: async(query) => {
        const { data, error } = await supabase
            .from('drugs')
            .select('*')
            .or(`drug_name.ilike.%${query}%,active_ingredient.ilike.%${query}%`)
            .order('drug_name', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Create drug
    create: async(drugData) => {
        const { data, error } = await supabase
            .from('drugs')
            .insert([{
                registration_number: drugData.registration_number,
                drug_name: drugData.drug_name,
                active_ingredient: drugData.active_ingredient || null,
                concentration: drugData.concentration || null,
                route: drugData.route || null,
                quantity: Number(drugData.quantity) || 0,
                unit: drugData.unit || null,
                notes: drugData.notes || null,
                price: drugData.price === "" || drugData.price == null ? null : Number(drugData.price)
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Update drug
    update: async(id, drugData) => {
        const { data, error } = await supabase
            .from('drugs')
            .update({
                registration_number: drugData.registration_number,
                drug_name: drugData.drug_name,
                active_ingredient: drugData.active_ingredient || null,
                concentration: drugData.concentration || null,
                route: drugData.route || null,
                quantity: Number(drugData.quantity) || 0,
                unit: drugData.unit || null,
                notes: drugData.notes || null,
                price: drugData.price === "" || drugData.price == null ? null : Number(drugData.price),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Get drugs by low quantity (stock alert)
    getLowStock: async(threshold = 100) => {
        const { data, error } = await supabase
            .from('drugs')
            .select('*')
            .lt('quantity', threshold)
            .order('quantity', { ascending: true });
        if (error) throw error;
        return data || [];
    }
};

// ============= MEDICINES REFERENCE =============
export const medicinesQueries = {
    // Get medicines by disease
    getByDisease: async(disease) => {
        const { data, error } = await supabase
            .from('medicines')
            .select('*')
            .ilike('disease', `%${disease}%`)
            .order('name', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    // Search medicines
    search: async(query) => {
        const { data, error } = await supabase
            .from('medicines')
            .select('*')
            .or(`name.ilike.%${query}%,disease.ilike.%${query}%`)
            .order('name', { ascending: true });
        if (error) throw error;
        return data || [];
    }
};