import React, { useState, useEffect, useRef } from "react";
import "./juegos.css";

const nivelesLetra = {
  facil: { label: "Fácil", grid: 3, fontSize: 34, tiempo: 12, gap: 16 },
  medio: { label: "Medio", grid: 4, fontSize: 26, tiempo: 9, gap: 10 },
  dificil: { label: "Difícil", grid: 5, fontSize: 18, tiempo: 6, gap: 6 },
};

const nivelesPunto = {
  facil: { label: "Fácil", intervalo: 900 },
  medio: { label: "Medio", intervalo: 600 },
  dificil: { label: "Difícil", intervalo: 300 },
};

const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function randChar(except) {
  let c;
  do {
    c = letras[Math.floor(Math.random() * letras.length)];
  } while (c === except);
  return c;
}

export default function Juegos() {
  const [juegoActivo, setJuegoActivo] = useState("letra"); // letra | punto

  return (
    <main className="juegos-page">
      <header className="juegos-header">
        <h1>🎮 Juegos Visuales</h1>
        <p>Mejora tu concentración y reflejos con estos mini desafíos</p>
      </header>

      <div className="selector">
        <button
          onClick={() => setJuegoActivo("letra")}
          className={`tab-btn ${juegoActivo === "letra" ? "active" : ""}`}
        >
          🔤 Encontrar Letra
        </button>
        <button
          onClick={() => setJuegoActivo("punto")}
          className={`tab-btn ${juegoActivo === "punto" ? "active" : ""}`}
        >
          ⚪ Seguir Punto
        </button>
      </div>

      <section className="juego-contenedor">
        {juegoActivo === "letra" ? <EncontrarLetra /> : <SeguirPunto />}
      </section>
    </main>
  );
}

// =============================
// 🧩 JUEGO 1 - ENCONTRAR LETRA
// =============================
function EncontrarLetra() {
  const [nivel, setNivel] = useState("facil");
  const [jugando, setJugando] = useState(false);
  const [score, setScore] = useState(0);
  const [tiempo, setTiempo] = useState(nivelesLetra[nivel].tiempo);
  const [grid, setGrid] = useState([]);
  const [targetIndex, setTargetIndex] = useState(null);
  const [modo, setModo] = useState("incorrecta");
  const timerRef = useRef(null);

  useEffect(() => {
    setTiempo(nivelesLetra[nivel].tiempo);
  }, [nivel]);

  useEffect(() => {
    if (jugando) {
      timerRef.current = setInterval(() => {
        setTiempo((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setJugando(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [jugando]);

  const generarRonda = () => {
    const cfg = nivelesLetra[nivel];
    const total = cfg.grid * cfg.grid;
    const base = letras[Math.floor(Math.random() * letras.length)];
    const arr = new Array(total).fill(base);

    const isFaltante = Math.random() < 0.5;
    setModo(isFaltante ? "faltante" : "incorrecta");

    const idx = Math.floor(Math.random() * total);
    if (isFaltante) arr[idx] = "";
    else arr[idx] = randChar(base);

    setGrid(arr);
    setTargetIndex(idx);
    setTiempo(cfg.tiempo);
  };

  const iniciar = () => {
    setScore(0);
    setJugando(true);
    generarRonda();
  };

  const reiniciar = () => {
    setJugando(false);
    setGrid([]);
    setScore(0);
    setTiempo(nivelesLetra[nivel].tiempo);
    setTargetIndex(null);
  };

  const handleClick = (index) => {
    if (!jugando) return;
    if (index === targetIndex) {
      setScore((s) => s + 1);
      generarRonda();
    } else {
      setTiempo((t) => Math.max(0, t - 2));
    }
  };

  const cfg = nivelesLetra[nivel];

  return (
    <div className="juego-card">
      <h2>🔤 Encontrar la letra</h2>
      <p className="desc">
        Encuentra la letra diferente o faltante antes de que se acabe el tiempo.
      </p>

      <div className="panel">
        <div className="niveles">
          {Object.keys(nivelesLetra).map((k) => (
            <button
              key={k}
              className={`nivel ${nivel === k ? "activo" : ""}`}
              onClick={() => setNivel(k)}
              disabled={jugando}
            >
              {nivelesLetra[k].label}
            </button>
          ))}
        </div>

        <div className="estado">
          <div>⏱ {tiempo}s</div>
          <div>⭐ {score}</div>
        </div>

        <div className="acciones">
          {!jugando ? (
            <button className="btn" onClick={iniciar}>
              Iniciar
            </button>
          ) : (
            <button className="btn" onClick={reiniciar}>
              Detener
            </button>
          )}
        </div>
      </div>

      <div className="grid-area" style={{ gap: cfg.gap }}>
        {grid.length === 0 && !jugando && (
          <div className="placeholder">Pulsa Iniciar para empezar</div>
        )}
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${cfg.grid}, 1fr)` }}
        >
          {grid.map((cell, i) => (
            <button
              key={i}
              className={`cell ${i === targetIndex ? "target" : ""} ${
                cell === "" ? "empty" : ""
              }`}
              style={{ fontSize: cfg.fontSize }}
              onClick={() => handleClick(i)}
            >
              {cell || " "}
            </button>
          ))}
        </div>
      </div>

      {!jugando && tiempo === 0 && (
        <div className="resultado">
          <h3>Fin del juego 🎉</h3>
          <p>Puntaje: <strong>{score}</strong></p>
          <button className="btn" onClick={iniciar}>Jugar de nuevo</button>
        </div>
      )}
    </div>
  );
}

// =============================
// 🧩 JUEGO 2 - SEGUIR PUNTO
// =============================
function SeguirPunto() {
  const [nivel, setNivel] = useState("facil");
  const [jugando, setJugando] = useState(false);
  const [tiempo, setTiempo] = useState(30);
  const [puntos, setPuntos] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const areaRef = useRef(null);
  const intervaloRef = useRef(null);
  const tiempoRef = useRef(null);

  useEffect(() => {
    if (jugando) {
      tiempoRef.current = setInterval(() => {
        setTiempo((t) => {
          if (t <= 1) {
            clearInterval(tiempoRef.current);
            clearInterval(intervaloRef.current);
            setJugando(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      const intervaloMs = nivelesPunto[nivel].intervalo;
      intervaloRef.current = setInterval(() => moverPunto(), intervaloMs);
    }
    return () => {
      clearInterval(intervaloRef.current);
      clearInterval(tiempoRef.current);
    };
  }, [jugando, nivel]);

  const moverPunto = () => {
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const size = 28;
    const x = Math.random() * (rect.width - size);
    const y = Math.random() * (rect.height - size);
    setPos({ x, y });
  };

  const iniciar = () => {
    setPuntos(0);
    setTiempo(30);
    setJugando(true);
    moverPunto();
  };

  const reiniciar = () => {
    setJugando(false);
    clearInterval(intervaloRef.current);
    clearInterval(tiempoRef.current);
    setTiempo(30);
    setPuntos(0);
    setPos({ x: 50, y: 50 });
  };

  const handleClickPunto = () => {
    if (!jugando) return;
    setPuntos((p) => p + 1);
    moverPunto();
  };

  return (
    <div className="juego-card">
      <h2>⚪ Seguir el Punto</h2>
      <p className="desc">
        Haz clic en el punto tantas veces como puedas antes de que se acabe el tiempo.
      </p>

      <div className="panel">
        <div className="niveles">
          {Object.keys(nivelesPunto).map((k) => (
            <button
              key={k}
              className={`nivel ${nivel === k ? "activo" : ""}`}
              onClick={() => setNivel(k)}
              disabled={jugando}
            >
              {nivelesPunto[k].label}
            </button>
          ))}
        </div>

        <div className="estado">
          <div>⏱ {tiempo}s</div>
          <div>⭐ {puntos}</div>
        </div>

        <div className="acciones">
          {!jugando ? (
            <button className="btn" onClick={iniciar}>
              Iniciar
            </button>
          ) : (
            <button className="btn" onClick={reiniciar}>
              Detener
            </button>
          )}
        </div>
      </div>

      <div className="area-juego" ref={areaRef}>
        <div
          className="punto"
          onClick={handleClickPunto}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        />
      </div>

      {!jugando && tiempo === 0 && (
        <div className="resultado">
          <h3>Tiempo terminado ⏰</h3>
          <p>Puntaje: <strong>{puntos}</strong></p>
          <button className="btn" onClick={iniciar}>Jugar otra vez</button>
        </div>
      )}
    </div>
  );
}
