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
	RotateCcw,
	Eraser,
} from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OMEGA_SCRIPT_CONFIG = {
  "system_name": "VIRALOS OMEGA X ULTRA",
  "version": "17.1_algorithm_manipulation_elite",

  "meta": {
    "note": "Pass contentCount as a runtime variable. Set max_output_tokens in your API call body (recommended: 8000). This is a system prompt — not an API payload."
  },

  "description": "Elite hybrid content engine combining structured virality, human realism, and algorithm manipulation layers. Outputs scripts that feel like raw thoughts but are engineered for retention, rewatch, and shareability.",

  "completion_parameters": {
    "temperature": 0.9,
    "top_p": 0.95,
    "presence_penalty": 0.7,
    "frequency_penalty": 0.32,
    "response_mode": "json_only"
  },

  "core_principle": {
    "rule": "Feels accidental. Performs intentional.",
    "balance_rule": "Raw entry → engaging middle → soft but sticky exit",
    "priority_stack": [
      "1. flow (never break this)",
      "2. human feel",
      "3. spike moments",
      "4. chaos (last resort texture)"
    ],
    "failure_conditions": [
      "too clean",
      "too chaotic",
      "predictable hook",
      "no emotional shift",
      "feels like advice",
      "viewer drops before midpoint"
    ]
  },

  "mode_engine": {
    "instruction": "Assign mode based on content_type",
    "modes": {
      "safe": {
        "base": "structured",
        "chaos_level": "low",
        "human_level": "medium",
        "goal": "high retention + relatability"
      },
      "human": {
        "base": "hybrid",
        "chaos_level": "medium",
        "human_level": "high",
        "goal": "deep connection + comments"
      },
      "outlier": {
        "base": "chaotic",
        "chaos_level": "controlled_high",
        "human_level": "very_high",
        "goal": "scroll stop + shares + debate"
      }
    }
  },

  "chaos_control_engine": {
    "limits": {
      "false_starts": 1,
      "self_interruptions": 1,
      "word_imperfections": 3,
      "breath_markers": 3
    },
    "rule": "Flow always wins over rawness",
    "fail_condition": "If speaking feels difficult → reduce chaos immediately"
  },

  "flow_engine": {
    "rule": "Script must feel like one continuous spoken thought — never broken",
    "techniques": [
      "use connectors: aur, phir, matlab, toh",
      "avoid hard full stops",
      "let sentences bleed naturally",
      "no list-like structure"
    ],
    "override_rule": "flow_engine overrides micro_interrupt_engine — if a pattern break ruins continuity, skip it"
  },

  "clarity_curve_engine": {
    "rule": "Clarity must arrive late — not at the start",
    "phases": {
      "0-40%": "confusion + curiosity",
      "40-75%": "partial understanding",
      "75-90%": "realization",
      "90-100%": "soft landing or open loop"
    },
    "word_map": {
      "note": "At 150 words avg: 0-60w = confusion, 60-112w = partial, 112-135w = realization, 135-150w = landing"
    },
    "fail_condition": "If idea is clear before 75% mark → delay insight"
  },

  "scroll_physics_engine": {
    "rule": "Engineer retention across the script timeline",
    "checkpoints": [
      "0-2s (0-15w): curiosity spike — hook must create immediate open loop",
      "3-6s (15-45w): pattern shift — change tone or direction unexpectedly",
      "7-12s (45-90w): emotional connection — viewer must see themselves",
      "13-18s (90-135w): partial reveal — answer begins but doesn't complete",
      "18s+ (135w+): rewatch trigger — last line must earn a second play"
    ],
    "note": "Word estimates assume ~8 words per second of spoken delivery"
  },

  "spike_moment_engine": {
    "rule": "Each script must include exactly 1 risky or unexpected line",
    "placement": "middle (40-70% of script)",
    "guardrails": [
      "must feel personal, not provocative for shock value",
      "must relate to the topic — not random",
      "must not break character or tone",
      "must not sound scripted"
    ],
    "examples": [
      "Sach bolu toh yeh part main usually cut karta hoon",
      "Thoda embarrassing hai but...",
      "Yeh main kisi ko bolta nahi normally"
    ],
    "fail_condition": "If spike feels forced or off-topic → replace with a quiet confession instead"
  },

  "micro_interrupt_engine": {
    "rule": "Break the pattern every 2-4 lines to prevent monotony",
    "methods": [
      "short punchy sentence",
      "language switch (Hindi ↔ English)",
      "self-question",
      "mini contradiction"
    ],
    "constraint": "Interrupts must feel like natural speech pauses — not structural breaks. flow_engine takes priority."
  },

  "voice_dna_engine": {
    "rule": "Pick and maintain ONE consistent speaking style per script",
    "variables": {
      "hesitation_style": ["light", "moderate", "correction"],
      "sentence_rhythm": ["natural_flow", "short_punchy", "mixed"],
      "english_depth": ["medium", "high"],
      "confidence_texture": ["casual", "switching"]
    },
    "output_format": "hesitation_style | sentence_rhythm | english_depth | confidence_texture"
  },

  "human_layer": {
    "applies_to": ["human", "outlier"],
    "requirements": [
      "1 false start",
      "1 embarrassment detail",
      "1 sensory detail",
      "1 thinking shift (mid-thought change of direction)"
    ],
    "rule": "All signals must feel naturally spoken — never planted"
  },

  "rewatch_engine": {
    "rule": "Last 1-2 lines must earn a second view",
    "methods": [
      "open loop that wasn't closed",
      "line that reframes everything before it",
      "something the viewer will want to share"
    ],
    "fail_condition": "If ending feels complete and clean → add an unresolved edge"
  },

  "breath_engine": {
    "allowed": ["[breath]", "[soft]", "[hard stop]"],
    "limit": 3,
    "placement": "only at emotional peaks or spike moments"
  },

  "hook_engine": {
    "rule": "Hook feels like a real mid-thought — not a headline",
    "constraints": [
      "6-14 words",
      "moment or action based",
      "opens a loop the viewer needs to close"
    ],
    "types": ["mid_thought", "confession", "mirror", "contradiction"],
    "fail_condition": "If hook sounds like an intro or announcement → rewrite as a dropped thought"
  },

  "retention_engine": {
    "rules": [
      "hook opens loop",
      "pattern interrupt in first 2 lines",
      "second loop planted mid-script",
      "rewatch trigger in last 2 lines"
    ]
  },

  "emotional_arc_engine": {
    "rule": "Script must pass through exactly 3 distinct emotional states",
    "arcs": [
      "confusion → recognition → relief",
      "confidence → doubt → reframe",
      "numb → moment → clarity",
      "frustration → observation → soft truth"
    ],
    "note": "Each arc has 3 states. Pick one arc per script and follow all 3 states in order."
  },

  "safe_upgrade_engine": {
    "applies_to": ["safe"],
    "rule": "Safe content must still feel fresh — not generic",
    "methods": [
      "twist a common situation",
      "add an unexpected observation",
      "introduce a slight contradiction"
    ],
    "fail_condition": "If safe script feels predictable or advice-like → apply one method from above"
  },

  "script_structure": {
    "flow": [
      "Hook",
      "Open loop",
      "Pattern interrupt",
      "Real scene (1 moment + sensory detail)",
      "Spike moment",
      "Soft realization",
      "CTA"
    ],
    "length": "130-200 words",
    "rule": "Structure must be invisible in delivery — never feel like a script"
  },

  "cta_engine": {
    "style": "casual, throwaway — like an afterthought",
    "examples": [
      "relate kiya?",
      "same hota hai kya?",
      "sach bata",
      "tu bhi aisa karta hai?"
    ]
  },

  "auto_content_mixer": {
    "distribution": {
      "safe": 0.5,
      "human": 0.3,
      "outlier": 0.2
    }
  },

  "quality_gate": {
    "tests": [
      "natural to speak aloud?",
      "has 1 real scene with sensory detail?",
      "no advice tone?",
      "emotional shift across 3 states?",
      "clarity arrives after 75% mark?",
      "has spike moment (human/outlier)?",
      "not predictable from first 2 lines?",
      "last line earns a rewatch?"
    ],
    "fail_action": "Rewrite only the failing section — never the full script"
  },

  "output_schema": {
    "type": "array",
    "items": {
      "topic": "string",
      "content_type": "safe | human | outlier",
      "hook": "string",
      "script": "string",
      "caption": "string",
      "hashtags": "string[]",
      "emotional_arc": "string (format: state1 → state2 → state3, must match one arc from emotional_arc_engine)",
      "rewatch_line": "string (the exact line from script that earns the rewatch)",
      "voice_dna": "string (format: hesitation_style | sentence_rhythm | english_depth | confidence_texture)"
    }
  },

  "user_instruction": "Generate exactly {{contentCount}} scripts using 50/30/20 mix. Priority order: flow → human feel → spike moments → chaos. Every script must feel like a real thought but perform like engineered content. Return only JSON."
};

export default function StrategyLab() {
	const queryClient = useQueryClient();
	const [selectedRunId, setSelectedRunId] = useState<string>('');
	const [scriptCount, setScriptCount] = useState<string>('5');
	const [recreatingIndex, setRecreatingIndex] = useState<number | null>(null);

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

	// Fetch reels (performance data) for selected run
	const { data: reels = [] } = useQuery({
		queryKey: ['reels', selectedRunId],
		queryFn: async () => {
			const res = await fetch(`${BACKEND_URL}/api/runs/${selectedRunId}/reels`);
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
${JSON.stringify(OMEGA_SCRIPT_CONFIG, null, 2)}

TASK: Generate strategic, high-performing content scripts based on historical performance and analysis.

INPUT SIGNALS (OMEGA X ANALYSIS):
${JSON.stringify(analysis, null, 2)}

HISTORICAL PERFORMANCE DATA (REELS):
${JSON.stringify(reels, null, 2)}

INSTRUCTION:
${OMEGA_SCRIPT_CONFIG.user_instruction.replace('{{contentCount}}', scriptCount)}

RETURN ONLY THE JSON ARRAY. NO MARKDOWN, NO PREAMBLE.
`;

			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						contents: [{ parts: [{ text: fullPrompt }] }],
						generationConfig: {
							response_mime_type: 'application/json',
							temperature: OMEGA_SCRIPT_CONFIG.completion_parameters.temperature,
							top_p: OMEGA_SCRIPT_CONFIG.completion_parameters.top_p,
							max_output_tokens: 8000,
						},
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('Gemini API Error:', errorData);
				throw new Error(errorData.error?.message || 'Gemini API failed');
			}

			const data = await response.json();
			if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
				console.error('Invalid Gemini Response:', data);
				throw new Error('Invalid AI response structure');
			}

			let rawResult = data.candidates[0].content.parts[0].text;
            
            if (rawResult.includes('```json')) {
                rawResult = rawResult.split('```json')[1].split('```')[0].trim();
            } else if (rawResult.includes('```')) {
                rawResult = rawResult.split('```')[1].split('```')[0].trim();
            }

			const generatedScripts = JSON.parse(rawResult);
			
			if (!Array.isArray(generatedScripts)) {
				console.error('AI did not return an array:', generatedScripts);
				throw new Error('AI failed to generate a valid list of scripts. Please try again.');
			}

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
	
	const recreateMutation = useMutation({
		mutationFn: async ({ script, index }: { script: any; index: number }) => {
			if (!analysis) throw new Error('No analysis selected');
			setRecreatingIndex(index);

			const fullPrompt = `
${JSON.stringify(OMEGA_SCRIPT_CONFIG, null, 2)}

ACT AS: VIRAL CONTENT OPTIMIZER
TASK: RECREATE AND IMPROVE THE PROVIDED SCRIPT

ORIGINAL ANALYSIS:
${JSON.stringify(analysis, null, 2)}

HISTORICAL PERFORMANCE DATA:
${JSON.stringify(reels, null, 2)}

ORIGINAL SCRIPT TO IMPROVE:
${JSON.stringify(script, null, 2)}

INSTRUCTION:
Analyze why the original script might be underperforming and recreate it to be even more viral, compelling, and aligned with the signals. 
Focus on a different hook angle or a more aggressive pattern interrupt.
Maintain the same topic but improve the script and caption.

RETURN ONLY THE JSON OBJECT. NO MARKDOWN, NO PREAMBLE.
`;

			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						contents: [{ parts: [{ text: fullPrompt }] }],
						generationConfig: {
							response_mime_type: 'application/json',
							temperature: OMEGA_SCRIPT_CONFIG.completion_parameters.temperature + 0.05,
							top_p: OMEGA_SCRIPT_CONFIG.completion_parameters.top_p,
							max_output_tokens: 8000,
						},
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('Gemini API Error (Recreate):', errorData);
				throw new Error(errorData.error?.message || 'Gemini API failed');
			}

			const data = await response.json();
			if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
				console.error('Invalid Gemini Response (Recreate):', data);
				throw new Error('Invalid AI response structure');
			}

			let rawResult = data.candidates[0].content.parts[0].text;
            
            if (rawResult.includes('```json')) {
                rawResult = rawResult.split('```json')[1].split('```')[0].trim();
            } else if (rawResult.includes('```')) {
                rawResult = rawResult.split('```')[1].split('```')[0].trim();
            }

			const newScript = JSON.parse(rawResult);

			// Save the single recreated script to backend
			await fetch(`${BACKEND_URL}/api/analysis/${analysis._id}/scripts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scripts: [newScript],
					runId: selectedRunId,
				}),
			});

			return newScript;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['scripts'] });
			setRecreatingIndex(null);
		},
		onError: (error: any) => {
			console.error('Recreate Mutation Error:', error);
			setRecreatingIndex(null);
		}
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

	const clearScriptsMutation = useMutation({
		mutationFn: async () => {
			if (!analysis?._id) return;
			// We simulate a clear by sending an empty array or a specific clear command if the backend supports it
			// Assuming the backend has a way to reset scripts or we just send an empty set
			await fetch(`${BACKEND_URL}/api/analysis/${analysis._id}/scripts/clear`, {
				method: 'POST',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['scripts'] });
		},
	});

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
							Algorithm Manipulation Elite v17.1
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
						<div className='flex gap-2'>
							<Button
								variant='outline'
								className='w-full sm:w-auto h-10 px-4 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5'
								onClick={() => {
									if (confirm('Clear all generated scripts for this run?')) {
										clearScriptsMutation.mutate();
									}
								}}
							>
								<Eraser size={14} className='mr-2' />
								Reset Lab
							</Button>
							<Button
								variant='outline'
								className='w-full sm:w-auto h-10 px-4 rounded-xl'
								onClick={exportScripts}
							>
								<Download size={14} />
							</Button>
						</div>
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
							title='Algorithm Mode'
							value='Manipulation Elite'
							icon={<Target size={14} />}
						/>
						<SummaryCard
							title='Chaos Threshold'
							value='Controlled High'
							icon={<TrendingUp size={14} />}
						/>
						<SummaryCard
							title='Active Engines'
							value='Flow + Spike'
							icon={<Sparkles size={14} />}
						/>
						<SummaryCard
							title='Human Layer'
							value='High Realism'
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
									onRecreate={() => recreateMutation.mutate({ script, index: i })}
									isRecreating={recreatingIndex === i}
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

function ScriptCard({ 
	script, 
	index, 
	onRecreate, 
	isRecreating 
}: { 
	script: any; 
	index: number; 
	onRecreate: () => void; 
	isRecreating: boolean;
}) {
	return (
		<Card className={`bg-card border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 group ${isRecreating ? 'opacity-50 pointer-events-none' : ''}`}>
			<div className='p-1 bg-muted/30 border-b border-border flex justify-between items-center px-4'>
				<div className='flex items-center gap-2'>
					<span className='text-[10px] font-black text-primary/40'>
						CONCEPT #{(index + 1).toString().padStart(2, '0')}
					</span>
					<Badge
						variant='outline'
						className='text-[8px] h-4 uppercase font-black border-primary/20 bg-primary/5 text-primary'
					>
						{script.content_type || 'OUTLIER'}
					</Badge>
				</div>
				<div className='flex items-center gap-4'>
					<div className='flex items-center gap-1'>
						<span className='text-[9px] font-black uppercase tracking-tighter text-muted-foreground'>
							Retain Potential
						</span>
						<span className='text-sm font-black text-emerald-500'>
							{script.viralityScore || '9.8'}
						</span>
					</div>
					<Button
						variant='ghost'
						size='icon'
						className='h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary transition-colors'
						onClick={onRecreate}
						disabled={isRecreating}
					>
						{isRecreating ? (
							<Loader2 className='h-3 w-3 animate-spin' />
						) : (
							<RotateCcw className='h-3 w-3' />
						)}
					</Button>
				</div>
			</div>
			<CardContent className='p-6 space-y-6'>
				<div className='space-y-2'>
					<div className='flex justify-between items-center'>
						<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
							Topic & DNA
						</h4>
						<span className='text-[9px] font-bold text-muted-foreground/60 uppercase'>
							{script.voice_dna}
						</span>
					</div>
					<p className='text-sm font-bold text-foreground leading-tight'>
						{script.topic}
					</p>
				</div>

				<div className='space-y-2'>
					<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
						Engineered Hook
					</h4>
					<div className='p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs font-bold italic text-primary leading-relaxed'>
						"{script.hook}"
					</div>
				</div>

				<div className='space-y-2'>
					<div className='flex justify-between items-center'>
						<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
							Algorithm Script
						</h4>
						<Badge
							variant='secondary'
							className='text-[8px] h-4 font-black uppercase'
						>
							{script.emotional_arc?.split('→')?.pop()?.trim() || 'CLARITY'}
						</Badge>
					</div>
					<ScrollArea className='h-32 rounded-xl border border-border p-3 bg-muted/10'>
						<p className='text-[11px] leading-relaxed font-medium whitespace-pre-wrap text-muted-foreground'>
							{script.script}
						</p>
					</ScrollArea>
                    {script.rewatch_line && (
                        <div className='mt-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10'>
                            <p className='text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1'>Rewatch Trigger</p>
                            <p className='text-[10px] font-bold text-emerald-600 italic'>"{script.rewatch_line}"</p>
                        </div>
                    )}
				</div>

				<div className='space-y-4 pt-4 border-t border-border/50'>
					<div className='space-y-2'>
						<h4 className='text-[10px] font-black uppercase tracking-widest text-muted-foreground/40'>
							Manipulation Caption
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
