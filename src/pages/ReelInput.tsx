'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Trash2, CheckCircle2, Loader2, Link2, 
  Eraser, Zap, Trophy, TrendingUp, ShieldAlert, 
  Sparkles, Repeat, Info, ClipboardPaste, Cpu
} from 'lucide-react';

const NICHE_CONFIG = [
  { id: 'top', name: 'Top Performing', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'fast', name: 'Fast Growing', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'competition', name: 'Competition', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'gems', name: 'Gems', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'recreate', name: 'Recreate', icon: Repeat, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

export default function ReelInput({ reelInput, setReelInput, startScraper, isScraping, scrapeProgress, scrapeError, scrapedData }: any) {
  const [matrix, setMatrix] = useState<Record<string, string[]>>({
    top: Array(20).fill(''),
    fast: Array(20).fill(''),
    competition: Array(20).fill(''),
    gems: Array(20).fill(''),
    recreate: Array(20).fill(''),
  });
  
  const [activeNiche, setActiveNiche] = useState('top');

  const handleInputChange = (nicheId: string, index: number, value: string) => {
    setMatrix(prev => ({
      ...prev,
      [nicheId]: prev[nicheId].map((v, i) => i === index ? value : v)
    }));
  };

  const processPastedData = useCallback((data: string) => {
    const rawTokens = data.split(/[,\s\t\n]+/).filter(t => t.trim() !== '');
    
    // Create a set of all currently existing values in the entire matrix to prevent duplicates
    const existingValues = new Set(Object.values(matrix).flat().map(v => v.trim()));
    
    // Filter tokens: Only allow valid Instagram URLs, reels paths, or @usernames
    // Also skip any values that are already in the matrix
    const tokens: string[] = [];
    const seenInPaste = new Set();

    rawTokens.forEach(t => {
      const trimmed = t.trim();
      if (!trimmed) return;
      
      const isValid = (
        trimmed.startsWith('https://www.instagram.com/') || 
        trimmed.startsWith('https://instagram.com/') ||
        trimmed.startsWith('reels/') ||
        trimmed.startsWith('@')
      );

      if (isValid && !existingValues.has(trimmed) && !seenInPaste.has(trimmed)) {
        tokens.push(trimmed);
        seenInPaste.add(trimmed);
      }
    });

    if (tokens.length === 0) return;

    setMatrix(prev => {
      const newMatrix = { ...prev };
      let currentNicheId = activeNiche;
      let nicheIndex = NICHE_CONFIG.findIndex(n => n.id === currentNicheId);
      let tokenIdx = 0;

      while (tokenIdx < tokens.length && nicheIndex < NICHE_CONFIG.length) {
        const id = NICHE_CONFIG[nicheIndex].id;
        const currentNicheArray = [...newMatrix[id]];
        
        for (let i = 0; i < 20 && tokenIdx < tokens.length; i++) {
          if (!currentNicheArray[i]) {
            currentNicheArray[i] = tokens[tokenIdx];
            tokenIdx++;
          }
        }
        
        newMatrix[id] = currentNicheArray;
        nicheIndex++;
      }
      
      return newMatrix;
    });
  }, [activeNiche, matrix]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText) {
        processPastedData(pastedText);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [processPastedData]);

  const [runName, setRunName] = useState('');

  const handleScrape = () => {
    const allUrls: string[] = [];
    const allUsernames: string[] = [];

    Object.values(matrix).flat().forEach(item => {
      const trimmed = item.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith('http')) {
        allUrls.push(trimmed);
      } else if (trimmed.startsWith('reels/')) {
        allUrls.push(`https://www.instagram.com/${trimmed}`);
      } else {
        allUsernames.push(trimmed);
      }
    });

    if (allUrls.length > 0 || allUsernames.length > 0) {
      startScraper(allUrls, allUsernames, runName);
    }
  };

  const clearMatrix = () => {
    if (confirm('Reset entire 100-node matrix?')) {
      setMatrix({
        top: Array(20).fill(''),
        fast: Array(20).fill(''),
        competition: Array(20).fill(''),
        gems: Array(20).fill(''),
        recreate: Array(20).fill(''),
      });
      setRunName('');
    }
  };

  const getCount = (nicheId: string) => matrix[nicheId].filter(i => i.trim() !== '').length;
  const totalCount = Object.keys(matrix).reduce((acc, key) => acc + getCount(key), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight leading-none text-foreground">Data Ingestion</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] uppercase h-5 bg-background font-medium">
                {totalCount}/100 active nodes
              </Badge>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Paste Listening
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Label this run (e.g. Health Niche v1)"
            className="h-9 text-[11px] font-medium w-full sm:w-56 rounded-xl border-border bg-muted/30 focus:bg-background transition-all"
            value={runName}
            onChange={(e) => setRunName(e.target.value)}
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none h-9 rounded-xl border-border hover:bg-destructive/5 hover:text-destructive transition-all"
              onClick={clearMatrix}
            >
              <Eraser size={14} className="mr-2" /> Reset
            </Button>
            <Button 
              size="sm" 
              className="flex-1 sm:flex-none h-9 px-6 rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow transition-all active:scale-95 group" 
              disabled={isScraping || totalCount === 0}
              onClick={handleScrape}
            >
              {isScraping ? <Loader2 className="animate-spin mr-2" size={14} /> : <Zap size={14} className="mr-2 fill-current" />}
              Execute Scrape
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR STATS */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-card border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Activity size={14} className="text-primary" /> Matrix Load
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-muted-foreground">Total Saturation</span>
                  <span className="text-foreground tabular-nums">{totalCount}%</span>
                </div>
                <Progress value={totalCount} className="h-1.5 rounded-full bg-muted" />
              </div>
              
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
                <p>Paste any list of links or usernames directly onto the page to auto-fill nodes.</p>
              </div>

              {isScraping && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                  <div className="p-3 rounded-xl bg-primary text-primary-foreground space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase opacity-90">
                      <span>Syncing...</span>
                      <span>{scrapeProgress}%</span>
                    </div>
                    <Progress value={scrapeProgress} className="h-1 bg-primary-foreground/30 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* MAIN INTERFACE */}
        <div className="lg:col-span-9">
          <Tabs defaultValue="top" value={activeNiche} onValueChange={setActiveNiche} className="space-y-4">
            <TabsList className="w-full h-auto p-1 bg-muted/50 border border-border rounded-xl grid grid-cols-2 sm:flex sm:flex-wrap gap-1">
              {NICHE_CONFIG.map((niche) => (
                <TabsTrigger 
                  key={niche.id} 
                  value={niche.id}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-xs font-medium"
                >
                  <niche.icon size={14} className={activeNiche === niche.id ? niche.color : 'text-muted-foreground/50'} />
                  <span className="whitespace-nowrap">{niche.name}</span>
                  <span className="ml-auto sm:ml-1 text-[10px] opacity-40 font-mono">({getCount(niche.id)})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {NICHE_CONFIG.map((niche) => (
              <TabsContent key={niche.id} value={niche.id} className="mt-0 outline-none">
                <Card className="bg-card border-border rounded-xl p-5 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${niche.bg} ${niche.color} border ${niche.border}`}>
                        <niche.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">{niche.name} Array</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">20 Context Nodes</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 rounded-lg text-[10px] font-bold uppercase text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => setMatrix(prev => ({ ...prev, [niche.id]: Array(20).fill('') }))}
                    >
                      Clear Tab
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {matrix[niche.id].map((val, i) => (
                      <div key={i} className="relative group">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground/30 pointer-events-none group-focus-within:text-primary transition-colors">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <Input 
                          value={val}
                          onChange={(e) => handleInputChange(niche.id, i, e.target.value)}
                          placeholder="Link or @user"
                          className="h-9 text-xs pl-8 pr-2 bg-muted/20 border-border/60 focus:bg-background rounded-lg transition-all placeholder:text-muted-foreground/20 font-mono"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="relative overflow-hidden bg-muted/40 p-4 rounded-xl border border-dashed border-border/60 hover:border-primary/40 transition-colors group/paste">
                    <div className="flex items-center gap-3">
                      <ClipboardPaste size={16} className="text-muted-foreground group-hover/paste:text-primary transition-colors" />
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Drop a list here to fill <span className="text-foreground font-bold">{niche.name}</span> specifically.
                      </p>
                    </div>
                    <textarea 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onPaste={(e) => {
                        e.stopPropagation();
                        const data = e.clipboardData.getData('text');
                        const tokens = data.split(/[,\s\t\n]+/).filter(t => t.trim() !== '');
                        setMatrix(prev => {
                          const newArray = [...prev[niche.id]];
                          let tIdx = 0;
                          for(let i=0; i<20 && tIdx < tokens.length; i++) {
                            if(!newArray[i]) {
                              newArray[i] = tokens[tIdx];
                              tIdx++;
                            }
                          }
                          return { ...prev, [niche.id]: newArray };
                        });
                      }}
                    />
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* RAW INPUT SECTION */}
      <div className="pt-8 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40 whitespace-nowrap">Neural Buffer Bypass</span>
          <div className="h-px w-full bg-border/40" />
        </div>
        
        <Card className="overflow-hidden rounded-xl bg-card border-border shadow-sm group">
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="p-5 md:border-r border-border bg-muted/20 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
                <Link2 size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Context Buffer</h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Raw ingestion for transcripts and unstructured data blocks.
                </p>
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground/60">
                  <span>Capacity</span>
                  <span className="text-foreground">{Math.round(reelInput.length / 10000 * 100)}%</span>
                </div>
                <Progress value={Math.round(reelInput.length / 10000 * 100)} className="h-1 rounded-full" />
              </div>
            </div>
            
            <div className="md:col-span-3 flex flex-col min-h-[280px]">
              <textarea 
                className="flex-1 p-5 bg-transparent border-none focus:outline-none text-xs font-mono leading-relaxed resize-none placeholder:text-muted-foreground/20 text-foreground selection:bg-primary/10"
                placeholder="[System idle... drop raw text blocks here]"
                value={reelInput}
                onChange={(e) => setReelInput(e.target.value)}
              />
              <div className="p-3 border-t border-border bg-muted/10 flex justify-end items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive h-8 px-4 rounded-lg text-[10px] font-bold uppercase hover:bg-destructive/5" 
                  onClick={() => setReelInput('')}
                >
                  <Trash2 size={14} className="mr-2" /> Purge
                </Button>
                <Button size="sm" className="h-8 px-6 rounded-lg font-bold text-[10px] uppercase bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform">
                  <CheckCircle2 size={14} className="mr-2" /> Commit Context
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}