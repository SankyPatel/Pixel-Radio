import { STATIONS, Station } from "@/lib/stations";
import { useRadio } from "@/hooks/use-radio";
import { Play, Pause, Cast, Volume2, Radio, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  const { currentStation, isPlaying, playStation, togglePlay, volume, setVolume } = useRadio();

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
          className="p-3 hover:bg-muted rounded-full transition-colors"
          title="Cast to device (Mock)"
        >
          <Cast className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Live Stations</h2>
          <p className="text-muted-foreground">Curated Indian radio channels for you</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  "overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full group",
                  currentStation?.id === station.id ? "ring-2 ring-primary bg-primary/5" : "bg-card"
                )}
                onClick={() => playStation(station)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square sm:aspect-video overflow-hidden bg-muted">
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
                      <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg backdrop-blur-sm">
                        {currentStation?.id === station.id && isPlaying ? (
                          <Pause className="w-8 h-8 fill-current" />
                        ) : (
                          <Play className="w-8 h-8 fill-current pl-1" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{station.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{station.genre}</p>
                      </div>
                      
                      {currentStation?.id === station.id && (
                        <div className="flex gap-0.5 items-end h-4 mb-1">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-primary rounded-full"
                              animate={{ height: [4, 16, 4] }}
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
              
              {/* Spinning Album Art */}
              <div className="relative shrink-0">
                <motion.div 
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className={cn(
                    "w-16 h-16 rounded-full overflow-hidden border-2 shadow-lg transition-colors duration-700",
                    currentStation.color.replace('bg-', 'border-')
                  )}
                >
                  <img src={currentStation.image} alt="Playing" className="w-full h-full object-cover" />
                </motion.div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-background transition-colors duration-700",
                  currentStation.color
                )}>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate text-base">{currentStation.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{currentStation.genre} • Live</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
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

                <button 
                  onClick={togglePlay}
                  className={cn(
                    "w-14 h-14 rounded-2xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10",
                    currentStation.color
                  )}
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
