import { STATIONS, Station } from "@/lib/stations";
import { useRadio } from "@/hooks/use-radio";
import { useCast } from "@/hooks/use-cast";
import { Play, Pause, Cast, Volume2, Radio, CastIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  const { currentStation, isPlaying, playStation, togglePlay, volume, setVolume } = useRadio();
  const { isCastAvailable, isCasting, castDeviceName, requestCast, castStation, stopCast } = useCast();

  const handleCastClick = () => {
    if (isCasting) {
      stopCast();
    } else {
      requestCast();
    }
  };

  const handlePlayStation = (station: Station) => {
    playStation(station);
    if (isCasting) {
      castStation(station);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Radio className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Pixel Radio
          </h1>
        </div>
        <button 
          onClick={handleCastClick}
          className={cn(
            "p-3 rounded-full transition-colors relative",
            isCasting ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
          )}
          data-testid="button-cast"
          title={isCasting ? `Casting to ${castDeviceName}` : "Cast to device"}
        >
          <Cast className="w-5 h-5" />
          {isCasting && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </button>
      </header>

      {/* Cast Banner */}
      <AnimatePresence>
        {isCasting && castDeviceName && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/10 text-primary text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
              <Cast className="w-4 h-4" />
              Casting to {castDeviceName}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    
                    {/* Overlay Play Button */}
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

      {/* Persistent Player Bar (Material You Style) */}
      <AnimatePresence>
        {currentStation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none flex justify-center"
          >
            <div 
              className={cn(
                "w-full max-w-2xl rounded-[2rem] shadow-2xl border border-border/20 p-4 pointer-events-auto backdrop-blur-3xl transition-colors duration-700 flex items-center gap-4 pr-6",
                currentStation.color.replace('bg-', 'bg-').replace('-600', '-500/20').replace('-500', '-400/20').replace('-700', '-600/20'),
                "bg-white/80 dark:bg-zinc-900/80"
              )}
              style={{
                background: `linear-gradient(135deg, hsl(var(--background) / 0.8), hsl(var(--background) / 0.9)), var(--tw-gradient-to)`
              }}
            >
              
              {/* Station Cover Art */}
              <div className="relative shrink-0">
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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate text-base" data-testid="text-now-playing">{currentStation.name}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {currentStation.genre} • {isCasting ? `Casting to ${castDeviceName}` : 'Live'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Volume Slider (Hidden on small screens) */}
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

                {/* Cast Button in Player */}
                {isCastAvailable && (
                  <button
                    onClick={handleCastClick}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isCasting ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    data-testid="button-cast-player"
                    title={isCasting ? "Stop casting" : "Cast to device"}
                  >
                    <Cast className="w-5 h-5" />
                  </button>
                )}

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
