import { useRef, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useOutletContext } from "react-router-dom";

import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Users,
  Briefcase,
  Building2,
  Layers,
  ChevronRight,
  X,
  Download,
  RefreshCw,
  HardDrive,
} from "lucide-react";

function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    indigo: "from-indigo-500 to-indigo-600",
    teal: "from-teal-500 to-teal-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default function AdjuntarDistributivo() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sync, setSync] = useState(null);
  const [filasExcel, setFilasExcel] = useState(null);
  const { setHeaderConfig } = useOutletContext();

  // Configurar el header al cargar la página
  useEffect(() => {
    setHeaderConfig({
      title: "Carga de Distributivo",
      showNewAction: false,
      onNewAction: null,
    });

    // Limpiar al desmontar
    return () => {
      setHeaderConfig({
        title: "Dashboard",
        showNewAction: false,
        onNewAction: null,
      });
    };
  }, [setHeaderConfig]);

  const pickFile = () => {
    inputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      return Swal.fire({
        icon: "warning",
        title: "Seleccione un archivo",
        text: "Debe elegir un archivo .xlsx para importar el distributivo.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        color: "#1f2937",
      });
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      Swal.fire({
        title: "Importando distributivo...",
        html: `
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Procesando archivo Excel</p>
            <p class="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#1f2937",
      });

      const { data } = await axios.post(
        "http://localhost:3001/api/distributivo/import",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.close();

      setSync(data.sync);
      setFilasExcel(data.filas_excel);

      Swal.fire({
        toast: true,
        icon: "success",
        title: "Importación completada",
        text: `${data.filas_excel} filas procesadas`,
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error importando distributivo",
        text: err.response?.data?.message || err.message || "Error desconocido",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header de la página - Título visible pero el del layout ya está configurado */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200">
              <HardDrive className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Carga de Distributivo
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  <FileSpreadsheet className="inline h-4 w-4 mr-1" />
                  Archivo .xlsx
                </span>
                <span className="text-gray-300">|</span>
                <p className="text-gray-600">
                  Actualización masiva de catálogos y estructura organizacional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card principal de carga */}
        <div className="mb-8">
          <SectionCard title="Importar Distributivo" description="Seleccione el archivo Excel con la estructura actualizada" icon={FileSpreadsheet}>
            <div className="space-y-6">
              {/* Selector de archivo */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <button
                  type="button"
                  onClick={pickFile}
                  className="px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all flex items-center gap-2 font-medium shadow-sm hover:shad"
                >
                  <Upload className="h-5 w-5" />
                  Seleccionar archivo
                </button>

                <div className="flex-1 flex items-center gap-3">
                  {file ? (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2.5 bg-green-100 rounded-lg">
                          <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB • Última modificación: {new Date(file.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClearFile}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Quitar archivo"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </>
                  ) : (
                    <div className="text-gray-400 flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      <span className="text-sm">Ningún archivo seleccionado</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[200px] justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5" />
                      Importar Distributivo
                    </>
                  )}
                </button>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Formato esperado</p>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      El archivo debe contener las columnas: cédula, nombres, unidad_orgánica, denominación_puesto, 
                      escala_ocupacional, grado, rmu, partida_individual, proceso_institucional, nivel_gestion, lugar_trabajo.
                      Las filas con errores serán omitidas y registradas en el log.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Resultados de la importación */}
        {sync && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Resultado de la importación</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Resumen de operaciones realizadas en la base de datos
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2"
                title="Actualizar vista"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm hidden md:inline">Actualizar</span>
              </button>
            </div>

            {/* Cards de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard 
                title="Filas en Excel" 
                value={filasExcel ?? 0} 
                icon={FileSpreadsheet}
                color="purple"
              />
              <StatCard 
                title="Servidores" 
                value={sync.servidor_upsert ?? 0} 
                icon={Users}
                color="blue"
              />
              <StatCard 
                title="Puestos" 
                value={sync.puesto_upsert ?? 0} 
                icon={Briefcase}
                color="green"
              />
              <StatCard 
                title="Asignaciones creadas" 
                value={sync.asignaciones_creadas ?? 0} 
                icon={ChevronRight}
                color="teal"
              />

              <StatCard 
                title="Asignaciones cerradas" 
                value={sync.asignaciones_cerradas ?? 0} 
                icon={X}
                color="amber"
              />
              <StatCard 
                title="Régimen laboral" 
                value={sync.regimen_laboral_upsert ?? 0} 
                icon={Layers}
                color="indigo"
              />
              <StatCard 
                title="Unidades orgánicas" 
                value={sync.unidad_organica_upsert ?? 0} 
                icon={Building2}
                color="purple"
              />
              <StatCard 
                title="Denominaciones" 
                value={sync.denominacion_puesto_upsert ?? 0} 
                icon={FileSpreadsheet}
                color="blue"
              />

              <StatCard 
                title="Escalas ocupacionales" 
                value={sync.escala_ocupacional_upsert ?? 0} 
                icon={Layers}
                color="green"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}