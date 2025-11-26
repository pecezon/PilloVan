const WHAPI_URL = "https://gate.whapi.cloud";
const TOKEN = import.meta.env.VITE_WHAPI_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

export const createWhapiContact = async (contact) => {
  const res = await fetch(`${WHAPI_URL}/contacts`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      contacts: [contact],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Failed to create contact:", error);
    throw new Error(error);
  }

  return await res.json();
};
