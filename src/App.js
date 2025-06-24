// src/App.js
import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyCrYxHwxhG7NuJ2s7P_F2ylPyq18yO_Klk",
  authDomain: "sadi-addd2.firebaseapp.com",
  projectId: "sadi-addd2",
  storageBucket: "sadi-addd2.firebasestorage.app",
  messagingSenderId: "945553289571",
  appId: "1:945553289571:web:f48c8ebb751dca7c5e2356",
  measurementId: "G-0FG0WDN1HD"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

function App() {
  const [documentos, setDocumentos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [nuevoDoc, setNuevoDoc] = useState({
    tipo: '', parteNumero: '', serieNumero: '',
    fechaInicial: new Date().toISOString().substr(0, 10)
  });
  const [nuevaInspeccion, setNuevaInspeccion] = useState({
    tipo: 'Formal', estado: 'Buen estado', observaciones: '',
    horaVuelo: '', tecnico: '', fecha: new Date().toISOString().substr(0, 10)
  });
  const [showInspeccion, setShowInspeccion] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDocumentos = async () => {
    const snapshot = await db.collection('documentos').get();
    const data = snapshot.docs.map(doc => doc.data());
    setDocumentos(data);
  };

  const guardarDocumento = async () => {
    const doc = { ...nuevoDoc, fechaInicial: new Date(nuevoDoc.fechaInicial).getTime(), inspecciones };
    await db.collection('documentos').add(doc);
    setInspecciones([]);
    setCurrentView('list');
    fetchDocumentos();
  };

  const agregarInspeccion = () => {
    const ins = { ...nuevaInspeccion, fecha: new Date(nuevaInspeccion.fecha).getTime() };
    setInspecciones([...inspecciones, ins]);
    setNuevaInspeccion({
      tipo: 'Formal', estado: 'Buen estado', observaciones: '',
      horaVuelo: '', tecnico: '', fecha: new Date().toISOString().substr(0, 10)
    });
    setShowInspeccion(false);
  };

  const totalHoras = (doc) => {
    return doc.inspecciones.reduce((total, ins) => {
      const horas = parseFloat((ins.horaVuelo || '0').replace(',', '.')) || 0;
      return total + horas;
    }, 0).toFixed(1);
  };

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const filtrados = documentos.filter(doc =>
    doc.serieNumero.toLowerCase().includes(search.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(search.toLowerCase())
  );

  if (currentView === 'list') {
    return (
      <div className="container">
        <div className="app-bar">📂 Documentos</div>

        <input
          type="text"
          placeholder="Buscar por serie o tipo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {filtrados.map((doc, index) => (
          <div key={index} className="card" onClick={() => {
            setSelectedDoc(doc);
            setCurrentView('detalle');
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p>📌 <strong>Equipo:</strong> {doc.tipo}</p>
              <p>🔧 <strong>Parte:</strong> {doc.parteNumero}</p>
              <p>🔢 <strong>Serie:</strong> {doc.serieNumero}</p>
              <p>📅 <strong>Fecha:</strong> {new Date(doc.fechaInicial).toLocaleDateString()}</p>
              <p>🔍 <strong>Inspecciones:</strong> {doc.inspecciones?.length || 0}</p>
            </div>
          </div>
        ))}

        <button className="fab" onClick={() => setCurrentView('nuevo')}>
          ➕
        </button>
      </div>
    );
  }

  if (currentView === 'nuevo') {
    return (
      <>
        <div className="modal-backdrop">
          <div className="modal">
            <h3>📝 Nuevo Documento</h3>

            <input placeholder="Equipo" value={nuevoDoc.tipo} onChange={e => setNuevoDoc({ ...nuevoDoc, tipo: e.target.value })} />
            <input placeholder="Parte Nº" value={nuevoDoc.parteNumero} onChange={e => setNuevoDoc({ ...nuevoDoc, parteNumero: e.target.value })} />
            <input placeholder="Serie Nº" value={nuevoDoc.serieNumero} onChange={e => setNuevoDoc({ ...nuevoDoc, serieNumero: e.target.value })} />
            <input type="date" value={nuevoDoc.fechaInicial} onChange={e => setNuevoDoc({ ...nuevoDoc, fechaInicial: e.target.value })} />

            <button onClick={() => setShowInspeccion(true)}>➕ Agregar Inspección</button>

            {inspecciones.length > 0 && (
              <>
                <p className="section-title">Inspecciones Agregadas:</p>
                <ul className="list-group" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {inspecciones.map((ins, i) => (
                    <li key={i} className="list-group-item">
                      {ins.tipo} - {ins.estado}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="modal-buttons">
              <button className="outlined" onClick={() => setCurrentView('list')}>Cancelar</button>
              <button onClick={guardarDocumento}>💾 Guardar Documento</button>
            </div>
          </div>
        </div>

        {showInspeccion && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>🧪 Nueva Inspección</h3>

              <input type="date" value={nuevaInspeccion.fecha} onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, fecha: e.target.value })} />

              <label className="label">Tipo de inspección</label>
<div className="radio-group">
  <label className="radio-option">
    <input
      type="radio"
      value="Formal"
      checked={nuevaInspeccion.tipo === 'Formal'}
      onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, tipo: e.target.value })}
    />
    Formal
  </label>
  <label className="radio-option">
    <input
      type="radio"
      value="Post-operación"
      checked={nuevaInspeccion.tipo === 'Post-operación'}
      onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, tipo: e.target.value })}
    />
    Post-operación
  </label>
</div>

<label className="label">Estado</label>
<div className="radio-group">
  <label className="radio-option">
    <input
      type="radio"
      value="Buen estado"
      checked={nuevaInspeccion.estado === 'Buen estado'}
      onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, estado: e.target.value })}
    />
    Buen estado
  </label>
  <label className="radio-option">
    <input
      type="radio"
      value="Mal estado"
      checked={nuevaInspeccion.estado === 'Mal estado'}
      onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, estado: e.target.value })}
    />
    Mal estado
  </label>
</div>


              <input placeholder="Horas de Vuelo" value={nuevaInspeccion.horaVuelo} onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, horaVuelo: e.target.value })} />
              <input placeholder="Técnico responsable" value={nuevaInspeccion.tecnico} onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, tecnico: e.target.value })} />
              <textarea placeholder="Observaciones" value={nuevaInspeccion.observaciones} onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, observaciones: e.target.value })} />

              <div className="modal-buttons">
                <button className="outlined" onClick={() => setShowInspeccion(false)}>Cancelar</button>
                <button onClick={agregarInspeccion}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Vista Detalle Documento
 if (currentView === 'detalle') {
  return (
    <div className="container">
      <div className="app-bar">📄 Detalles del Documento</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={() => setShowInspeccion(true)}>➕ Agregar Inspección</button>
        <button className="danger" onClick={async () => {
          const snapshot = await db.collection('documentos').where("serieNumero", "==", selectedDoc.serieNumero).get();
          const docId = snapshot.docs[0]?.id;
          if (docId) {
            await db.collection('documentos').doc(docId).delete();
            fetchDocumentos();
            setCurrentView('list');
          }
        }}>🗑 Eliminar</button>
      </div>

      <div className="card">
        <h3>📄 Información del Documento</h3>
        <p>📌 <strong>Tipo:</strong> {selectedDoc.tipo}</p>
        <p>🔧 <strong>Parte Nº:</strong> {selectedDoc.parteNumero}</p>
        <p>🔢 <strong>Serie Nº:</strong> {selectedDoc.serieNumero}</p>
        <p>📅 <strong>Fecha:</strong> {new Date(selectedDoc.fechaInicial).toLocaleDateString()}</p>
        <p className="total-horas">⏱️ <strong>Total horas vuelo T/T:</strong> {totalHoras(selectedDoc)} h</p>
      </div>

      <h3 style={{ marginTop: '24px' }}>📑 Inspecciones</h3>
      {selectedDoc.inspecciones.length === 0 ? (
        <p>No hay inspecciones aún.</p>
      ) : (
        <ul className="list-group">
          {selectedDoc.inspecciones.map((ins, idx) => (
            <li key={idx} className="list-group-item">
              <p>🕒 <strong>Fecha:</strong> {new Date(ins.fecha).toLocaleDateString()}</p>
              <p>🧪 <strong>Tipo:</strong> {ins.tipo}</p>
              <p>⚙️ <strong>Estado:</strong> {ins.estado}</p>
              <p>✈️ <strong>Horas Vuelo:</strong> {ins.horaVuelo}</p>
              <p>👨‍🔧 <strong>Técnico:</strong> {ins.tecnico}</p>
              <p>📝 <strong>Observaciones:</strong> {ins.observaciones}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="danger" onClick={async () => {
                  const snapshot = await db.collection('documentos').where("serieNumero", "==", selectedDoc.serieNumero).get();
                  const docId = snapshot.docs[0]?.id;
                  if (docId) {
                    const nuevas = selectedDoc.inspecciones.filter((_, i) => i !== idx);
                    await db.collection('documentos').doc(docId).update({ inspecciones: nuevas });
                    fetchDocumentos();
                    const updated = { ...selectedDoc, inspecciones: nuevas };
                    setSelectedDoc(updated);
                  }
                }}>🗑 Eliminar Inspección</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="outlined" onClick={() => setCurrentView('list')}>⬅️ Volver</button>
    </div>
  );
}


  return null;
}

export default App;
