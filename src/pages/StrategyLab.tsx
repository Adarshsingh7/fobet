import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Layers, Sparkles } from 'lucide-react';

export default function StrategyLab({ agentStates }: any) {
  const stratData = agentStates.strategy?.data;

  if (!stratData) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 border border-border">
            <Sparkles size={32} className="text-muted-foreground opacity-20" />
          </div>
          <h2 className="text-2xl font-black text-muted-foreground uppercase tracking-widest">Strategy Engine Offline</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">Trigger the Content Strategy Agent to generate optimized creative concepts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 uppercase italic leading-none">30 High-Value <br /><span className="text-primary">Content Blueprints</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black px-4 py-1.5 h-auto text-[10px] tracking-widest">
            {stratData.reelConcepts?.length || 0} OPTIMIZED CONCEPTS READY
          </Badge>
          <Button variant="outline" size="sm" className="font-bold uppercase tracking-widest border-border">↗ Archive Lab</Button>
        </div>
      </div>

      {stratData.contentPillars && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {stratData.contentPillars.map((p: string, i: number) => (
            <div key={i} className="px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase whitespace-nowrap">
              # {p}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {stratData.reelConcepts?.map((reel: any, i: number) => (
          <Card key={i} className="border-border bg-card/40 transition-all duration-300 hover:border-primary/40 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-primary/10 to-transparent pointer-events-none" />
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-3xl font-black text-muted-foreground/20 italic mr-2 leading-none">{(i + 1).toString().padStart(2, '0')}</span>
                    <Badge variant="outline" className="text-[9px] font-bold tracking-widest border-primary/30 text-primary uppercase">{reel.angle}</Badge>
                    <Badge variant="outline" className="text-[9px] font-bold tracking-widest border-border text-muted-foreground uppercase">{reel.bucket}</Badge>
                    {reel.cta && <Badge variant="outline" className="text-[9px] font-bold tracking-widest border-amber-500/30 text-amber-500 uppercase">CTA: {reel.cta}</Badge>}
                  </div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors duration-300">"{reel.hook}"</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{reel.outline}</p>
                </div>
                <div className="w-full lg:w-48 space-y-6 border-l border-border pl-10">
                  <div>
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Viral Probability</Label>
                    <div className="text-5xl font-black text-emerald-500 tracking-tighter leading-none">{reel.viralProbability}%</div>
                    <Progress value={reel.viralProbability} className="h-1.5 mt-3" />
                  </div>
                  <Button className="w-full font-black uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20" variant="secondary">
                    + Save to Drafts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stratData.seriesConcepts && (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-3">
              <Layers size={14} /> Long-form Recursive Series Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stratData.seriesConcepts.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-primary/10">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">{i + 1}</div>
                  <p className="text-xs font-bold leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
