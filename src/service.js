const BASE_URL = "https://rbbnadgzoneslmzsovmb.supabase.co" 
// "https://lxwkrlfthexhhqlbdrme.supabase.co"; //https://rbbnadgzoneslmzsovmb.supabase.co
const ENDPOINT = `${BASE_URL}/rest/v1/attendees`;
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYm5hZGd6b25lc2xtenNvdm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTU5MzgsImV4cCI6MjA3Mzg3MTkzOH0.k1fOMJ3HcNFf37BS_lsTV3KCs29WLbropXYwRcznPts"

//  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4d2tybGZ0aGV4aGhxbGJkcm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTU1ODgsImV4cCI6MjA3MzMzMTU4OH0.cPB4oTNEynQya9ht2HiA8qsahoEJkOoX7Bo3lcSTeCI";

function buildHeaders(extra = {}) {
  return {
    apikey: ANON,
    Authorization: `Bearer ${ANON}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function parseResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message || data?.error || res.statusText);
  }
  return data;
}

/**
 * Get attendee by UUID
 */
export async function getById(id, { signal } = {}) {
  if (!id) throw new Error("getById: id is required");
  const url = `${ENDPOINT}?id=eq.${encodeURIComponent(id)}&select=*`;
  const res = await fetch(url, { headers: buildHeaders(), signal });
  const data = await parseResponse(res);
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function getAll({ signal } = {}) {
  const url = `${ENDPOINT}?select=*`;
  const res = await fetch(url, { headers: buildHeaders(), signal });
  const data = await parseResponse(res);
  return Array.isArray(data) ? data : [];
}

/**
 * Get attendee(s) by phone number
 */
export async function getByPhone(phone, { signal } = {}) {
  if (!phone) throw new Error("getByPhone: phone is required");
  const url = `${ENDPOINT}?mobile=eq.${encodeURIComponent(phone)}&select=*`;
  const res = await fetch(url, { headers: buildHeaders(), signal });
  const data = await parseResponse(res);
  return Array.isArray(data) ? data : [];
}

/**
 * Update attendee by UUID (PATCH)
 */
export async function updateById(id, patchObj, { signal } = {}) {
  if (!id) throw new Error("updateById: id is required");
  const url = `${ENDPOINT}?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: buildHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(patchObj),
    signal,
  });
  const data = await parseResponse(res);
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function insert(formData = {}, { signal } = {}) {
  if (!formData || !formData.name) {
    throw new Error("insert: formData.name is required");
  }

  // normalize phone
  const mobile = String(formData.mobile ?? "").replace(/\s+/g, "");
  if (!mobile) {
    throw new Error("insert: formData.mobile is required");
  }

  // Build payload with sensible defaults and both reg/actual fields handled.
  const payload = {
    name: formData.name,
    mobile,
    email: formData.email || null,
    // prefer explicit reg fields, fall back to actual fields or 0
    no_of_reg_adults: formData.no_of_actual_adults ?? 0,
    no_of_reg_children: formData.no_of_actual_children ?? 0,
    no_of_actual_adults: formData.no_of_actual_adults ?? 0,
    no_of_actual_children: formData.no_of_actual_children ?? 0,
    preparing: !!formData.preparing,
    first_time: !!formData.first_time,
    // present: !!formData.present || false,
    // optionally include submitted_at if you want client timestamp
    submitted_at: formData.submitted_at ?? new Date().toISOString(),
    raw_response: formData.raw_response ?? null,
    present: true
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: buildHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(payload),
    signal,
  });

  const data = await parseResponse(res);
  // Supabase returns an array when using return=representation
  return Array.isArray(data) && data.length ? data[0] : data;
}


export default {
  getById,
  getByPhone,
  updateById,
};
