import React, { useState } from 'react';
import { FaChartBar, FaUsers, FaEye, FaThumbsUp, FaComment, FaClock, FaSearch } from 'react-icons/fa';

const YoutubeStats = () => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [channelName, setChannelName] = useState('');
  
  const handleGenerateStats = () => {
    setIsAnimated(true);
    
    // Reset animation after completion
    setTimeout(() => {
      setIsAnimated(false);
    }, 4000);
  };
  
  return (
    <section id="stats" className="section-padding relative overflow-visible">
      {/* <div className="absolute inset-0 bg-gradient-to-br from-wineblack via-wineblack to-neutral-gray/20 z-0"></div> */}
      
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-5xl mx-auto -mt-10 md:-mt-16 mb-10">
          <h2 className="section-title">Descubre la Transformación de tu Canal</h2>
          <p className="section-subtitle text-center mx-auto">
            Escribe el Nombre de tu Canal de YT para desbloquear una vista previa de lo que CreatorLab puede ayudarte a lograr
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* Preview Input oculto temporalmente */}
          {/*
          <div className="card mb-8">
            ...
          </div>
          */}

          {/* Buscador en forma de cápsula (input real) */}
          <div className="w-full flex justify-center mt-2 mb-10">
            <div className="flex items-center gap-3 px-6 py-4 bg-white text-wineblack rounded-full shadow-lg border border-light-gray/60 w-full max-w-2xl">
              <FaSearch className="w-5 h-5" />
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Tu Canal de YT"
                className="flex-1 bg-transparent outline-none placeholder-neutral-gray text-wineblack"
              />
            </div>
          </div>
          
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative top-16 md:top-28">
            {/* Before */}
            <div className="relative">
              {/* Etiqueta fuera de la tarjeta con posición absoluta y estilos solicitados */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-12 z-10 flex justify-between items-center"
                style={{
                  width: '300px',
                  height: '60px',
                  borderRadius: '20px',
                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(65, 65, 65, 0.60) 100%), rgba(0, 0, 0, 0.18)',
                  boxShadow: '0 0 12px 0 rgba(191, 151, 255, 0.24) inset'
                }}
              >
                <div className="w-full text-center text-white font-semibold text-sm md:text-base">Antes de CreatorLab</div>
              </div>
              <div
                className="card p-8 md:p-10 mt-16"
                style={{
                  borderRadius: '62px',
                  border: '1.5px solid rgba(255, 164, 183, 0.40)',
                  background: 'rgba(0, 0, 0, 0.14)'
                }}
              >
                <h3 className="sr-only">Antes de CreatorLab</h3>
                
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-neutral-gray/20 rounded-full flex items-center justify-center mr-5">
                      <FaUsers className="w-6 h-6 text-neutral-gray" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Suscriptores</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div className="bg-neutral-gray h-full" style={{ width: '20%' }}></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">5.240</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-neutral-gray/20 rounded-full flex items-center justify-center mr-5">
                      <FaEye className="w-6 h-6 text-neutral-gray" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Visitas Mensuales</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div className="bg-neutral-gray h-full" style={{ width: '30%' }}></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">48.320</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-neutral-gray/20 rounded-full flex items-center justify-center mr-5">
                      <FaThumbsUp className="w-6 h-6 text-neutral-gray" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Tasa de Engagement</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div className="bg-neutral-gray h-full" style={{ width: '15%' }}></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">3,2%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-neutral-gray/20 rounded-full flex items-center justify-center mr-5">
                      <FaClock className="w-6 h-6 text-neutral-gray" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Tiempo de Visualización (horas/mes)</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div className="bg-neutral-gray h-full" style={{ width: '25%' }}></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">1.240</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* After */}
            <div className="relative">
              {/* Etiqueta fuera de la tarjeta con posición absoluta y estilos solicitados */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-12 z-10 flex justify-between items-center"
                style={{
                  width: '320px',
                  height: '60px',
                  borderRadius: '20px',
                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, #FF0037 100%), rgba(255, 47, 47, 0.00)',
                  boxShadow: '0 0 12px 0 rgba(191, 151, 255, 0.24) inset'
                }}
              >
                <div className="w-full text-center text-white font-semibold text-sm md:text-base">Después de CreatorLab</div>
              </div>
              <div
                className="card p-8 md:p-10 mt-16"
                style={{
                  borderRadius: '62px',
                  background: '#FF0037'
                }}
              >
                <h3 className="sr-only">Después de CreatorLab</h3>
                
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-redvelvet/20 rounded-full flex items-center justify-center mr-5">
                      <FaUsers className="w-6 h-6 text-redvelvet" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Suscriptores</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div 
                          className={`bg-redvelvet h-full transition-all duration-2000 ease-out ${isAnimated ? 'w-[80%]' : 'w-[20%]'}`}
                        ></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">{isAnimated ? '47.860' : '5.240'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-redvelvet/20 rounded-full flex items-center justify-center mr-5">
                      <FaEye className="w-6 h-6 text-redvelvet" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Visitas Mensuales</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div 
                          className={`bg-redvelvet h-full transition-all duration-2000 ease-out ${isAnimated ? 'w-[90%]' : 'w-[30%]'}`}
                        ></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">{isAnimated ? '562.740' : '48.320'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-redvelvet/20 rounded-full flex items-center justify-center mr-5">
                      <FaThumbsUp className="w-6 h-6 text-redvelvet" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Tasa de Engagement</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div 
                          className={`bg-redvelvet h-full transition-all duration-2000 ease-out ${isAnimated ? 'w-[75%]' : 'w-[15%]'}`}
                        ></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">{isAnimated ? '18,7%' : '3,2%'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-redvelvet/20 rounded-full flex items-center justify-center mr-5">
                      <FaClock className="w-6 h-6 text-redvelvet" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-neutral-gray mb-2">Tiempo de Visualización (horas/mes)</p>
                      <div className="bg-neutral-gray/20 h-5 rounded-full overflow-hidden">
                        <div 
                          className={`bg-redvelvet h-full transition-all duration-2000 ease-out ${isAnimated ? 'w-[85%]' : 'w-[25%]'}`}
                        ></div>
                      </div>
                      <p className="text-right text-2xl font-bold mt-2">{isAnimated ? '14.580' : '1.240'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA eliminado por solicitud */}
          {/* <div className="text-center mt-16 md:mt-20">
            <p className="text-neutral-gray mb-6">¿Listo para transformar tu canal de YouTube y ver resultados reales?</p>
            <button id="stats-cta" className="btn-primary">Comienza Hoy</button>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default YoutubeStats;