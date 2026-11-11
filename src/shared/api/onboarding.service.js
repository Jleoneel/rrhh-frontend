import api from "./axios";

export async function getVersionVista(modulo) {
  const { data } = await api.get(`/onboarding/${modulo}`);
  return data.version;
}

export async function marcarVisto(modulo, version) {
  await api.put(`/onboarding/${modulo}`, { version });
}
