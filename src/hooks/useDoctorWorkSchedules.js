import { useCallback, useEffect, useState } from "react";
import { doctorWorkSchedulesQueries } from "../lib/supabaseQueries";

export const useDoctorWorkSchedules = (options = {}) => {
    const includeInactive = options.includeInactive === true;
    const [workSchedules, setWorkSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWorkSchedules = useCallback(async() => {
        try {
            setLoading(true);
            setError(null);
            const data = await doctorWorkSchedulesQueries.getAll(includeInactive);
            setWorkSchedules(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [includeInactive]);

    useEffect(() => {
        fetchWorkSchedules();
    }, [fetchWorkSchedules]);

    const updateWorkSchedule = useCallback(async(dayKey, payload) => {
        const dayLabel = String(payload?.day_label || "").trim();
        const scheduleText = String(payload?.schedule_text || "").trim();

        if (!dayLabel) throw new Error("Tên ngày không được để trống.");
        if (!scheduleText) throw new Error("Nội dung lịch làm việc không được để trống.");

        const updated = await doctorWorkSchedulesQueries.update(dayKey, {
            day_label: dayLabel,
            schedule_text: scheduleText
        });

        setWorkSchedules((prev) =>
            prev.map((item) => (item.day_key === dayKey ? updated : item))
        );
        return updated;
    }, []);

    return {
        workSchedules,
        loading,
        error,
        fetchWorkSchedules,
        updateWorkSchedule
    };
};
