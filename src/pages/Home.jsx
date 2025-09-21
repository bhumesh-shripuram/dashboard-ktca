import React, { useEffect, useMemo, useState } from "react";
import { getAll } from "../service"; // adjust path if needed
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function Home({ attendees: initialAttendees, fetchUrl, height = 300 }) {
  const [rows, setRows] = useState(initialAttendees ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch attendees if parent didn't provide them
  useEffect(() => {
    let cancelled = false;

    if (initialAttendees && initialAttendees.length) {
      setRows(initialAttendees);
      return;
    }

    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAll();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // legacy: if fetchUrl is provided, prefer it
    if (!initialAttendees && fetchUrl) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(fetchUrl, { headers: { Accept: "application/json" } });
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const json = await res.json();
          if (!cancelled) setRows(Array.isArray(json) ? json : json.data || []);
        } catch (err) {
          if (!cancelled) setError(err?.message ?? String(err));
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    } else if (!initialAttendees) {
      loadAll();
    }

    return () => {
      cancelled = true;
    };
  }, [initialAttendees, fetchUrl]);

  const totals = useMemo(() => {
    const acc = {
      registeredAdults: 0,
      actualAdults: 0,
      registeredChildren: 0,
      actualChildren: 0,
      noOfPresent: 0,
      noOfAbsent:0
    };

    for (const r of rows) {
      const regA = r.no_of_reg_adults ?? r.noOfRegAdults ?? r.registeredAdults ?? 0;
      const actA = r.no_of_actual_adults ?? r.noOfActualAdults ?? r.actualAdults ?? 0;
      const regC = r.no_of_reg_children ?? r.noOfRegChildren ?? r.registeredChildren ?? 0;
      const actC = r.no_of_actual_children ?? r.noOfActualChildren ?? r.actualChildren ?? 0;
      const pre = r.present ? 1:0;
      const abs = !r.present ? 1:0;

      acc.registeredAdults += Number(regA) || 0;
      acc.actualAdults += Number(actA) || 0;
      acc.registeredChildren += Number(regC) || 0;
      acc.actualChildren += Number(actC) || 0;
      acc.noOfPresent += Number(pre) || 0;
      acc.noOfAbsent += Number(abs) || 0;
    }

    return acc;
  }, [rows]);

  // format data for recharts
  const chartData = useMemo(
    () => [
      {
        group: "Adults",
        Registered: totals.registeredAdults,
        Actual: totals.actualAdults,
      },
      {
        group: "Children",
        Registered: totals.registeredChildren,
        Actual: totals.actualChildren,
      },
      {
        group: "Registration",
        Registered: totals.noOfPresent + totals.noOfAbsent,
        Actual: totals.noOfPresent
      }
    ],
    [totals]
  );

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Registered vs Actual</h3>
        <div className="text-sm text-gray-500 dark:text-gray-300">Adults / Children</div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading attendees…</div>
      ) : error ? (
        <div className="py-6 text-center text-red-500">Error: {error}</div>
      ) : (
        <>
          <div style={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [value, "Count"]} />
                <Legend />
                <Bar dataKey="Registered" barSize={28} radius={[6, 6, 0, 0]} fill="#1976d2">
                  <LabelList dataKey="Registered" position="top" />
                </Bar>
                <Bar dataKey="Actual" barSize={28} radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="Actual" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Total — Registered: {totals.registeredAdults + totals.registeredChildren} • Actual:{" "}
            {totals.actualAdults + totals.actualChildren}
          </div>
        </>
      )}
    </div>
  );
}
