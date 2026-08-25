import { UserCheck, UserPlus, ChevronRight } from "lucide-react";
import Modal from "../../../../shared/components/ui/Modal";

export default function TipoServidorModal({
  open,
  onClose,
  onElegirDistributivo,
  onElegirNoDistributivo,
}) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Crear Acción de Personal
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Seleccione el tipo de servidor para esta acción
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={onElegirDistributivo}
            className="w-full flex items-center gap-4 p-5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-300 text-left group"
          >
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                Servidor registrado en el distributivo
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Busca al servidor por cédula y autocompleta sus datos
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onElegirNoDistributivo}
            className="w-full flex items-center gap-4 p-5 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all duration-300 text-left group"
          >
            <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
              <UserPlus className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                Servidor no registrado en el distributivo
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Ingrese manualmente los datos del servidor
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
