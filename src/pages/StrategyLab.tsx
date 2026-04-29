'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Card,
	CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Loader2,
	Sparkles,
	Zap,
	Download,
	Database,
	Brain,
	Target,
	TrendingUp,
} from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OMEGA_SCRIPT_CONFIG = {
	system_name: 'VIRALOS OMEGA X Master',
	version: '5.0',

	completion_parameters: {
		temperature: 0.78,
		top_p: 0.94,
		presence_penalty: 0.35,
		frequency_penalty: 0.15,
		reasoning_effort: 'high',
		response_mode: 'json_only',
	},

	system_prompt:
		'Act as a viral content intelligence and generation engine. First analyze the input signals, then generate breakout-ready content concepts. Ground all outputs in provided signals and psychological mechanisms. Never output generic advice. Return only valid JSON array.',

	engines: {
		signal_engine: {
			tasks: [
				'Rank strongest hooks',
				'Detect highest opportunity topic gaps',
				'Extract winning content patterns',
				'Use competitor signals for differentiation',
			],
		},

		psychology_engine: {
			mechanisms: [
				'Zeigarnik Effect',
				'Pattern Interrupt',
				'Loss Aversion',
				'Identity Threat',
				'Variable Reward',
				'Tribal Signaling',
			],
			rule: 'every generated concept must use one mechanism',
		},

		content_generation_engine: {
			requirements: [
				'Each concept must be distinct',
				'Each uses one hook plus one topic gap',
				'Create high-retention reel script',
				'Create caption optimized for engagement',
				'Generate hashtags from input signals',
				'Assign virality score 1-10',
			],

			script_framework: [
				'Hook',
				'Open loop',
				'Pattern interrupt',
				'Payoff',
				'Comment CTA',
			],
		},

		adaptive_scoring: {
			weights: {
				hook_strength: 30,
				retention_potential: 30,
				novelty: 20,
				shareability: 20,
			},
		},
	},

	output_schema: [
		{
			topic: 'string',
			hook: 'string',
			script: 'string',
			caption: 'string',
			hashtags: ['string'],
			viralityScore: 'number',
			psychTrigger: 'string',
		},
	],

	quality_gates: [
		'No generic topics',
		'No repeated ideas',
		'Hooks must be scroll-stopping',
		'Scripts below virality 7.0 rewrite automatically',
		'Return only JSON array',
	],

	user_instruction:
		'Analyze input. Generate {{count}} high-probability content ideas matching output schema exactly.',
};

export default function StrategyLab() {
	const queryClient = useQueryClient();
	const [selectedRunId, setSelectedRunId] = useState<string>('');
	const [scriptCount, setScriptCount] = useState<string>('5');

	// Fetch all runs
	const { data: runs = [] } = useQuery({
		queryKey: ['runs'],
		queryFn: async () => {
			const res = await fetch(`${BACKEND_URL}/api/runs`);
			return res.json();
		},
	});

	// Fetch analysis for selected run
	const { data: analysis, isLoading: analysisLoading } = useQuery({
		queryKey: ['analysis', selectedRunId],
		queryFn: async () => {
			const res = await fetch(`${BACKEND_URL}/api/runs/${selectedRunId}/analysis`);
			return res.json();
		},
		enabled: !!selectedRunId,
	});

	// Fetch existing scripts for selected analysis
	const { data: scripts = [], isLoading: scriptsLoading } = useQuery({
		queryKey: ['scripts', analysis?._id],
		queryFn: async () => {
			const res = await fetch(`${BACKEND_URL}/api/analysis/${analysis._id}/scripts`);
			return res.json();
		},
		enabled: !!analysis?._id,
	});

	const generateMutation = useMutation({
		mutationFn: async () => {
			if (!analysis) throw new Error('No analysis selected');

			const fullPrompt = `
${OMEGA_SCRIPT_CONFIG.system_prompt}

INPUT SIGNALS (OMEGA X ANALYSIS):
${JSON.stringify(analysis, null, 2)}

ENGINES:
${JSON.stringify(OMEGA_SCRIPT_CONFIG.engines, null, 2)}

OUTPUT SCHEMA:
${JSON.stringify(OMEGA_SCRIPT_CONFIG.output_schema, null, 2)}

QUALITY GATES:
${OMEGA_SCRIPT_CONFIG.quality_gates.join('\n')}

INSTRUCTION:
${OMEGA_SCRIPT_CONFIG.user_instruction.replace('{{count}}', scriptCount)}

RETURN ONLY VALID JSON ARRAY. NO MARKDOWN.
`;

			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						contents: [{ parts: [{ text: fullPrompt }] }],
						generationConfig: {
							response_mime_type: 'application/json',
						},
					}),
				},
			);

			const data = await response.json();
			let rawResult = data.candidates[0].content.parts[0].text;
            
            // Handle markdown
            if (rawResult.includes('```json')) {
                rawResult = rawResult.split('```json')[1].split('```')[0].trim();
            } else if (rawResult.includes('```')) {
                rawResult = rawResult.split('```')[1].split('```')[0].trim();
            }

			const generatedScripts = JSON.parse(rawResult);

			// Save to backend
			await fetch(`${BACKEND_URL}/api/analysis/${analysis._id}/scripts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scripts: generatedScripts,
					runId: selectedRunId,
				}),
			});

			return generatedScripts;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['scripts'] });
		},
	});

	const exportScripts = () => {
		const blob = new Blob([JSON.stringify(scripts, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `viral_scripts_${selectedRunId}.json`;
		a.click();
	};

	return (
		<div className='max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700'>
			<header className='bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6'>
				<div className='flex items-center gap-4'>
					<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
						<Sparkles size={24} />
					</div>
					<div>
						<h2 className='text-xl font-bold tracking-tight'>Strategy Lab</h2>
						<p className='text-xs text-muted-foreground uppercase tracking-widest font-medium opacity-60'>
							Content Generation Engine v5.0
						</p>
					</div>
				</div>

				<div className='flex flex-wrap items-center gap-3 w-full md:w-auto'>
					<div className='w-full sm:w-64'>
						<select
							className='w-full h-10 px-4 rounded-xl border border-border bg-background text-[11px] font-bold uppercase tracking-tight focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer'
							value={selectedRunId}
							onChange={(e) => setSelectedRunId(e.target.value)}
						>
							<option value=''>Select Run Analysis</option>
							{runs.map((run: any) => (
								<option
									key={run._id}
									value={run._id}
								>
									{run.name || 'Untitled Run'}
								</option>
							))}
						</select>
					</div>

					<div className='w-full sm:w-32'>
						<select
							className='w-full h-10 px-4 rounded-xl border border-border bg-background text-[11px] font-bold uppercase tracking-tight focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer'
							value={scriptCount}
							onChange={(e) => setScriptCount(e.target.value)}
						>
							{[1, 3, 5, 10, 15, 20].map((num) => (
								<option
									key={num}
									value={num.toString()}
								>
									{num} Scripts
								</option>
							))}
						</select>
					</div>

					<Button
						className='w-full sm:w-auto h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]'
						disabled={!selectedRunId || generateMutation.isPending || !analysis}
						onClick={() => generateMutation.mutate()}
					>
						{generateMutation.isPending ? (
							<Loader2
								className='animate-spin mr-2'
								size={14}
							/>
						) : (
							<Zap
								size={14}
								className='mr-2'
							/>
						)}
						Generate Scripts
					</Button>

					{scripts.length > 0 && (
						<Button
							variant='outline'
							className='w-full sm:w-auto h-10 px-4 rounded-xl'
							onClick={exportScripts}
						>
							<Download size={14} />
						</Button>
					)}
				</div>
			</header>

			{!selectedRunId ? (
				<div className='h-[400px] flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-border rounded-3xl bg-muted/5'>
					<Brain
						size={48}
						className='text-muted-foreground/10'
					/>
					<div className='space-y-1'>
						<p className='text-sm font-bold text-muted-foreground uppercase tracking-widest'>
							Laboratory Idle
						</p>
						<p className='text-xs text-muted-foreground/60'>
							Select a completed run analysis to begin generating viral scripts.
						</p>
					</div>
				</div>
			) : analysisLoading ? (
				<div className='h-[400px] flex flex-col items-center justify-center gap-4'>
					<Loader2
						className='animate-spin text-primary'
						size={32}
					/>
					<p className='text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40'>
						Accessing Intelligence Bank...
					</p>
				</div>
			) : !analysis ? (
				<div className='h-[400px] flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-border rounded-3xl bg-muted/5'>
					<Database
						size={48}
						className='text-destructive/10'
					/>
					<div className='space-y-1'>
						<p className='text-sm font-bold text-destructive uppercase tracking-widest'>
							Analysis Not Found
						</p>
						<p className='text-xs text-muted-foreground/60'>
							This run has no OMEGA X intelligence. Run the pipeline in Agent Center first.
						</p>
					</div>
				</div>
			) : (
				<div className='space-y-8'>
					{/* INSIGHTS SUMMARY (Mini Insights Board) */}
					<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
						<SummaryCard
							title='Best Hook Trigger'
							value={analysis.hooks?.[0]?.split(']')[0]?.replace('[', '') || 'N/A'}
							icon={<Target size={14} />}
						/>
						<SummaryCard
							title='Top Gap Opportunity'
							value={analysis.topicGapMap?.[0] || 'N/A'}
							icon={<TrendingUp size={14} />}
						/>
						<SummaryCard
							title='Generated Ideas'
							value={scripts.length.toString()}
							icon={<Sparkles size={14} />}
						/>
						<SummaryCard
							title='Primary Psychology'
							value='Zeigarnik Effect'
							icon={<Brain size={14} />}
						/>
					</div>

					{scriptsLoading ? (
						<div className='flex justify-center p-12'>
							<Loader2
								className='animate-spin'
								size={24}
							/>
						</div>
					) : scripts.length > 0 ? (
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
							{scripts.map((script: any, i: number) => (
								<ScriptCard
									key={i}
									script={script}
									index={i}
								/>
							))}
						</div>
					) : (
						<div className='h-[300px] flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-border rounded-3xl bg-muted/5'>
							<Sparkles
								size={48}
								className='text-primary/10'
							/>
							<div className='space-y-1'>
								<p className='text-sm font-bold text-muted-foreground uppercase tracking-widest'>
									Ready for Synthesis
								</p>
								<p className='text-xs text-muted-foreground/60'>
									Click 'Generate Scripts' to create content concepts for this run.
								</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function SummaryCard({ title, value, icon }: any) {
	return (
		<Card className='bg-card/50 border-border rounded-2xl p-4 shadow-sm'>
			<div className='flex items-center gap-2 mb-2'>
				<div className='text-primary'>{icon}</div>
				<span className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/60'>
					{title}
				</span>
			</div>
			<p className='text-sm font-bold text-foreground line-clamp-1'>{value}</p>
		</Card>
	);
}

function ScriptCard({ script, index }: { script: any; index: number }) {
	return (
		<Card className='bg-card border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group'>
			<div className='p-1 bg-muted/30 border-b border-border flex justify-between items-center px-4'>
				<div className='flex items-center gap-2'>
					<span className='text-[10px] font-black text-primary/40'>
						CONCEPT #{(index + 1).toString().padStart(2, '0')}
					</span>
					<Badge
						variant='outline'
						className='text-[8px] h-4 uppercase font-black border-primary/20 bg-primary/5 text-primary'
					>
						{script.psychTrigger}
					</Badge>
				</div>
				<div className='flex items-center gap-1'>
					<span className='text-[9px] font-black uppercase tracking-tighter text-muted-foreground'>
						Viral Score
					</span>
					<span className='text-sm font-black text-emerald-500'>
						{script.viralityScore}
					</span>
				</div>
			</div>
			<CardContent className='p-6 space-y-6'>
				<div className='space-y-2'>
					<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
						Topic & Angle
					</h4>
					<p className='text-sm font-bold text-foreground leading-tight'>
						{script.topic}
					</p>
				</div>

				<div className='space-y-2'>
					<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
						Viral Hook
					</h4>
					<div className='p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs font-bold italic text-primary leading-relaxed'>
						"{script.hook}"
					</div>
				</div>

				<div className='space-y-2'>
					<div className='flex justify-between items-center'>
						<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
							Full Script
						</h4>
						<Badge
							variant='secondary'
							className='text-[8px] h-4 font-black uppercase'
						>
							Optimized Flow
						</Badge>
					</div>
					<ScrollArea className='h-32 rounded-xl border border-border p-3 bg-muted/10'>
						<p className='text-[11px] leading-relaxed font-medium whitespace-pre-wrap text-muted-foreground'>
							{script.script}
						</p>
					</ScrollArea>
				</div>

				<div className='space-y-4 pt-4 border-t border-border/50'>
					<div className='space-y-2'>
						<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
							Engagement Caption
						</h4>
						<p className='text-[11px] text-foreground/80 italic line-clamp-3'>
							{script.caption}
						</p>
					</div>

					<div className='flex flex-wrap gap-1.5'>
						{script.hashtags?.map((tag: string, i: number) => (
							<span
								key={i}
								className='text-[10px] font-bold text-primary/60'
							>
								#{tag.replace('#', '')}
							</span>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
