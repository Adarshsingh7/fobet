import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Rocket, FileText, Cpu, Layers, ShieldCheck, Flame, CheckCircle2, Activity } from 'lucide-react';
import { AGENT_DEFS } from '../lib/constants';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ reelCount, doneCount, agentStates }: any) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-transparent to-transparent p-12 rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-12">
          <Rocket size={200} />
        </div>
        <Badge className="mb-6 bg-primary/10 text-primary border-none font-black tracking-widest text-[10px]">OPERATIONAL STATUS: READY</Badge>
        <h1 className="text-5xl font-black mb-6 tracking-tighter leading-[0.9] text-foreground">
          DECODE VIRAL <br />
          <span className="text-primary">DNA INSTANTLY.</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed mb-10 font-medium">
          Deploy 6 specialized Gemini agents to dissect competitor reel data, identify market gaps, and generate 30 high-probability content frameworks.
        </p>
        <div className="flex gap-4">
          <Button size="lg" className="font-bold uppercase tracking-widest h-12 px-8" onClick={() => navigate('/input')}>
            <FileText className="mr-2" size={18} /> Ingest Data
          </Button>
          <Button size="lg" variant="outline" className="font-bold uppercase tracking-widest h-12 px-8" onClick={() => navigate('/agents')}>
            <Cpu className="mr-2" size={18} /> Deploy Agents
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Context Nodes', value: reelCount, color: 'text-primary', icon: Layers },
          { label: 'Agents Online', value: `${doneCount}/06`, color: 'text-emerald-500', icon: ShieldCheck },
          { label: 'System Uptime', value: '100%', color: 'text-amber-500', icon: Flame },
        ].map((stat, i) => (
          <Card key={i} className="border-border bg-card/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">{stat.label}</span>
                <stat.icon className={stat.color} size={16} />
              </div>
              <div className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              Pipeline Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Ingest Reel URLs & Context', done: reelCount > 0 },
              { label: 'Execute Core Analysis Agents', done: doneCount >= 3 },
              { label: 'Synthesize Market Gaps', done: agentStates.gap?.status === 'done' },
              { label: 'Generate Strategic Concepts', done: agentStates.strategy?.status === 'done' },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border ${step.done ? 'bg-emerald-500/5 border-emerald-500/20 opacity-100' : 'bg-muted/50 border-border opacity-50'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-bold ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Agent Live Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AGENT_DEFS.map(agent => {
                const state = agentStates[agent.id];
                return (
                  <div key={agent.id} className="flex items-center justify-between p-2 rounded border border-border bg-background/50">
                    <div className="flex items-center gap-3">
                      <agent.icon className={agent.color} size={14} />
                      <span className="text-[11px] font-bold tracking-tight">{agent.name}</span>
                    </div>
                    <Badge variant={state?.status === 'done' ? 'default' : state?.status === 'running' ? 'secondary' : 'outline'} className={`text-[8px] px-1.5 h-4 border-none ${state?.status === 'done' ? 'bg-emerald-500 text-white' : state?.status === 'running' ? 'bg-amber-500 text-white animate-pulse' : ''}`}>
                      {(state?.status || 'idle').toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
