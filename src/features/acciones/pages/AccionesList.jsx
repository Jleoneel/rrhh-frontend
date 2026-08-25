import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { getAcciones } from "../hooks/acciones.service";
import AccionesFilters from "../components/AccionesFilters";
import AccionesTable from "../components/AccionesTable";
import NuevaAccionModal from "../components/Modales/NuevaAccionModal";
import AnexosModal from "../components/Modales/AnexosModal";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";

// Constantes para IDs de roles
const ROLES = {
  ASISTENTE_UATH: "78de3b9c-a2f4-41ed-9823-bb72ee56d1f4",
  AUXILIAR_UATH: "5a7d49dd-926e-4eaa-8127-b05e9dae7e53",
  ANALISTA_TALENTO_HUMANO: "ae067d84-f43e-4c73-bab4-985f963331fa",
  RESPONSABLE_UATH: "718d8402-0f5e-4b58-af36-08564d8e496a",
  ADMINISTRADOR_SISTEMA: "c0c2cc49-4e23-43e8-aef8-835ae52ae7dc",
};

const initialFilters = {
  estado: "",
  tipo_accion: "",
  cedula: "",
  desde: "",
  hasta: "",
};

// Componente de loading reutilizable
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Cargando acciones...</span>
  </div>
);

// Componente de mensaje cuando no hay datos
const NoDataMessage = () => (
  <div className="text-center py-8 text-gray-500">
    No se encontraron acciones de personal
  </div>
);

export default function AccionesList() {
  const { setHeaderConfig } = useOutletContext();
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [acciones, setAcciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [presetCedula, setPresetCedula] = useState(null);
  const [openAnexos, setOpenAnexos] = useState(false);
  const [accionSel, setAccionSel] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedAccionId, setSelectedAccionId] = useState(null);
  const [error, setError] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  // Función para obtener acciones con useCallback
  const fetchAcciones = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAcciones(currentFilters);
      setAcciones(data || []);
    } catch (error) {
      console.error("Error fetching acciones:", error);
      setError(error.message || "Error al cargar las acciones");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las acciones. Intente nuevamente.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);
  // Cargar datos iniciales
  useEffect(() => {
    // Obtener usuario del localStorage
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }

    // Configurar header
    setHeaderConfig({
      title: "Acciones de Personal",
      showNewAction: true,
      // cedula: presente cuando la acción viene de un servidor recién
      // registrado manualmente (no distributivo); ausente para el flujo
      // normal ("Servidor registrado en distributivo").
      onNewAction: (cedula) => {
        setPresetCedula(cedula || null);
        setOpenModal(true);
      },
    });

    // Cargar acciones
    fetchAcciones();

    // Limpiar header al desmontar
    return () => {
      setHeaderConfig({
        title: "Dashboard",
        showNewAction: false,
        onNewAction: null,
      });
    };
  }, [setHeaderConfig, fetchAcciones]);

  // Manejadores de eventos
  const handleChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al cambiar filtros
    setError(null);
  };

  const handleEdit = (accion) => {
    if (!accion?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se puede editar: acción inválida",
      });
      return;
    }
    setSelectedAccionId(accion.id);
    setOpenEditModal(true);
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    
    // Validar fechas si ambas están presentes
    if (filters.desde && filters.hasta) {
      if (new Date(filters.desde) > new Date(filters.hasta)) {
        Swal.fire({
          icon: "warning",
          title: "Fechas inválidas",
          text: "La fecha 'desde' no puede ser mayor que la fecha 'hasta'",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }
    
    fetchAcciones(filters);
  };

  const handleLimpiar = () => {
    setFilters(initialFilters);
    fetchAcciones(initialFilters);
  };

  const handleDownload = async (accion) => {
    if (!accion?.id || !accion?.codigo_elaboracion) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Acción inválida para descargar",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/acciones/${accion.id}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Error desconocido");
        throw new Error(errorText || "Error al generar el PDF");
      }

      // Verificar que la respuesta sea un PDF
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/pdf")) {
        throw new Error("La respuesta no es un PDF válido");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("El archivo PDF está vacío");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Accion_Personal_${accion.codigo_elaboracion}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Mostrar éxito
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Descarga iniciada",
        text: `El PDF ${accion.codigo_elaboracion} se está descargando.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Download error:", error);
      Swal.fire({
        icon: "error",
        title: "Error al descargar",
        text: error.message || "No se pudo descargar el PDF",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleOpenAnexos = (accion) => {
    if (!accion?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pueden ver anexos: acción inválida",
      });
      return;
    }
    setAccionSel(accion);
    setOpenAnexos(true);
  };

const handleInsubsistente = async (accion) => {
  const result = await Swal.fire({  // ← cambiar a result
    title: "¿Marcar como insubsistente?",
    html: `
      <p class="text-gray-600 mb-3">Acción: <b>${accion.codigo_elaboracion}</b></p>
      <textarea id="motivo-input" class="swal2-textarea" placeholder="Motivo (opcional)..."></textarea>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, marcar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    preConfirm: () => {
      return document.getElementById("motivo-input").value || null;
    },
  });

  if (!result.isConfirmed) return; // ← verificar isConfirmed

  const motivo = result.value; // ← obtener motivo del result

  try {
    await api.put(`/acciones/${accion.id}/insubsistente`, { motivo });
    Swal.fire({
      toast: true,
      icon: "success",
      text: `Acción ${accion.codigo_elaboracion} marcada como insubsistente`,
      timer: 2500,
      showConfirmButton: false,
      position: "top-end",
    });
    fetchAcciones();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.message || "No se pudo procesar",
      confirmButtonColor: "#dc2626",
    });
  }
};


const ESTADOS_ELIMINABLES = ["BORRADOR", "EN_FIRMA"];

const handleEliminarAccion = async (accion) => {
  if (!accion?.id || eliminandoId) return;

  if (!ESTADOS_ELIMINABLES.includes(accion.estado)) {
    Swal.fire({
      icon: "error",
      title: "No se puede eliminar",
      text: "No se puede eliminar una Acción de Personal completada",
      confirmButtonColor: "#dc2626",
    });
    return;
  }

  const result = await Swal.fire({
    title: "Eliminar Acción de Personal",
    html: `
      <p class="text-gray-600 mb-2">¿Está seguro de eliminar esta Acción de Personal?</p>
      <p class="text-sm text-gray-700 mb-3 text-left">
        <b>Acción:</b> ${accion.codigo_elaboracion}<br/>
        <b>Estado:</b> ${accion.estado}
      </p>
      <p class="text-sm text-gray-600 mb-1 text-left">Esta operación eliminará permanentemente:</p>
      <ul class="text-sm text-gray-600 text-left list-disc list-inside mb-2">
        <li>La Acción de Personal</li>
        <li>Sus notificaciones</li>
        <li>Sus firmas</li>
        <li>Sus anexos</li>
        <li>Sus archivos asociados</li>
      </ul>
      <p class="text-sm font-semibold text-red-600">Esta operación NO se puede deshacer.</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar definitivamente",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  setEliminandoId(accion.id);
  try {
    await api.delete(`/acciones/${accion.id}`);
    Swal.fire({
      toast: true,
      icon: "success",
      text: `Acción ${accion.codigo_elaboracion} eliminada correctamente`,
      timer: 2500,
      showConfirmButton: false,
      position: "top-end",
    });
    fetchAcciones();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        err.response?.data?.message ||
        "No se pudo eliminar la Acción de Personal",
      confirmButtonColor: "#dc2626",
    });
  } finally {
    setEliminandoId(null);
  }
};

  const handleModalClose = () => {
    setOpenModal(false);
    setPresetCedula(null);
  };

  const handleEditModalClose = () => {
    setOpenEditModal(false);
    setSelectedAccionId(null);
  };

  const handleAnexosClose = () => {
    setOpenAnexos(false);
    setAccionSel(null);
  };

  const handleModalSuccess = () => {
    fetchAcciones();
  };

  // Verificar permisos de usuario
  const esAsistenteUATH = [
    ROLES.ASISTENTE_UATH,
    ROLES.AUXILIAR_UATH,
    ROLES.ANALISTA_TALENTO_HUMANO,
  ].includes(user?.cargo_id);
  const esAdmin = user?.es_admin === true; // ← aquí
  const puedeEliminarAccion = [
    ROLES.RESPONSABLE_UATH,
    ROLES.ADMINISTRADOR_SISTEMA,
  ].includes(user?.cargo_id);
  // Igual que esAsistenteUATH, pero además habilita a RESPONSABLE DE LA UATH.
  // Se mantiene separado de esAsistenteUATH porque ese booleano también
  // controla el botón de Descargar PDF, que no debe verse afectado.
  const puedeEditarAccion =
    esAsistenteUATH || user?.cargo_id === ROLES.RESPONSABLE_UATH;
  // Mismo conjunto de cargos autorizados que puedeEliminarAccion
  // (RESPONSABLE DE LA UATH y ADMINISTRADOR DEL SISTEMA); se mantiene
  // como constante aparte por claridad semántica, no porque la regla de
  // autorización sea distinta.
  const puedeConfigurarNumeracion = puedeEliminarAccion;


  // Renderizado condicional de la tabla
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => fetchAcciones(filters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (!acciones || acciones.length === 0) {
      return <NoDataMessage />;
    }

    return (
      <AccionesTable
        acciones={acciones}
        onDownload={handleDownload}
        onAnexos={handleOpenAnexos}
        onEdit={handleEdit}
        esAsistenteUATH={esAsistenteUATH}
        puedeEditarAccion={puedeEditarAccion}
           esAdmin={esAdmin}                          // ← nuevo
    onInsubsistente={handleInsubsistente}
        puedeEliminarAccion={puedeEliminarAccion}
        onEliminar={handleEliminarAccion}
        eliminandoId={eliminandoId}
      />
    );
  };

  return (
    <>
      <div className="space-y-4">
        <AccionesFilters
          filters={filters}
          onChange={handleChange}
          onBuscar={handleBuscar}
          onLimpiar={handleLimpiar}
          puedeConfigurarNumeracion={puedeConfigurarNumeracion}
        />

        {renderContent()}
      </div>

      {/* Modales */}
      <NuevaAccionModal
        open={openModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialCedula={presetCedula}
        key="nueva-accion-modal"
      />

      <NuevaAccionModal
        open={openEditModal}
        onClose={handleEditModalClose}
        onSuccess={handleModalSuccess}
        mode="edit"
        accionId={selectedAccionId}
        key={`edit-accion-modal-${selectedAccionId || 'none'}`}
      />

      <AnexosModal
        open={openAnexos}
        onClose={handleAnexosClose}
        accion={accionSel}
        key={`anexos-modal-${accionSel?.id || 'none'}`}
      />
    </>
  );
}
