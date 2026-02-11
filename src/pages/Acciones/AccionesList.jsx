import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { getAcciones } from "../../services/acciones.service";
import AccionesFilters from "../../components/actions/AccionesFilters";
import AccionesTable from "../../components/actions/AccionesTable";
import NuevaAccionModal from "../../components/actions/Modales/NuevaAccionModal";
import AnexosModal from "../../components/actions/AnexosModal";

const initialFilters = {
  estado: "",
  tipo_accion: "",
  cedula: "",
  desde: "",
  hasta: "",
};

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

  const fetchAcciones = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const data = await getAcciones(currentFilters);
      setAcciones(data);
    } catch (err) {
      console.error("Error cargando acciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    // Configurar header del layout
    setHeaderConfig({
      title: "Acciones de Personal",
      showNewAction: true,
      onNewAction: () => setOpenModal(true),
    });

    fetchAcciones();

    // Cleanup opcional: al salir, restablecer header
    return () => {
      setHeaderConfig({
        title: "Dashboard",
        showNewAction: false,
        onNewAction: null,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Función para editar
  const handleEdit = (accion) => {
    setSelectedAccionId(accion.id);
    setOpenEditModal(true);
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    fetchAcciones(filters);
  };

  const handleLimpiar = () => {
    setFilters(initialFilters);
    fetchAcciones(initialFilters);
  };

  const handleDownload = async (accion) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/acciones/${accion.id}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Error al generar el PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `accion_personal_${accion.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("No se pudo descargar el PDF");
    }
  };

  const handleOpenAnexos = (accion) => {
    setAccionSel(accion);
    setOpenAnexos(true);
  };

  const esAsistenteUATH =
    user?.cargo_id === "78de3b9c-a2f4-41ed-9823-bb72ee56d1f4";

  return (
    <>
      <div className="space-y-4">
        <AccionesFilters
          filters={filters}
          onChange={handleChange}
          onBuscar={handleBuscar}
          onLimpiar={handleLimpiar}
        />

        {loading ? (
          <p>Cargando acciones...</p>
        ) : (
          <AccionesTable
            acciones={acciones}
            onDownload={handleDownload}
            onAnexos={handleOpenAnexos}
            onEdit={handleEdit}
            esAsistenteUATH={esAsistenteUATH} // ← Pasa esta prop
          />
        )}
      </div>

      <NuevaAccionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchAcciones}
      />

      <NuevaAccionModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedAccionId(null);
        }}
        onSuccess={fetchAcciones}
        mode="edit"
        accionId={selectedAccionId}
      />

      <AnexosModal
        open={openAnexos}
        onClose={() => setOpenAnexos(false)}
        accion={accionSel}
      />
    </>
  );
}
