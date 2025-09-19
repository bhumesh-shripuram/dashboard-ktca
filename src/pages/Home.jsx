import React, { useState } from "react";
import { insert } from "../service";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    noOfAdults: 0,
    noOfChildren: 0,
    preparing: false,
    firstTime: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/^[+\d]?\d{9,14}$/.test(String(form.mobile).replace(/\s+/g, "")))
      return "Enter a valid mobile number (10–15 digits).";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email or leave blank.";
    if (form.noOfAdults === "" || form.noOfAdults < 0) return "Adults must be 0 or more.";
    if (form.noOfChildren === "" || form.noOfChildren < 0) return "Children must be 0 or more.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      // Replace this with your API call:
      const payload = {
        name: form.name.trim(),
        mobile: String(form.mobile).replace(/\s+/g, ""),
        email: form.email.trim() || null,
        no_of_actual_adults: Number(form.noOfAdults) || 0,
        no_of_actual_children: Number(form.noOfChildren) || 0,
        preparing: !!form.preparing,
        first_time: !!form.firstTime,
      };
      console.log("Submit payload:", payload);

      const result = await insert(payload);
      console.log(result);
      // lightweight UX:
      //alert("Submitted — check console for payload (or swap in your API).");
      alert("The user info is updated to the system. Thank you!!")
      // reset form if you like:
      setForm({
        name: "",
        mobile: "",
        email: "",
        noOfAdults: 0,
        noOfChildren: 0,
        preparing: false,
        firstTime: false,
      });
    } catch (err) {
      console.error(err);
      setError("Submission failed: " + (err?.message || "unknown"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#f3f4f6" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 600, background: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
        <h2 style={{ marginTop: 0 }}>Attendee form</h2>

        <label style={{ display: "block", marginTop: 12 }}>
          First Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          Mobile number
          <input
            name="mobile"
            type="tel"
            value={form.mobile}
            onChange={handleChange}
            required
            placeholder="9876543210"
            style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <label style={{ flex: 1 }}>
            No. of Adults
            <input
              name="noOfAdults"
              type="number"
              min={0}
              value={form.noOfAdults}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #d1d5db" }}
            />
          </label>

          <label style={{ flex: 1 }}>
            No. of Children
            <input
              name="noOfChildren"
              type="number"
              min={0}
              value={form.noOfChildren}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #d1d5db" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input name="preparing" type="checkbox" checked={form.preparing} onChange={handleChange} />
            Bringing Bathukamma (preparing)
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input name="firstTime" type="checkbox" checked={form.firstTime} onChange={handleChange} />
            First time attendee
          </label>
        </div>

        {error && <div style={{ color: "#b91c1c", marginTop: 12 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
          <button type="reset" onClick={() => setForm({ name: "", mobile: "", email: "", noOfAdults: 0, noOfChildren: 0, preparing: false, firstTime: false })} style={{ padding: "10px 14px", background: "#fff", border: "1px solid #d1d5db", borderRadius: 8 }}>
            Reset
          </button>
          <button type="submit" disabled={submitting} style={{ padding: "10px 14px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8 }}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
