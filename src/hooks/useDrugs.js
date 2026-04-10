import { useState, useEffect } from 'react';
import { drugsQueries } from '../lib/supabaseQueries';

export const useDrugs = () => {
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all drugs
    const fetchDrugs = async() => {
        try {
            setLoading(true);
            setError(null);
            const data = await drugsQueries.getAll();
            setDrugs(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching drugs:', err);
        } finally {
            setLoading(false);
        }
    };

    // Search drugs
    const searchDrugs = async(query) => {
        try {
            setLoading(true);
            setError(null);
            if (!query.trim()) {
                await fetchDrugs();
            } else {
                const data = await drugsQueries.search(query);
                setDrugs(data);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error searching drugs:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add drug
    const addDrug = async(drugData) => {
        try {
            setLoading(true);
            setError(null);
            const created = await drugsQueries.create(drugData);
            setDrugs((prev) => [created, ...prev]);
            return created;
        } catch (err) {
            setError(err.message);
            console.error('Error creating drug:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get low stock drugs
    const getLowStockDrugs = async(threshold) => {
        try {
            setLoading(true);
            setError(null);
            const data = await drugsQueries.getLowStock(threshold);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching low stock drugs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrugs();
    }, []);

    return {
        drugs,
        loading,
        error,
        fetchDrugs,
        searchDrugs,
        getLowStockDrugs,
        addDrug
    };
};