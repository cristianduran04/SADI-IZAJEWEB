// Reemplaza todo el contenido de tu archivo src/App.js con este código

import React, { useEffect, useState, useCallback } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyCrYxHwxhG7NuJ2s7P_F2ylPyq18yO_Klk",
  authDomain: "sadi-addd2.firebaseapp.com",
  projectId: "sadi-addd2",
  storageBucket: "sadi-addd2.appspot.com",
  messagingSenderId: "945553289571",
  appId: "1:945553289571:web:f48c8ebb751dca7c5e2356",
  measurementId: "G-0FG0WDN1HD"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const getLocalDateTimestamp = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
};
const InspeccionModal = ({ show, nuevaInspeccion, setNuevaInspeccion, setShowInspeccion, agregarInspeccion }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal scrollable">
        <h3>🧪 Nueva Inspección</h3>

        <label className="label">Fecha de inspección</label>
        <input
          className="input"
          type="date"
          value={nuevaInspeccion.fecha}
          onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, fecha: e.target.value })}
        />

        <label className="label">Tipo de inspección</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              value="Post-operación"
              checked={nuevaInspeccion.tipo === 'Post-operación'}
              onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, tipo: e.target.value })}
            /> Post-operación
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="Formal"
              checked={nuevaInspeccion.tipo === 'Formal'}
              onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, tipo: e.target.value })}
            /> Formal
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
            /> Buen estado
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="Mal estado"
              checked={nuevaInspeccion.estado === 'Mal estado'}
              onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, estado: e.target.value })}
            /> Mal estado
          </label>
        </div>

        <input
          className="input"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="Horas de Vuelo"
          value={nuevaInspeccion.horaVuelo}
          onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, horaVuelo: e.target.value })}
        />
        <input
          className="input"
          placeholder="Técnico responsable"
          value={nuevaInspeccion.tecnico}
          onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, tecnico: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Observaciones"
          value={nuevaInspeccion.observaciones}
          onChange={e => setNuevaInspeccion({ ...nuevaInspeccion, observaciones: e.target.value })}
        />
        <div className="modal-buttons">
          <button className="outlined" onClick={() => setShowInspeccion(false)}>Cancelar</button>
          <button onClick={agregarInspeccion}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [documentos, setDocumentos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [nuevoDoc, setNuevoDoc] = useState({ tipo: '', parteNumero: '', serieNumero: '', fechaInicial: new Date().toISOString().substr(0, 10) });
  const [nuevaInspeccion, setNuevaInspeccion] = useState({ tipo: 'Post-operación', estado: 'Buen estado', observaciones: '', horaVuelo: '', tecnico: '', fecha: new Date().toISOString().substr(0, 10) });
  const [showInspeccion, setShowInspeccion] = useState(false);
  const [search, setSearch] = useState('');
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [fin, setFin] = useState(false);

  const [vistaActual, setVistaActual] = useState('documentos');
  const [nuevoEquipo, setNuevoEquipo] = useState({ nombre: '', referencia: '', parteNumero: '', serieNumero: '', ubicacion: '', estado: 'Operativo', fechaUltimaInspeccion: new Date().toISOString().substr(0, 10), observaciones: '' });
  const [equipos, setEquipos] = useState([]);
  const [nombresEquipos, setNombresEquipos] = useState([]);

  const fetchMasDocumentos = useCallback(async () => {
    if (cargando || fin) return;
    setCargando(true);
    let ref = db.collection('documentos').orderBy('fechaInicial', 'desc').limit(10);
    if (ultimoDoc) {
      ref = ref.startAfter(ultimoDoc);
    }
    const snapshot = await ref.get();
    if (snapshot.empty) {
      setFin(true);
    } else {
      const nuevosDocs = snapshot.docs.map(doc => doc.data());
      setDocumentos(prev => [...prev, ...nuevosDocs]);
      setUltimoDoc(snapshot.docs[snapshot.docs.length - 1]);
    }
    setCargando(false);
  }, [cargando, fin, ultimoDoc]);

  const guardarDocumento = async () => {
    const doc = {
      ...nuevoDoc,
      fechaInicial: getLocalDateTimestamp(nuevoDoc.fechaInicial),
      inspecciones
    };
    await db.collection('documentos').add(doc);
    setInspecciones([]);
    setCurrentView('list');
    setDocumentos([]);
    setUltimoDoc(null);
    setFin(false);
    fetchMasDocumentos();
  };

  const agregarInspeccion = async () => {
    const nueva = { ...nuevaInspeccion, fecha: getLocalDateTimestamp(nuevaInspeccion.fecha) };
    if (currentView === 'nuevo') {
      setInspecciones([...inspecciones, nueva]);
    } else if (currentView === 'detalle' && selectedDoc) {
      const snapshot = await db.collection('documentos').where("serieNumero", "==", selectedDoc.serieNumero).get();
      const docId = snapshot.docs[0]?.id;
      if (docId) {
        const nuevas = [...selectedDoc.inspecciones, nueva];
        await db.collection('documentos').doc(docId).update({ inspecciones: nuevas });
        setSelectedDoc({ ...selectedDoc, inspecciones: nuevas });
      }
    }
    setNuevaInspeccion({ tipo: 'Post-operación', estado: 'Buen estado', observaciones: '', horaVuelo: '', tecnico: '', fecha: new Date().toISOString().substr(0, 10) });
    setShowInspeccion(false);
  };

  const totalHoras = (doc) => {
    return doc.inspecciones.reduce((total, ins) => {
      const horas = parseFloat((ins.horaVuelo || '0').replace(',', '.')) || 0;
      return total + horas;
    }, 0).toFixed(1);
  };

  useEffect(() => {
  fetchMasDocumentos();

  const cargarEquipos = async () => {
    const snapshot = await db.collection('equipos').get();
    const data = snapshot.docs.map(doc => doc.data());
    setEquipos(data);
  };

  const cargarNombresEquiposDesdeDocumentos = async () => {
    const snapshot = await db.collection('documentos').get();
    const nombresUnicos = [...new Set(snapshot.docs.map(doc => doc.data().tipo))];
    setNombresEquipos(nombresUnicos);
  };

  cargarEquipos();
  cargarNombresEquiposDesdeDocumentos();
}, [fetchMasDocumentos]);

const [documentosDisponibles, setDocumentosDisponibles] = useState([]);
const [coincidenciasParteSerie, setCoincidenciasParteSerie] = useState([]);

useEffect(() => {
  const coincidencias = documentosDisponibles.filter(doc => doc.tipo === nuevoEquipo.nombre);
  setCoincidenciasParteSerie(coincidencias);
}, [nuevoEquipo.nombre, documentosDisponibles]);


useEffect(() => {
  fetchMasDocumentos();

  const cargarEquipos = async () => {
    const snapshot = await db.collection('equipos').get();
    const data = snapshot.docs.map(doc => doc.data());
    setEquipos(data);
  };

  const cargarDocumentos = async () => {
    const snapshot = await db.collection('documentos').get();
    const data = snapshot.docs.map(doc => doc.data());
    setDocumentosDisponibles(data);

    const nombresUnicos = [...new Set(data.map(doc => doc.tipo))];
    setNombresEquipos(nombresUnicos);
  };

  cargarEquipos();
  cargarDocumentos();
}, [fetchMasDocumentos]);



useEffect(() => {
  setSearch('');
}, [vistaActual]);

useEffect(() => {
  if (currentView === 'nuevo') {
    setNuevoDoc({ tipo: '', parteNumero: '', serieNumero: '', fechaInicial: new Date().toISOString().substr(0, 10) });
    setInspecciones([]);
  }
}, [currentView]);

useEffect(() => {
  if (currentView === 'registroEquipo') {
    setNuevoEquipo({
      nombre: '', referencia: '', parteNumero: '', serieNumero: '',
      ubicacion: '', estado: 'Operativo',
      fechaUltimaInspeccion: new Date().toISOString().substr(0, 10),
      observaciones: ''
    });
  }
}, [currentView]);

useEffect(() => {
  const buscarDatosPorSerie = async () => {
    const serie = nuevoEquipo.serieNumero.trim();

    if (serie === '') {
      // Si se borra el serieNumero, limpiamos también nombre y parte si estaban autocompletados
      setNuevoEquipo(prev => ({
        ...prev,
        nombre: '',
        parteNumero: ''
      }));
      return;
    }

    const snapshot = await db.collection('documentos')
      .where('serieNumero', '==', serie)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0].data();

      setNuevoEquipo(prev => ({
        ...prev,
        // Solo rellenar si están vacíos para no impedir que se borren
        nombre: prev.nombre ? prev.nombre : doc.tipo,
        parteNumero: prev.parteNumero ? prev.parteNumero : doc.parteNumero
      }));
    }
  };

  buscarDatosPorSerie();
}, [nuevoEquipo.serieNumero]);




  const filtrados = documentos.filter(doc =>
    doc.serieNumero.toLowerCase().includes(search.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(search.toLowerCase())
  );

  if (currentView === 'list') {
    return (
      <div className="container">
        <div className="app-bar">📁 {vistaActual === 'documentos' ? 'BASE FRONTINO' : 'CONTROL'}</div>


        <div className="toggle-buttons">
          <button onClick={() => setVistaActual('documentos')} className={vistaActual === 'documentos' ? 'active' : ''}>📄 BASE FRONTINO</button>
<button onClick={() => setVistaActual('equipos')} className={vistaActual === 'equipos' ? 'active' : ''}>🛠️ CONTROL</button>

        </div>

        <input type="text" placeholder={`Buscar por ${vistaActual === 'documentos' ? 'serie o tipo' : 'nombre o referencia'}...`} value={search} onChange={e => setSearch(e.target.value)} />

        {vistaActual === 'documentos' && filtrados.map((doc, index) => (
          <div key={index} className="card" onClick={() => { setSelectedDoc(doc); setCurrentView('detalle'); }}>
            <p><strong>📌 Equipo:</strong> {doc.tipo}</p>
            <p><strong>🔧 Parte:</strong> {doc.parteNumero}</p>
            <p><strong>🔢 Serie:</strong> {doc.serieNumero}</p>
            <p><strong>🔍 Inspecciones:</strong> {doc.inspecciones?.length || 0}</p>
          </div>
        ))}

        {vistaActual === 'equipos' && equipos.filter(eq =>
  eq.nombre.toLowerCase().includes(search.toLowerCase()) ||
  eq.referencia.toLowerCase().includes(search.toLowerCase())
).map((eq, idx) => (
  <div key={idx} className="card" onClick={() => {
    setSelectedDoc(eq);      // Guardar equipo seleccionado
    setCurrentView('detalleEquipo');  // Ir a vista de detalle
  }}>
    <p><strong>🔧 Nombre:</strong> {eq.nombre}</p>
    <p><strong>🔢 Serie Nº:</strong> {eq.serieNumero}</p>
    <p><strong>📍 Ubicación:</strong> {eq.ubicacion}</p>
    <p><strong>⚙️ Estado:</strong> {eq.estado}</p>
    <p><strong>📅 Última inspección:</strong> {new Date(eq.fechaUltimaInspeccion).toLocaleDateString()}</p>
  </div>
))}


        {vistaActual === 'documentos' && !fin && (
          <button onClick={fetchMasDocumentos} disabled={cargando} className="outlined">
            {cargando ? 'Cargando...' : 'Ver más'}
          </button>
        )}

        {vistaActual === 'documentos' && (
          <button className="fab" onClick={() => setCurrentView('nuevo')}>➕</button>
        )}

        {vistaActual === 'equipos' && (
          <button className="fab" onClick={() => setCurrentView('registroEquipo')}>➕</button>
        )}
      </div>
    );
  }
  if (currentView === 'detalleEquipo' && selectedDoc) {
  const equipo = selectedDoc; // reutilizamos selectedDoc como equipo seleccionado
  return (
    <div className="container">
      <div className="app-bar">🛠️ Detalles del Equipo</div>
      <div className="card">
        <p><strong>🔧 Nombre:</strong> {equipo.nombre}</p>
        <p><strong>🔧 Parte Nº:</strong> {equipo.parteNumero}</p>
        <p><strong>🔢 Serie Nº:</strong> {equipo.serieNumero}</p>
        <p><strong>📍 Ubicación:</strong> {equipo.ubicacion}</p>
        <p><strong>⚙️ Estado:</strong> {equipo.estado}</p>
        <p><strong>📅 Última inspección:</strong> {new Date(equipo.fechaUltimaInspeccion).toLocaleDateString()}</p>
        <p><strong>📝 Observaciones:</strong> {equipo.observaciones}</p>
      </div>
      <div className="modal-buttons">
        <button className="outlined" onClick={() => setCurrentView('list')}>⬅️ Volver</button>
        <button className="outlined" onClick={() => setCurrentView('editarEquipo')}>✏️ Editar</button>
        <button className="danger" onClick={async () => {
          const snapshot = await db.collection('equipos').where("serieNumero", "==", equipo.serieNumero).get();
          const docId = snapshot.docs[0]?.id;
          if (docId) {
            await db.collection('equipos').doc(docId).delete();
            setEquipos(equipos.filter(eq => eq.serieNumero !== equipo.serieNumero));
            setCurrentView('list');
          }
        }}>🗑 Eliminar</button>
      </div>
    </div>
  );
}

  if (currentView === 'registroEquipo') {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <h3>🛠️ Registro de Nuevo Equipo</h3>
<input
  className="input"
  list="nombres-sugeridos"
  placeholder="Nombre del equipo"
  value={nuevoEquipo.nombre}
  onChange={e => setNuevoEquipo({ ...nuevoEquipo, nombre: e.target.value })}
/>
<datalist id="nombres-sugeridos">
  {nombresEquipos.map((nombre, i) => (
    <option key={i} value={nombre} />
  ))}
</datalist>

         {coincidenciasParteSerie.length > 0 ? (
  <>
    <label className="label">Parte Nº</label>
    <select
      className="input"
      value={nuevoEquipo.parteNumero}
      onChange={e => setNuevoEquipo({ ...nuevoEquipo, parteNumero: e.target.value })}
    >
      <option value="">Selecciona una parte</option>
      {[...new Set(coincidenciasParteSerie.map(doc => doc.parteNumero))].map((parte, idx) => (
        <option key={idx} value={parte}>{parte}</option>
      ))}
    </select>

    <label className="label">Serie Nº</label>
    <select
      className="input"
      value={nuevoEquipo.serieNumero}
      onChange={e => setNuevoEquipo({ ...nuevoEquipo, serieNumero: e.target.value })}
    >
      <option value="">Selecciona una serie</option>
      {[...new Set(coincidenciasParteSerie.map(doc => doc.serieNumero))].map((serie, idx) => (
        <option key={idx} value={serie}>{serie}</option>
      ))}
    </select>
  </>
) : (
  <>
    <input
      className="input"
      placeholder="Parte Nº"
      value={nuevoEquipo.parteNumero}
      onChange={e => setNuevoEquipo({ ...nuevoEquipo, parteNumero: e.target.value })}
    />
    <input
      className="input"
      placeholder="Serie Nº"
      value={nuevoEquipo.serieNumero}
      onChange={e => setNuevoEquipo({ ...nuevoEquipo, serieNumero: e.target.value })}
    />
  </>
)}

          <input className="input" placeholder="Ubicación" value={nuevoEquipo.ubicacion} onChange={e => setNuevoEquipo({ ...nuevoEquipo, ubicacion: e.target.value })} />
          <label className="label">Estado:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input type="radio" value="Operativo" checked={nuevoEquipo.estado === 'Operativo'} onChange={e => setNuevoEquipo({ ...nuevoEquipo, estado: e.target.value })} />
              Operativo
            </label>
            <label className="radio-option">
              <input type="radio" value="No operativo" checked={nuevoEquipo.estado === 'No operativo'} onChange={e => setNuevoEquipo({ ...nuevoEquipo, estado: e.target.value })} />
              No operativo
            </label>
          </div>
          <label className="label">Fecha última inspección</label>
          <input className="input" type="date" value={nuevoEquipo.fechaUltimaInspeccion} onChange={e => setNuevoEquipo({ ...nuevoEquipo, fechaUltimaInspeccion: e.target.value })} />
          <textarea className="input" placeholder="Observaciones" value={nuevoEquipo.observaciones} onChange={e => setNuevoEquipo({ ...nuevoEquipo, observaciones: e.target.value })} />
          <div className="modal-buttons">
            <button className="outlined" onClick={() => {
  setNuevoDoc({ tipo: '', parteNumero: '', serieNumero: '', fechaInicial: new Date().toISOString().substr(0, 10) });
  setInspecciones([]);
  setCurrentView('list');
}}>Cancelar</button>

            <button onClick={async () => {
              const equipo = { ...nuevoEquipo, fechaUltimaInspeccion: getLocalDateTimestamp(nuevoEquipo.fechaUltimaInspeccion) };
              await db.collection('equipos').add(equipo);
              setEquipos([...equipos, equipo]);
              setCurrentView('list');
            }}>Guardar equipo</button>
          </div>
        </div>
      </div>
    );
  }

  // Resto de vistas como nuevo documento, detalle e inspecciones (idénticos a antes)
  // Puedes mantener tu lógica existente para currentView === 'nuevo' y 'detalle'

  if (currentView === 'nuevo') {
    return (<>
      <div className="modal-backdrop">
        <div className="modal">
          <h3>📝 Nuevo Documento</h3>
          <input className="input" placeholder="Equipo" value={nuevoDoc.tipo} onChange={e => setNuevoDoc({ ...nuevoDoc, tipo: e.target.value })} />
          <input className="input" placeholder="Parte Nº" value={nuevoDoc.parteNumero} onChange={e => setNuevoDoc({ ...nuevoDoc, parteNumero: e.target.value })} />
          <input className="input" placeholder="Serie Nº" value={nuevoDoc.serieNumero} onChange={e => setNuevoDoc({ ...nuevoDoc, serieNumero: e.target.value })} />
          <input className="input" type="date" value={nuevoDoc.fechaInicial} onChange={e => setNuevoDoc({ ...nuevoDoc, fechaInicial: e.target.value })} />
          <button onClick={() => setShowInspeccion(true)}>➕ Agregar Inspección</button>
          {inspecciones.length > 0 && (<ul>{inspecciones.map((ins, i) => (<li key={i}>{ins.tipo} - {ins.estado}</li>))}</ul>)}
          <div className="modal-buttons">
            <button className="outlined" onClick={() => setCurrentView('list')}>Cancelar</button>
            <button onClick={guardarDocumento}>💾 Guardar Documento</button>
          </div>
        </div>
      </div>
      <InspeccionModal
        show={showInspeccion}
        nuevaInspeccion={nuevaInspeccion}
        setNuevaInspeccion={setNuevaInspeccion}
        setShowInspeccion={setShowInspeccion}
        agregarInspeccion={agregarInspeccion}
      />
    </>);
  }

  if (currentView === 'detalle') {
    return (<>
      <div className="container">
        <div className="app-bar">📄 Detalles del Documento</div>
        <button onClick={() => setShowInspeccion(true)}>➕ Agregar Inspección</button>
        <button className="danger" onClick={async () => {
          const snapshot = await db.collection('documentos').where("serieNumero", "==", selectedDoc.serieNumero).get();
          const docId = snapshot.docs[0]?.id;
          if (docId) {
            await db.collection('documentos').doc(docId).delete();
            setDocumentos([]);
            setUltimoDoc(null);
            setFin(false);
            setCurrentView('list');
            fetchMasDocumentos();
          }
        }}>🗑 Eliminar</button>
        <div className="card">
          <p><strong>📌 Tipo:</strong> {selectedDoc.tipo}</p>
          <p><strong>🔧 Parte Nº:</strong> {selectedDoc.parteNumero}</p>
          <p><strong>🔢 Serie Nº:</strong> {selectedDoc.serieNumero}</p>
          <p><strong>⏱️ Total horas vuelo:</strong> {totalHoras(selectedDoc)} h</p>
        </div>
        <h3>📑 Inspecciones</h3>
        {selectedDoc.inspecciones.length === 0 ? <p>No hay inspecciones aún.</p> : (
          <ul>
            {selectedDoc.inspecciones.map((ins, i) => (
              <li key={i}>
                <p><strong>🧪 Tipo:</strong> {ins.tipo} | <strong>⚙️ Estado:</strong> {ins.estado}</p>
                <p><strong>📅 Fecha:</strong> {new Date(ins.fecha).toLocaleDateString()}</p>
                <p><strong>✈️ Horas:</strong> {ins.horaVuelo} | <strong>👨‍🔧 Técnico:</strong> {ins.tecnico}</p>
                <p><strong>📝 Obs:</strong> {ins.observaciones}</p>
                <button className="danger" onClick={async () => {
                  const snapshot = await db.collection('documentos').where("serieNumero", "==", selectedDoc.serieNumero).get();
                  const docId = snapshot.docs[0]?.id;
                  if (docId) {
                    const nuevas = selectedDoc.inspecciones.filter((_, j) => j !== i);
                    await db.collection('documentos').doc(docId).update({ inspecciones: nuevas });
                    fetchMasDocumentos();
                    setSelectedDoc({ ...selectedDoc, inspecciones: nuevas });
                  }
                }}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
        <button className="outlined" onClick={() => setCurrentView('list')}>⬅️ Volver</button>
      </div>
      <InspeccionModal
        show={showInspeccion}
        nuevaInspeccion={nuevaInspeccion}
        setNuevaInspeccion={setNuevaInspeccion}
        setShowInspeccion={setShowInspeccion}
        agregarInspeccion={agregarInspeccion}
      />
    </>);
  }

  return null;
}

export default App;
