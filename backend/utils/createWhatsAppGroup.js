const WHAPI_URL = "https://gate.whapi.cloud";
const TOKEN = process.env.WHAPI_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

const ensureContacts = async (contacts) => {
  // 1. Intentar crearlos
  for (const { phone, name } of contacts) {
    await fetch(`${WHAPI_URL}/contacts`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        contacts: [
          {
            phone: String(phone),
            name: String(name || String(phone)),
          },
        ],
      }),
    }).catch(() => {});
  }

  // 2. Obtener lista completa
  const res = await fetch(`${WHAPI_URL}/contacts`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Failed to fetch contacts:", error);
    throw new Error(error);
  }

  const data = await res.json();
  console.log("Fetched contacts:", data.contacts);
  console.log(
    "JP contacts:",
    contacts.filter((c) => c.name === "JP")
  );

  // 3. Mapear teléfonos
  const phoneToId = {};

  for (const contact of data.contacts || []) {
    phoneToId[contact.phone] = contact.id;
  }

  return contacts.map(({ phone }) => phoneToId[String(phone)]).filter(Boolean); // solo IDs válidos
};

const createGroup = async (groupName, contactIds) => {
  const res = await fetch(`${WHAPI_URL}/groups`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: groupName,
      participants: contactIds,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Failed to create group:", err);
    throw new Error(err);
  }

  return await res.json();
};

const getGroupInvite = async (groupId) => {
  const res = await fetch(`${WHAPI_URL}/groups/${groupId}/invite`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Failed to fetch invite:", err);
    throw new Error(err);
  }

  const data = await res.json();
  return data.invite_code;
};

module.exports = {
  ensureContacts,
  createGroup,
  getGroupInvite,
};
