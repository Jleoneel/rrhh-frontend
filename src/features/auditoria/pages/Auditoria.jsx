import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Calendar,
  Wallet,
  Umbrella,
  ClipboardCheck,
  X,
} from "lucide-react";
import { getAuditoria } from "../hooks/auditoria.service";
import StatCard from "../../../shared/components/ui/StatCard";
import PageNumbers from "../../../shared/components/ui/PageNumbers";

const ACCION_LABEL = {
  SALDO_ASIGNADO: "Saldo asignado",
  SALDO_CORREGIDO: "Saldo corregido",
  VACACION_APROBADA_JEFE: "Vacación aprobada (jefe inmediato)",
  VACACION_APROBADA_SUPERIOR: "Vacación aprobada (jefe superior)",
  VACACION_APROBADA_UATH: "Vacación certificada (UATH)",
  VACACION_NEGADA: "Vacación negada",
  PERMISO_APROBADO: "Permiso aprobado",
  PERMISO_RECHAZADO: "Permiso rechazado",
};

const ACCION_BADGE = {
  SALDO_ASIGNADO: "bg-blue-100 text-blue-700",
  SALDO_CORREGIDO: "bg-amber-100 text-amber-700",
  VACACION_APROBADA_JEFE: "bg-green-100 text-green-700",
  VACACION_APROBADA_SUPERIOR: "bg-green-100 text-green-700",
  VACACION_APROBADA_UATH: "bg-green-100 text-green-700",
  VACACION_NEGADA: "bg-red-100 text-red-700",
  PERMISO_APROBADO: "bg-green-100 text-green-700",
  PERMISO_RECHAZADO: "bg-red-100 text-red-700",
};

const GRUPO_ACCIONES = [
  { label: "Todas las acciones", value: "" },
  { label: "— Saldos —", value: "", disabled: true },
  { label: ACCION_LABEL.SALDO_ASIGNADO, value: "SALDO_ASIGNADO" },
  { label: ACCION_LABEL.SALDO_CORREGIDO, value: "SALDO_CORREGIDO" },
  { label: "— Vacaciones —", value: "", disabled: true },
  { label: ACCION_LABEL.VACACION_APROBADA_JEFE, value: "VACACION_APROBADA_JEFE" },
  { label: ACCION_LABEL.VACACION_APROBADA_SUPERIOR, value: "VACACION_APROBADA_SUPERIOR" },
  { label: ACCION_LABEL.VACACION_APROBADA_UATH, value: "VACACION_APROBADA_UATH" },
  { label: ACCION_LABEL.VACACION_NEGADA, value: "VACACION_NEGADA" },
  { label: "— Permisos —", value: "", disabled: true },
  { label: ACCION_LABEL.PERMISO_APROBADO, value: "PERMISO_APROBADO" },
  { label: ACCION_LABEL.PERMISO_RECHAZADO, value: "PERMISO_RECHAZADO" },
];

function formatFechaHora(iso) {
  const d = new Date(iso);
  return d.toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Auditoria() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Auditoría del Sistema",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const [registros, setRegistros] = useState([]);
  const [total, setTotal] = useState(0);
  const [porAccion, setPorAccion] = useState({});
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [accion, setAccion] = useState("");
  const [grupo, setGrupo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuditoria({
        page,
        limit,
        q,
        accion,
        grupo,
        desde,
        hasta,
      });
      setRegistros(data.data);
      setTotal(data.total);
      setPorAccion(data.por_accion || {});
    } catch (err) {
      console.error("Error cargando auditoría:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, accion, grupo, desde, hasta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const limpiarFiltros = () => {
    setQ("");
    setAccion("");
    setGrupo("");
    setDesde("");
    setHasta("");
    setPage(1);
  };

  const filtrarPorGrupo = (g) => {
    setGrupo(g);
    setAccion("");
    setPage(1);
  };

  const hayFiltros = q || accion || grupo || desde || hasta;

  const totalSaldos =
    (porAccion.SALDO_ASIGNADO || 0) + (porAccion.SALDO_CORREGIDO || 0);
  const totalVacaciones =
    (porAccion.VACACION_APROBADA_JEFE || 0) +
    (porAccion.VACACION_APROBADA_SUPERIOR || 0) +
    (porAccion.VACACION_APROBADA_UATH || 0) +
    (porAccion.VACACION_NEGADA || 0);
  const totalPermisos =
    (porAccion.PERMISO_APROBADO || 0) + (porAccion.PERMISO_RECHAZADO || 0);

  // Los conteos por grupo (saldos/vacaciones/permisos) vienen ya
  // agregados en el servidor (por_accion) sobre el MISMO filtro activo,
  // no solo de la página actual.
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Auditoría del Sistema
              </h1>
              <p className="text-gray-500 mt-1">
                Registro de acciones sensibles: saldos, vacaciones y permisos
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Registros (filtro actual)"
            value={total}
            icon={ShieldCheck}
            color="indigo"
            onClick={() => filtrarPorGrupo("")}
          />
          <StatCard
            label="Saldos"
            value={totalSaldos}
            icon={Wallet}
            color="blue"
            onClick={() => filtrarPorGrupo("SALDOS")}
          />
          <StatCard
            label="Vacaciones"
            value={totalVacaciones}
            icon={Umbrella}
            color="green"
            onClick={() => filtrarPorGrupo("VACACIONES")}
          />
          <StatCard
            label="Permisos"
            value={totalPermisos}
            onClick={() => filtrarPorGrupo("PERMISOS")}
            icon={ClipboardCheck}
            color="amber"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre o cédula (quién actuó o quién fue afectado)..."
              className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={accion}
            onChange={(e) => {
              setAccion(e.target.value);
              setGrupo("");
              setPage(1);
            }}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GRUPO_ACCIONES.map((g, i) => (
              <option key={i} value={g.value} disabled={g.disabled}>
                {g.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={desde}
              onChange={(e) => {
                setDesde(e.target.value);
                setPage(1);
              }}
              className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-sm">a</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => {
                setHasta(e.target.value);
                setPage(1);
              }}
              className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={cargar}
            className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            title="Actualizar"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1.5 px-4 py-3 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={14} /> Limpiar
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                {["Fecha", "Acción", "Quién actuó", "Sobre quién", "Descripción"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No hay registros de auditoría con estos filtros
                    </p>
                  </td>
                </tr>
              ) : (
                registros.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatFechaHora(r.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          ACCION_BADGE[r.accion] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ACCION_LABEL[r.accion] || r.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">
                        {r.firmante_nombre}
                      </p>
                      {r.firmante_cargo && (
                        <p className="text-xs text-gray-400">{r.firmante_cargo}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {r.servidor_afectado_nombre ? (
                        <>
                          <p className="font-medium text-gray-700 text-sm">
                            {r.servidor_afectado_nombre}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {r.servidor_afectado_cedula}
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                      {r.descripcion}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Mostrando <b className="text-gray-900">{registros.length}</b> de{" "}
              <b className="text-gray-900">{total}</b> registros
            </span>
            <PageNumbers page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
