'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Music, Piano, Guitar, BookOpen, Volume2, AudioLines, Info, X, SlidersHorizontal } from 'lucide-react';
import {
  obterNotaInterna,
  obterNomePorIndice,
  obterNotasDaEscala,
  TIPOS_ACORDES,
  ESCALAS,
  Escala,
  MODOS_GREGOS,
  getViolaoShape,
  obterIntervalosInvertidos,
  Notacao
} from '@/lib/music-theory';
import { tocarSomAcorde, initAudio } from '@/lib/audio';

type Tab = 'acordes' | 'harmonia';
type Instrument = 'piano' | 'violao';

export default function ChordProApp() {
  const [activeTab, setActiveTab] = useState<Tab>('acordes');
  
  // Acordes State
  const [instrument, setInstrument] = useState<Instrument>('piano');
  const [rootNote, setRootNote] = useState('C');
  const [accidental, setAccidental] = useState<Notacao>('natural');
  const [searchQuery, setSearchQuery] = useState('');
  const [inversion, setInversion] = useState(0);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  // Harmonia State
  const [harmRootNote, setHarmRootNote] = useState('C');
  const [harmAccidental, setHarmAccidental] = useState<Notacao>('natural');
  const [harmView, setHarmView] = useState<'none' | 'escalas' | 'campos' | 'modos'>('none');
  const [formatoCampo, setFormatoCampo] = useState<'triades' | 'tetrades'>('triades');

  const currentNote = useMemo(() => obterNotaInterna(rootNote, accidental), [rootNote, accidental]);
  
  const filteredChords = useMemo(() => {
    return TIPOS_ACORDES.filter(tipo => {
      let baixoExibicao = "";
      if (inversion > 0 && inversion < tipo.intervalos.length) {
        const notaBaixoIndice = (currentNote.indice + tipo.intervalos[inversion]) % 12;
        const notaBaixoNome = obterNomePorIndice(notaBaixoIndice, accidental);
        baixoExibicao = "/" + notaBaixoNome;
      }
      const cifraCompleta = currentNote.nome + tipo.sufixo + baixoExibicao;
      const term = searchQuery.trim().toLowerCase();
      
      if (term && !cifraCompleta.toLowerCase().includes(term) && !tipo.nome.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    }).map(tipo => {
      let baixoExibicao = "";
      if (inversion > 0 && inversion < tipo.intervalos.length) {
        const notaBaixoIndice = (currentNote.indice + tipo.intervalos[inversion]) % 12;
        const notaBaixoNome = obterNomePorIndice(notaBaixoIndice, accidental);
        baixoExibicao = "/" + notaBaixoNome;
      }
      return {
        ...tipo,
        cifraCompleta: currentNote.nome + tipo.sufixo + baixoExibicao,
      };
    });
  }, [currentNote, accidental, inversion, searchQuery]);

  const handlePlayChord = async (intervalos: number[], idx: number) => {
    await initAudio();
    setPlayingIdx(idx);
    tocarSomAcorde(currentNote.indice, intervalos, inversion, instrument);
    
    // Clear animation state after 1.5s
    setTimeout(() => {
      setPlayingIdx(current => current === idx ? null : current);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-4 md:p-8 selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <header className="flex bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 shadow-xl shadow-black/50">
          <button 
            onClick={() => setActiveTab('acordes')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'acordes' ? 'bg-cyan-500 text-neutral-950 shadow-lg shadow-cyan-500/20' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
          >
            <Music className="w-4 h-4" />
            Acordes
          </button>
          <button 
            onClick={() => setActiveTab('harmonia')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'harmonia' ? 'bg-cyan-500 text-neutral-950 shadow-lg shadow-cyan-500/20' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
          >
            <BookOpen className="w-4 h-4" />
            Harmonias
          </button>
        </header>

        {activeTab === 'acordes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Instrument Toggle */}
            <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1">
              <button 
                onClick={() => setInstrument('piano')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${instrument === 'piano' ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                <Piano className="w-4 h-4" /> Piano
              </button>
              <button 
                onClick={() => setInstrument('violao')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${instrument === 'violao' ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                <Guitar className="w-4 h-4" /> Violão
              </button>
            </div>

            {/* Controls Panel */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Tom Fundamental</label>
                <div className="flex gap-2">
                  <select 
                    value={rootNote}
                    onChange={e => setRootNote(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                  >
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                    {(['natural', 'sustenido', 'bemol'] as const).map(acc => (
                      <button
                        key={acc}
                        onClick={() => setAccidental(acc)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${accidental === acc ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-neutral-200'}`}
                      >
                        {acc === 'natural' ? '♮' : acc === 'sustenido' ? '#' : 'b'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Buscar Cifra</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Ex: m, sus, 7, º..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>
              </div>
            </div>

            {/* Inversions */}
            <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1.5 overflow-x-auto snap-x hide-scrollbar">
              {['Raiz', '1ª Inv.', '2ª Inv.', '3ª Inv.'].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => setInversion(idx)}
                  className={`flex-1 min-w-[80px] snap-center py-2.5 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${inversion === idx ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Chord List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredChords.map((chord, idx) => {
                const isPlaying = playingIdx === idx;
                
                return (
                  <div 
                    key={idx}
                    onClick={() => handlePlayChord(chord.intervalos, idx)}
                    className={`group bg-neutral-900 border ${isPlaying ? 'border-cyan-500 bg-neutral-900/80 shadow-cyan-500/20 shadow-lg' : 'border-neutral-800 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10'} rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 cursor-pointer transition-all ${!isPlaying && 'hover:-translate-y-0.5'}`}
                  >
                    <div className="w-full md:w-48 flex items-center justify-between md:flex-col md:items-start md:justify-center shrink-0">
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{chord.cifraCompleta}</h3>
                        <p className="text-xs text-neutral-400 font-medium mt-0.5">{chord.nome}</p>
                      </div>
                      <button className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-neutral-950'}`}>
                        {isPlaying ? <AudioLines className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className={`flex-1 w-full flex justify-center rounded-xl p-4 md:p-2 border transition-colors ${isPlaying ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-neutral-950/50 border-neutral-800/50'}`}>
                      {instrument === 'piano' ? (
                        <KeyboardDiagram tomIndice={currentNote.indice} intervalos={chord.intervalos} inversaoAtiva={inversion} />
                      ) : (
                        <FretboardDiagram tomIndice={currentNote.indice} sufixo={chord.sufixo} inversaoAtiva={inversion} />
                      )}
                    </div>

                    <div className={`hidden md:flex shrink-0 w-12 h-12 rounded-full items-center justify-center transition-all shadow-lg ${isPlaying ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] ring-4 ring-cyan-500/30' : 'bg-neutral-800 text-neutral-400 group-hover:bg-cyan-500 group-hover:text-neutral-950'}`}>
                      {isPlaying ? <AudioLines className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                    </div>
                  </div>
                );
              })}
              
              {filteredChords.length === 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                  <Info className="w-12 h-12 text-neutral-600 mb-4" />
                  <p className="text-neutral-300 font-medium">Nenhum acorde encontrado.</p>
                  <p className="text-neutral-500 text-sm mt-1">Tente buscar por &quot;m&quot;, &quot;7&quot;, etc.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'harmonia' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {harmView === 'none' ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-12 text-center shadow-xl">
                  <h2 className="text-3xl font-light mb-8 bg-gradient-to-br from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                    Estudo de Harmonias
                  </h2>
                  
                  <div className="max-w-xs mx-auto space-y-2 mb-10 text-left">
                    <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase text-center block">Tom de Referência</label>
                    <div className="flex gap-2">
                      <select 
                        value={harmRootNote}
                        onChange={e => setHarmRootNote(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                      >
                        {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <div className="flex bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                        {(['natural', 'sustenido', 'bemol'] as const).map(acc => (
                          <button
                            key={acc}
                            onClick={() => setHarmAccidental(acc)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${harmAccidental === acc ? 'bg-cyan-500 text-neutral-950' : 'text-neutral-400 hover:text-neutral-200'}`}
                          >
                            {acc === 'natural' ? '♮' : acc === 'sustenido' ? '#' : 'b'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                    <button 
                      onClick={() => setHarmView('escalas')}
                      className="flex-1 bg-neutral-950 border-2 border-neutral-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-neutral-200 py-4 px-6 rounded-2xl font-semibold transition-all"
                    >
                      Escalas
                    </button>
                    <button 
                      onClick={() => setHarmView('campos')}
                      className="flex-1 bg-neutral-950 border-2 border-neutral-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-neutral-200 py-4 px-6 rounded-2xl font-semibold transition-all"
                    >
                      Campos Harmônicos
                    </button>
                    <button 
                      onClick={() => setHarmView('modos')}
                      className="flex-1 bg-neutral-950 border-2 border-neutral-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-neutral-200 py-4 px-6 rounded-2xl font-semibold transition-all"
                    >
                      Modos Gregos
                    </button>
                  </div>
                </div>
             ) : (
               <div className="space-y-6">
                 <div className="flex items-center justify-between flex-wrap gap-3">
                   <button 
                     id="btn-voltar-harmonia"
                     onClick={() => setHarmView('none')}
                     className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl cursor-pointer"
                   >
                     ← Voltar
                   </button>

                   {harmView === 'campos' && (
                     <div className="flex items-center bg-neutral-950 border border-neutral-800 p-1.5 rounded-2xl shadow-inner">
                       <button
                         id="btn-campo-triades"
                         onClick={() => setFormatoCampo('triades')}
                         className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                           formatoCampo === 'triades'
                             ? 'bg-neutral-800 text-white shadow-sm'
                             : 'text-neutral-400 hover:text-neutral-200'
                         }`}
                       >
                         Tríades
                       </button>
                       <button
                         id="btn-campo-tetrades"
                         onClick={() => setFormatoCampo('tetrades')}
                         className={`px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                           formatoCampo === 'tetrades'
                             ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                             : 'text-neutral-300 hover:text-amber-400'
                         }`}
                       >
                         <span>Tétrades</span>
                         {formatoCampo === 'tetrades' && (
                           <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                         )}
                       </button>
                     </div>
                   )}
                 </div>
                 
                 <div className="space-y-4">
                   <HarmoniaResults 
                     view={harmView} 
                     rootNote={harmRootNote} 
                     accidental={harmAccidental} 
                     formatoCampo={formatoCampo}
                   />
                 </div>
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-Components
// -----------------------------------------------------------------------------

function HarmoniaResults({ 
  view, 
  rootNote, 
  accidental,
  formatoCampo = 'triades'
}: { 
  view: 'escalas' | 'campos' | 'modos'; 
  rootNote: string; 
  accidental: Notacao;
  formatoCampo?: 'triades' | 'tetrades';
}) {
  const [modalEscala, setModalEscala] = useState<Escala | null>(null);
  const tom = useMemo(() => obterNotaInterna(rootNote, accidental), [rootNote, accidental]);

  if (view === 'modos') {
    return (
      <>
        {MODOS_GREGOS.map((modo, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-cyan-500 rounded-2xl p-5 shadow-lg">
            <h4 className="text-lg font-bold text-amber-400 mb-4">{idx + 1}º Modo: {modo.nome} de {tom.nome}</h4>
            <div className="flex flex-wrap gap-2.5">
              {modo.intervalos.map((intervalo, i) => {
                const notaIndice = (tom.indice + intervalo) % 12;
                const notaExib = obterNomePorIndice(notaIndice, accidental);
                return (
                  <div key={i} className="flex-1 min-w-[60px] bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-center">
                    <span className="block text-lg font-bold text-white">{notaExib}</span>
                    <span className="block text-[10px] uppercase text-neutral-500 font-bold mt-0.5">{i + 1}ª</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {ESCALAS.map((escala, i) => {
        const notasDaEscala = obterNotasDaEscala(rootNote, accidental, escala.intervalos);
        const sufixosUsados = view === 'campos'
          ? (formatoCampo === 'tetrades' ? escala.sufixosTetrades : escala.sufixosTriades)
          : null;

        return (
          <div key={i} className="bg-neutral-900 border border-neutral-800 border-l-4 border-l-cyan-500 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <h4 className="text-lg font-bold text-amber-400">
                  {tom.nome} {escala.nome}
                </h4>
                {view === 'campos' && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    formatoCampo === 'tetrades' 
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}>
                    {formatoCampo === 'tetrades' ? 'Tétrades' : 'Tríades'}
                  </span>
                )}
              </div>

              {view === 'escalas' && (
                <button
                  id={`btn-intervalos-${i}`}
                  onClick={() => setModalEscala(escala)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-neutral-950 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
                  title={`Ver intervalos de ${tom.nome} ${escala.nome}`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  ( Intervalos )
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {escala.intervalos.map((_, idx) => {
                let label = notasDaEscala[idx];
                if (view === 'campos' && sufixosUsados) {
                  label += sufixosUsados[idx];
                }
                const grau = escala.graus[idx];

                return (
                  <div key={idx} className="flex-1 min-w-[60px] bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-center">
                    <span className="block text-lg font-bold text-white">{label}</span>
                    <span className="block text-[10px] uppercase text-neutral-500 font-bold mt-0.5">{grau}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {modalEscala && (
        <IntervalosModal
          escala={modalEscala}
          rootNote={rootNote}
          accidental={accidental}
          onClose={() => setModalEscala(null)}
        />
      )}
    </>
  );
}

function IntervalosModal({
  escala,
  rootNote,
  accidental,
  onClose
}: {
  escala: Escala;
  rootNote: string;
  accidental: Notacao;
  onClose: () => void;
}) {
  const tom = useMemo(() => obterNotaInterna(rootNote, accidental), [rootNote, accidental]);
  const notas = useMemo(() => obterNotasDaEscala(rootNote, accidental, escala.intervalos), [rootNote, accidental, escala]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="modal-intervalos-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-intervalos-content"
        className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">Escala Musical</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{tom.nome} {escala.nome}</h3>
          </div>
          <button
            id="btn-fechar-modal"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Fechar janela"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sequência de Notas como solicitado */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-neutral-400">
            {tom.nome} {escala.nome}
          </label>
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center shadow-inner">
            <span className="text-lg md:text-xl font-bold text-white tracking-wide">
              {notas.join(' - ')} .
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-2 pt-1">
            {notas.map((nota, idx) => (
              <div key={idx} className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-2.5 text-center">
                <span className="block text-base md:text-lg font-bold text-amber-400">{nota}</span>
                <span className="block text-[10px] uppercase font-bold text-neutral-500 mt-0.5">{escala.graus[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estrutura de Intervalos como solicitado */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-neutral-400">
            Estrutura de Intervalos
          </label>
          <div className="bg-neutral-950 border border-cyan-500/40 rounded-2xl p-4 text-center shadow-inner">
            <span className="text-lg md:text-xl font-mono font-bold text-cyan-400 tracking-wider">
              {escala.estruturaIntervalos}
            </span>
          </div>
        </div>

        {/* Passo a Passo Visual Nota a Nota */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-bold text-neutral-400">
            Progressão Passo a Passo
          </label>
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 md:p-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[340px] gap-1 text-center">
              {notas.map((nota, idx) => {
                const passo = escala.passos[idx];
                return (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-white">
                      {nota}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
                      {passo}
                    </span>
                  </div>
                );
              })}
              <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-400">
                {notas[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Legenda dos Intervalos */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-400 space-y-1.5">
          <div className="font-semibold text-neutral-300">Legenda de Intervalos:</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong className="text-cyan-400">T</strong> = Tom (2 semitons)</span>
            <span><strong className="text-cyan-400">ST</strong> = Semitom (1 semitom)</span>
            <span><strong className="text-cyan-400">1 T e 1/2</strong> = 1 Tom e meio (3 semitons)</span>
          </div>
        </div>

        {/* Rodapé com botão Fechar */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-fechar-modal-rodape"
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}


function KeyboardDiagram({ tomIndice, intervalos, inversaoAtiva }: { tomIndice: number, intervalos: number[], inversaoAtiva: number }) {
  const intervalosFinais = obterIntervalosInvertidos(intervalos, inversaoAtiva);
  const ativos = intervalosFinais.map(i => (tomIndice + i) % 12);
  const idxBaixo = ativos[0];

  const brancas = [0,2,4,5,7,9,11,12,14,16,17];
  const pretas = [
    { nota:1, left:6.2 }, { nota:3, left:15.3 },
    { nota:6, left:33.5 }, { nota:8, left:42.6 }, { nota:10, left:51.7 },
    { nota:13, left:69.9 }, { nota:15, left:79.0 }
  ];

  return (
    <div className="relative flex bg-neutral-900 p-1 rounded-lg h-24 w-full max-w-[340px] border border-neutral-800 shadow-inner">
      {brancas.map((n, i) => {
        const red = n % 12;
        const ativa = ativos.includes(red);
        const baixo = ativa && red === idxBaixo;
        
        let bg = 'bg-white';
        if (baixo) bg = 'bg-rose-500';
        else if (ativa) bg = 'bg-emerald-500';

        return (
          <div 
            key={`w-${i}`}
            className={`flex-1 border-r border-neutral-300 last:border-0 rounded-b-md ${bg} transition-colors duration-300`}
          />
        );
      })}
      
      {pretas.map((p, i) => {
        const red = p.nota % 12;
        const ativa = ativos.includes(red);
        const baixo = ativa && red === idxBaixo;

        let bg = 'bg-neutral-900';
        if (baixo) bg = 'bg-rose-500';
        else if (ativa) bg = 'bg-emerald-500';

        return (
          <div 
            key={`b-${i}`}
            className={`absolute w-[6%] h-[60%] border-x border-b border-black rounded-b-md shadow-sm z-10 ${bg} transition-colors duration-300`}
            style={{ left: `${p.left}%` }}
          />
        );
      })}
    </div>
  );
}

function FretboardDiagram({ tomIndice, sufixo, inversaoAtiva }: { tomIndice: number, sufixo: string, inversaoAtiva: number }) {
  const shape = getViolaoShape(tomIndice, sufixo);
  const casaInicial = shape.casaInicial;

  return (
    <div className="flex flex-col items-center w-32 bg-neutral-950/30 p-2 rounded-xl">
      <div className="flex w-20 justify-between text-[10px] text-neutral-500 font-bold mb-1 px-0.5">
        {shape.status.map((st, i) => {
          let label = typeof st === 'string' ? st.toUpperCase() : st;
          if (inversaoAtiva > 0 && i < 2 && st === 'o') label = 'X';
          return <span key={i} className={label === 'X' ? 'text-rose-500/80' : ''}>{label}</span>;
        })}
      </div>
      
      <div className="relative w-20 h-[100px] border-2 border-neutral-400 bg-neutral-800 rounded-sm flex justify-between">
        <div className="absolute -left-7 top-[10%] text-[10px] text-amber-400 font-bold">
          {casaInicial}ª
        </div>

        {/* Frets */}
        {[25, 50, 75].map(top => (
          <div key={top} className="absolute left-0 w-full h-[2px] bg-neutral-500" style={{ top: `${top}%` }} />
        ))}

        {/* Strings */}
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="w-[1.5px] h-full bg-neutral-400 z-0 opacity-80" />
        ))}

        {/* Fingers */}
        {shape.marcas.map(([corda, casa], i) => {
          const isRoot = corda === shape.cordaRaiz;
          return (
            <div 
              key={i}
              className={`absolute w-3.5 h-3.5 rounded-full z-10 -translate-x-1/2 -translate-y-1/2 shadow-md ${isRoot ? 'bg-rose-500 shadow-rose-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}
              style={{
                left: `${(corda / 5) * 100}%`,
                top: `${((casa - 0.5) / 4) * 100}%`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
