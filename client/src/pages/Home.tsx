import { useState } from "react";
import { STATIONS, Station } from "@/lib/stations";
import { useRadio } from "@/hooks/use-radio";
import { Play, Pause, Volume2, X, ChevronDown, SkipBack, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  const { currentStation, isPlaying, playStation, togglePlay, volume, setVolume, setOnNext, setOnPrev } = useRadio();
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePlayStation = (station: Station) => {
    playStation(station);
    setIsExpanded(true);
  };

  const closeExpanded = () => {
    setIsExpanded(false);
  };

  const playNext = () => {
    if (!currentStation) return;
    const idx = STATIONS.findIndex((s) => s.id === currentStation.id);
    const next = STATIONS[(idx + 1) % STATIONS.length];
    playStation(next);
  };

  const playPrev = () => {
    if (!currentStation) return;
    const idx = STATIONS.findIndex((s) => s.id === currentStation.id);
    const prev = STATIONS[(idx - 1 + STATIONS.length) % STATIONS.length];
    playStation(prev);
  };

  setOnNext(playNext);
  setOnPrev(playPrev);

  return (
    <div className="min-h-screen bg-background pb-32 font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
            <img src="/icon-192.png" alt="Pixel Radio" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Pixel Radio
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Live Stations</h2>
          <p className="text-muted-foreground">Curated Indian radio channels for you</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {STATIONS.map((station) => (
            <motion.div
              key={station.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cn(
                  "overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full group rounded-lg",
                  currentStation?.id === station.id ? "ring-2 ring-primary bg-primary/5" : "bg-card"
                )}
                onClick={() => handlePlayStation(station)}
                data-testid={`card-station-${station.id}`}
              >
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="relative w-full aspect-square max-w-[120px] mt-4 overflow-hidden rounded-md bg-muted">
                    <img 
                      src={station.image} 
                      alt={station.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    <div className={cn(
                      "absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      currentStation?.id === station.id && isPlaying ? "opacity-100 bg-black/40" : ""
                    )}>
                      <div className="w-10 h-10 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg backdrop-blur-sm">
                        {currentStation?.id === station.id && isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current pl-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 text-center w-full">
                    <h3 className="font-bold text-sm leading-tight truncate px-1" data-testid={`text-station-name-${station.id}`}>{station.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-wider">{station.genre}</p>
                    
                    <div className="mt-2 flex justify-center h-2">
                      {currentStation?.id === station.id && isPlaying && (
                        <div className="flex gap-0.5 items-end">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="w-0.5 bg-primary rounded-full"
                              animate={{ height: [2, 8, 2] }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 0.8, 
                                ease: "easeInOut",
                                delay: i * 0.1 
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Expanded Full-Screen Player */}
      <AnimatePresence>
        {currentStation && isExpanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex flex-col"
            data-testid="player-expanded"
          >
            <div
              className="absolute inset-0 backdrop-blur-2xl transition-colors duration-700"
              style={{
                background: `linear-gradient(180deg, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.92) 100%)`
              }}
            />

            <div className="relative flex flex-col h-full">
              {/* Top bar with close */}
              <div className="flex items-center justify-between p-4 pt-6">
                <button
                  onClick={closeExpanded}
                  className="p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground"
                  data-testid="button-minimize-expanded"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Now Playing</span>
                <button
                  onClick={() => {
                    closeExpanded();
                    togglePlay();
                  }}
                  className="p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground"
                  data-testid="button-x-expanded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover Art + Info */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", damping: 20 }}
                  className="relative"
                >
                  <div
                    className={cn(
                      "w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-2xl overflow-hidden shadow-2xl border-4 transition-colors duration-700",
                      currentStation.color.replace('bg-', 'border-')
                    )}
                  >
                    <img
                      src={currentStation.artworkLg}
                      alt={currentStation.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isPlaying && (
                    <div className={cn(
                      "absolute -bottom-2 -right-2 rounded-full p-1.5 border-2 border-background transition-colors duration-700",
                      currentStation.color
                    )}>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center space-y-2 w-full max-w-xs"
                >
                  <h2 className="text-2xl font-bold tracking-tight" data-testid="text-expanded-name">
                    {currentStation.name}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {currentStation.genre}
                  </p>
                </motion.div>

                {/* Equalizer bars */}
                {isPlaying && (
                  <div className="flex gap-1 items-end h-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className={cn("w-1 rounded-full", currentStation.color)}
                        animate={{ height: [4, 20, 6, 16, 4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          ease: "easeInOut",
                          delay: i * 0.12,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Controls at bottom */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-8 pb-12 space-y-6"
              >
                {/* Volume */}
                <div className="flex items-center gap-3 max-w-xs mx-auto w-full">
                  <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setVolume(val[0] / 100)}
                    className="cursor-pointer flex-1"
                  />
                </div>

                {/* Prev / Play / Next buttons */}
                <div className="flex items-center justify-center gap-5">
                  <button
                    onClick={playPrev}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-muted/60 active:scale-90 transition-all"
                    data-testid="button-prev-expanded"
                  >
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className={cn(
                      "rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl",
                      currentStation.color
                    )}
                    style={{ width: 72, height: 72 }}
                    data-testid="button-play-expanded"
                  >
                    {isPlaying ? (
                      <Pause className="w-9 h-9 fill-current" />
                    ) : (
                      <Play className="w-9 h-9 fill-current pl-1" />
                    )}
                  </button>

                  <button
                    onClick={playNext}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-muted/60 active:scale-90 transition-all"
                    data-testid="button-next-expanded"
                  >
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Player Bar */}
      <AnimatePresence>
        {currentStation && !isExpanded && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none flex justify-center"
          >
            <div 
              className={cn(
                "w-full max-w-2xl rounded-[2rem] shadow-2xl border border-border/20 p-4 pointer-events-auto backdrop-blur-3xl transition-colors duration-700 flex items-center gap-4 pr-6",
                "bg-white/80 dark:bg-zinc-900/80"
              )}
              style={{
                background: `linear-gradient(135deg, hsl(var(--background) / 0.8), hsl(var(--background) / 0.9))`
              }}
            >
              
              {/* Station Cover Art — tap to expand */}
              <div
                className="relative shrink-0 cursor-pointer"
                onClick={() => setIsExpanded(true)}
                data-testid="button-expand-player"
              >
                <div 
                  className={cn(
                    "w-14 h-14 rounded-lg overflow-hidden border-2 shadow-lg transition-colors duration-700",
                    currentStation.color.replace('bg-', 'border-')
                  )}
                >
                  <img src={currentStation.image} alt="Playing" className="w-full h-full object-cover" />
                </div>
                {isPlaying && (
                  <div className={cn(
                    "absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-background transition-colors duration-700",
                    currentStation.color
                  )}>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>

              {/* Info — tap to expand */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                <h4 className="font-bold truncate text-base" data-testid="text-now-playing">{currentStation.name}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {currentStation.genre} • Live
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 w-24 mr-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <Slider 
                    value={[volume * 100]} 
                    max={100} 
                    step={1} 
                    onValueChange={(val) => setVolume(val[0] / 100)}
                    className="cursor-pointer"
                  />
                </div>

                <button 
                  onClick={togglePlay}
                  className={cn(
                    "w-14 h-14 rounded-2xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10",
                    currentStation.color
                  )}
                  data-testid="button-play-pause"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current pl-1" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
