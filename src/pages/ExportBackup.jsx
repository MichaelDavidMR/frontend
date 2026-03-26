import { useState } from 'react';
import { exportCSV, downloadBackup, restoreBackup } from '../utils/api';

function ExportBackup() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [message, setMessage] = useState(null);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center py-20">
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        🚧 Coming Soon...
      </h2>

      <p className="text-gray-600 text-lg mb-6">
        Este módulo de exportación y backups está en construcción.
      </p>

      <p className="text-gray-500 max-w-md">
        Próximamente podrás exportar datos, crear backups y restaurar información 
        directamente desde <strong>Supabase</strong> sin hacks raros ni archivos fantasmas.
      </p>

      <div className="mt-10 text-sm text-gray-400">
        (Sí, antes funcionaba con JSON… evolucionamos, no llores)
      </div>

    </div>
  );
}

export default ExportBackup;


// add