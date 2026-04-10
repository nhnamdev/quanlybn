import { useState, useEffect } from 'react';
import { patientsQueries } from '../lib/supabaseQueries';

export const usePatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all patients
    const fetchPatients = async() => {
        try {
            setLoading(true);
            setError(null);
            const data = await patientsQueries.getAll();
            setPatients(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    // Search patients
    const searchPatients = async(query) => {
        try {
            setLoading(true);
            setError(null);
            if (!query.trim()) {
                await fetchPatients();
            } else {
                const data = await patientsQueries.search(query);
                setPatients(data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error searching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add patient
    const addPatient = async(patientData) => {
        try {
            setError(null);
            const newPatient = await patientsQueries.create(patientData);
            setPatients([newPatient, ...patients]);
            return newPatient;
        } catch (err) {
            setError(err.message);
            console.error('Error adding patient:', err);
            throw err;
        }
    };

    // Update patient
    const updatePatient = async(id, patientData) => {
        try {
            setError(null);
            const updated = await patientsQueries.update(id, patientData);
            setPatients(patients.map(p => p.id === id ? updated : p));
            return updated;
        } catch (err) {
            setError(err.message);
            console.error('Error updating patient:', err);
            throw err;
        }
    };

    // Delete patient
    const deletePatient = async(id) => {
        try {
            setError(null);
            await patientsQueries.delete(id);
            setPatients(patients.filter(p => p.id !== id));
        } catch (err) {
            setError(err.message);
            console.error('Error deleting patient:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return {
        patients,
        loading,
        error,
        fetchPatients,
        searchPatients,
        addPatient,
        updatePatient,
        deletePatient
    };
};