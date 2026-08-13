/** Shared JSON API client. Templates should only provide URLs and payloads. */
window.DigiGastro = window.DigiGastro || {};
window.DigiGastro.api = async function (url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            ...(options.body ? {"Content-Type": "application/json"} : {}),
            ...(options.headers || {}),
        },
        ...options,
    });
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json") ? await response.json() : await response.text();
    if (!response.ok) throw new Error(data?.detail || `API-Fehler (${response.status})`);
    return data;
};
