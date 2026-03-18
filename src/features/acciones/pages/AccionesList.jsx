import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { getAcciones } from "../hooks/acciones.service";
import AccionesFilters from "../components/AccionesFilters";
import AccionesTable from "../components/AccionesTable";
import NuevaAccionModal from "../components/Modales/NuevaAccionModal";
import AnexosModal from "../components/Modales/AnexosModal";
import Swal from "sweetalert2";

// Constantes para IDs de roles
const ROLES = {
  ASISTENTE_UATH: "78de3b9c-a2f4-41ed-9823-bb72ee56d1f4",
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
  const [openAnexos, setOpenAnexos] = useState(false);
  const [accionSel, setAccionSel] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedAccionId, setSelectedAccionId] = useState(null);
  const [error, setError] = useState(null);

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
      onNewAction: () => setOpenModal(true),
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
  }, [setHeaderConfig, fetchAcciones]); // Añadir dependencias

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

  const handleModalClose = () => {
    setOpenModal(false);
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
  const esAsistenteUATH = user?.cargo_id === ROLES.ASISTENTE_UATH;

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
        />

        {renderContent()}
      </div>

      {/* Modales */}
      <NuevaAccionModal
        open={openModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
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