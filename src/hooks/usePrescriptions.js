import { useState, useEffect } from 'react';
import { prescriptionsQueries } from '../lib/supabaseQueries';

export const usePrescriptions = (patientId = null) => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch prescriptions
    const fetchPrescriptions = async() => {
        try {
            setLoading(true);
            setError(null);
            let data;
            if (patientId) {
                data = await prescriptionsQueries.getByPatientId(patientId);
            } else {
                data = await prescriptionsQueries.getAll();
            }
            setPrescriptions(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching prescriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get prescription details
    const getPrescription = async(id) => {
        try {
            setError(null);
            return await prescriptionsQueries.getById(id);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching prescription:', err);
            throw err;
        }
    };

    // Get by date range
    const getPrescriptionsByDateRange = async(startDate, endDate) => {
        try {
            setLoading(true);
            setError(null);
            const data = await prescriptionsQueries.getByDateRange(startDate, endDate);
            setPrescriptions(data);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching prescriptions by date:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create prescription
    const createPrescription = async(prescriptionData, items = []) => {
        try {
            setError(null);
            const newPrescription = await prescriptionsQueries.create(prescriptionData, items);
            setPrescriptions([newPrescription, ...prescriptions]);
            return newPrescription;
        } catch (err) {
            setError(err.message);
            console.error('Error creating prescription:', err);
            throw err;
        }
    };

    // Update prescription
    const updatePrescription = async(id, prescriptionData) => {
        try {
            setError(null);
            const updated = await prescriptionsQueries.update(id, prescriptionData);
            setPrescriptions(prescriptions.map(p => p.id === id ? updated : p));
            return updated;
        } catch (err) {
            setError(err.message);
            console.error('Error updating prescription:', err);
            throw err;
        }
    };

    // Get prescription items
    const getPrescriptionItems = async(id) => {
        try {
            setError(null);
            return await prescriptionsQueries.getItems(id);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching prescription items:', err);
            throw err;
        }
    };

    // Replace prescription items
    const replacePrescriptionItems = async(id, items = []) => {
        try {
            setError(null);
            return await prescriptionsQueries.replaceItems(id, items);
        } catch (err) {
            setError(err.message);
            console.error('Error replacing prescription items:', err);
            throw err;
        }
    };

    // Delete prescription
    const deletePrescription = async(id) => {
        try {
            setError(null);
            await prescriptionsQueries.delete(id);
            setPrescriptions(prescriptions.filter(p => p.id !== id));
        } catch (err) {
            setError(err.message);
            console.error('Error deleting prescription:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, [patientId]);

    return {
        prescriptions,
        loading,
        error,
        fetchPrescriptions,
        getPrescription,
        getPrescriptionsByDateRange,
        createPrescription,
        updatePrescription,
        deletePrescription,
        getPrescriptionItems,
        replacePrescriptionItems
    };
};