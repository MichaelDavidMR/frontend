import { useState } from 'react';
import { exportCSV, downloadBackup, restoreBackup } from '../utils/api';

function ExportBackup() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [message, setMessage] = useState(null);

  const handleExportCSV = () => {
    exportCSV(dateRange);
  };

  const handleDownloadBackup = () => {
    downloadBackup();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestoreFile(file);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      alert('Selecciona un archivo de backup');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ ADVERTENCIA: Esto reemplazará TODOS los datos actuales. ¿Estás seguro?'
    );
    
    if (!confirmed) return;

    try {
      setRestoring(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          await restoreBackup(data);
          setMessage({ type: 'success', text: 'Base de datos restaurada correctamente' });
          setRestoreFile(null);
        } catch (err) {
          setMessage({ type: 'error', text: 'Error: Archivo inválido' });
          console.error(err);
        } finally {
          setRestoring(false);
        }
      };
      
      reader.readAsText(restoreFile);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error leyendo archivo' });
      setRestoring(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Exportar y Respaldar</h2>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Export to CSV */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">📊 Exportar a CSV</h3>
        <p className="text-gray-600 mb-4">
          Exporta los recibos a formato CSV para abrir en Excel u otros programas.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="input"
            />
          </div>
        </div>
        
        <button onClick={handleExportCSV} className="btn-primary w-full">
          📥 Descargar CSV
        </button>
      </div>

      {/* Backup Download */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">💾 Crear Backup</h3>
        <p className="text-gray-600 mb-4">
          Descarga una copia completa de la base de datos (db.json) con todos los clientes, 
          servicios y recibos.
        </p>
        
        <button onClick={handleDownloadBackup} className="btn-primary w-full">
          📦 Descargar Backup JSON
        </button>
      </div>

      {/* Restore Backup */}
      <div className="card border-yellow-300 bg-yellow-50">
        <h3 className="text-lg font-semibold mb-4 text-yellow-800">⚠️ Restaurar Backup</h3>
        <p className="text-yellow-700 mb-4">
          <strong>Advertencia:</strong> Esto reemplazará todos los datos actuales. 
          Asegúrate de tener un backup reciente antes de continuar.
        </p>
        
        <div className="space-y-4">
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
          
          {restoreFile && (
            <p className="text-sm text-gray-600">
              Archivo seleccionado: <strong>{restoreFile.name}</strong>
            </p>
          )}
          
          <button
            onClick={handleRestore}
            disabled={!restoreFile || restoring}
            className="btn-danger w-full disabled:opacity-50"
          >
            {restoring ? 'Restaurando...' : '🔄 Restaurar Base de Datos'}
          </button>
        </div>
      </div>

      {/* Data Location Info */}
      <div className="card bg-gray-100">
        <h3 className="text-lg font-semibold mb-2">ℹ️ Información</h3>
        <p className="text-sm text-gray-600">
          <strong>Ubicación de datos:</strong> Los datos se almacenan localmente en el archivo 
          <code className="bg-gray-200 px-1 rounded mx-1">backend/data/db.json</code>.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>IDs:</strong> Los recibos usan formato R-0001, clientes C-0001, servicios S-0001.
        </p>
      </div>
    </div>
  );
}

export default ExportBackup;
