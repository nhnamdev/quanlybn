import { useCallback, useEffect, useState } from "react";
import { examinationTypesQueries } from "../lib/supabaseQueries";

const makeId = (label) =>
    String(label || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `exam-${Date.now()}`;

export const useExaminationTypes = (options = {}) => {
    const includeInactive = options.includeInactive === true;
    const [examinationTypes, setExaminationTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchExaminationTypes = useCallback(async() => {
        try {
            setLoading(true);
            setError(null);
            const data = await examinationTypesQueries.getAll(includeInactive);
            setExaminationTypes(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [includeInactive]);

    useEffect(() => {
        fetchExaminationTypes();
    }, [fetchExaminationTypes]);

    const addExaminationType = useCallback(async(payload) => {
        const label = String(payload ? .label || "").trim();
        const price = Number(payload ? .price) || 0;
        if (!label) throw new Error("Ten hinh thuc kham khong duoc de trong.");

        const idBase = makeId(label);
        let id = idBase;
        let count = 1;
        while (examinationTypes.some((item) => item.id === id)) {
            id = `${idBase}-${count}`;
            count += 1;
        }
        const createdItem = {
            id,
            label,
            price,
            sort_order: examinationTypes.length + 1
        };

        const created = await examinationTypesQueries.create(createdItem);
        setExaminationTypes((prev) => [...prev, created]);
        return created;
    }, [examinationTypes]);

    const updateExaminationType = useCallback(async(id, payload) => {
        const label = String(payload ? .label || "").trim();
        const price = Number(payload ? .price) || 0;
        if (!label) throw new Error("Ten hinh thuc kham khong duoc de trong.");

        const updated = await examinationTypesQueries.update(id, { label, price });
        setExaminationTypes((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return updated;
    }, []);

    const setExaminationTypeActive = useCallback(async(id, isActive) => {
        const updated = await examinationTypesQueries.setActive(id, isActive);
        setExaminationTypes((prev) => {
            if (includeInactive) {
                return prev.map((item) => (item.id === id ? updated : item));
            }
            if (!isActive) {
                return prev.filter((item) => item.id !== id);
            }
            return prev.map((item) => (item.id === id ? updated : item));
        });
        return updated;
    }, [includeInactive]);

    return {
        examinationTypes,
        loading,
        error,
        fetchExaminationTypes,
        addExaminationType,
        updateExaminationType,
        setExaminationTypeActive
    };
};