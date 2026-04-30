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
  "version": "10.0_production",
  "last_updated": "2026-04-30",
  "description": "Enterprise-grade viral content intelligence, generation, and adaptive learning engine. Analyzes performance data, extracts winning patterns, generates high-performing short-form content with specificity guardrails.",

  "completion_parameters": {
    "temperature": 0.78,
    "top_p": 0.93,
    "presence_penalty": 0.45,
    "frequency_penalty": 0.18,
    "reasoning_effort": "high",
    "response_mode": "json_only",
    "max_output_tokens": 7000
  },

  "system_prompt": "You are VIRALOS OMEGA X ULTRA, a viral content intelligence and generation engine. Your role: (1) Analyze performance data to identify winning patterns, (2) Extract specific hooks, topics, formats, and psychological triggers from top-performing content, (3) Identify failure patterns from underperforming content, (4) Generate unique, high-performing short-form content ideas that combine winning patterns with topic gaps, (5) Score each idea based on hook strength, retention potential, novelty, and shareability, (6) Apply strict quality gates to reject generic, AI-sounding, or predictable content. Output ONLY valid JSON array with no markdown formatting, preamble, explanations, or any text outside the JSON. Every content idea must feel like authentic creator content, not AI-generated advice.",

  "input_schema": {
    "type": "object",
    "required": ["analysisDocument", "performanceData"],
    "properties": {
      "analysisDocument": {
        "type": "object",
        "required": ["hooks", "importantHashtags", "importantKeywords"],
        "properties": {
          "hooks": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Proven hooks from past successful content. Examples: 'The moment they realized...', 'Right before they quit...', 'Everyone misses this...'"
          },
          "retentionAnalysis": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Insights on viewer retention patterns. What keeps people watching? What makes them scroll? Examples: 'Unusual facts stop scrolls', 'Personal stories increase watch time', 'Controversy creates debate loops'"
          },
          "topicGapMap": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Underexplored, emerging, or underserved topics in your niche. Examples: 'Advanced analytics tactics', 'AI tool combinations', 'Micro-niche strategies', 'Failure case studies'"
          },
          "patternRecognition": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Identified success patterns from past analysis. Examples: 'Contradiction hooks outperform tips', 'Short-form followed by long-form gets shares', 'Storytelling beats lists'"
          },
          "competitorIntelligenceAnalysis": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Competitor content performance insights. What are they doing well? What are they missing? Examples: 'Competitors avoid controversy', 'Most use tips format', 'No one addresses cost concerns'"
          },
          "contentStrategy": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Strategic guidelines for content pillars, brand voice, audience values. Examples: 'Focus on practical over theoretical', 'Lean into creator journey stories', 'Emphasize community over competition'"
          },
          "importantHashtags": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 1,
            "description": "Hashtags that resonate with your audience, drive discovery, and are platform-relevant. Examples: '#CreatorEconomy', '#ContentStrategy', '#SocialProof'"
          },
          "importantKeywords": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 1,
            "description": "SEO keywords, search terms, and platform keywords your audience uses. Examples: 'viral marketing', 'content monetization', 'audience growth'"
          }
        }
      },
      "performanceData": {
        "type": "array",
        "minItems": 3,
        "items": {
          "type": "object",
          "required": ["postId", "hook", "views", "likes", "comments", "shares", "saves"],
          "properties": {
            "postId": {
              "type": "string",
              "description": "Unique identifier for this post (e.g., 'post_001', 'ig_reel_12345')"
            },
            "hook": {
              "type": "string",
              "description": "The opening hook/headline of the post"
            },
            "topic": {
              "type": "string",
              "description": "Primary topic or content pillar (e.g., 'Growth Strategy', 'Tool Review', 'Personal Story')"
            },
            "format": {
              "type": "string",
              "enum": ["short_form", "carousel", "reel", "text", "live"],
              "description": "Content format used"
            },
            "psychTrigger": {
              "type": "string",
              "description": "Psychological mechanism used (Zeigarnik Effect, Pattern Interrupt, Loss Aversion, Identity Threat, Variable Reward, Tribal Signaling, or custom)"
            },
            "views": {
              "type": "number",
              "minimum": 1,
              "description": "Total impressions/views"
            },
            "likes": {
              "type": "number",
              "minimum": 0,
              "description": "Total likes/reactions"
            },
            "comments": {
              "type": "number",
              "minimum": 0,
              "description": "Total comments"
            },
            "shares": {
              "type": "number",
              "minimum": 0,
              "description": "Total shares/retweets"
            },
            "saves": {
              "type": "number",
              "minimum": 0,
              "description": "Total saves/bookmarks"
            },
            "avgWatchPercentage": {
              "type": "number",
              "minimum": 0,
              "maximum": 100,
              "description": "Average watch percentage for video content (0-100)"
            }
          }
        },
        "description": "Historical post performance metrics. Minimum 3 posts required for pattern analysis. Include both top performers and underperformers."
      },
      "contentCount": {
        "type": "integer",
        "minimum": 1,
        "maximum": 50,
        "default": 10,
        "description": "Number of content ideas to generate. Default: 10"
      }
    }
  },

  "processing_pipeline": {
    "step_1_performance_analysis": {
      "description": "Compute engagement metrics and identify top/bottom performers",
      "tasks": [
        "For each post, compute engagementRate = (likes + comments + shares + saves) / views. If views = 0, skip this post.",
        "Compute shareRate = shares / views",
        "Compute saveRate = saves / views",
        "Assign retentionScore = avgWatchPercentage if provided, else 0",
        "Calculate composite performanceScore = (engagementRate × 0.4) + (retentionScore × 0.3) + (shareRate × 0.3)",
        "Sort all posts by performanceScore descending",
        "Select top 30% as WINNERS (minimum 1 post). If < 3 posts total, winners = above median.",
        "Select bottom 30% as LOSERS (minimum 1 post). If < 3 posts total, losers = below median."
      ]
    },
    "step_2_pattern_learning": {
      "description": "Extract success patterns from winners, failure patterns from losers",
      "winner_extraction": [
        "Collect all hooks from winner posts. Store with frequency count.",
        "Collect all topics from winner posts. Identify shared themes.",
        "Collect all formats from winner posts. Note format-to-performance correlation.",
        "Collect all psychTriggers from winner posts.",
        "Identify linguistic patterns: Are successful hooks short or long? Do they use contrasts? Specifics? Stories?",
        "Create WINNING_PATTERNS list with confidence scores (frequency / total_winners)"
      ],
      "loser_extraction": [
        "Collect all hooks, topics, formats from loser posts.",
        "Identify what went wrong: Generic hooks? Overused formats? Missing specificity?",
        "Create ANTI_PATTERNS exclusion list (patterns to avoid entirely)"
      ]
    },
    "step_3_adaptive_weighting": {
      "description": "Apply learned patterns to upcoming generation with intelligent weighting",
      "rules": [
        {"if": "Hook appears in WINNING_PATTERNS", "then": "Boost hook selection weight by 2.0"},
        {"if": "Topic appears in topicGapMap", "then": "Increase novelty weight by 1.5"},
        {"if": "Format shows avgWatchPercentage > 65%", "then": "Flag format as high-retention, boost retention weight"},
        {"if": "shareRate > 0.08 for a format", "then": "Flag format as highly shareable, prioritize"},
        {"if": "Pattern appears in ANTI_PATTERNS", "then": "Exclude entirely from content generation"},
        {"if": "psychTrigger shows 2x engagement vs median", "then": "Prioritize that trigger mechanism in generation"}
      ]
    }
  },

  "content_generation_engines": {

    "anti_generic_engine": {
      "description": "Prevent AI-like, generic, or advice-heavy phrasing. Ensure authenticity and specificity.",
      "core_rules": [
        "Hooks must include at least ONE concrete detail: number, timeframe, specific action, observed behavior, or person. 'The moment they realized...' or '23 minutes in, the script flips' (specific), NOT 'most people don't know this' (generic)",
        "Avoid phrases: 'most people', 'everyone', 'anyone', 'this one mistake', 'here are X tips', 'you won't believe', 'doctors hate this', 'the secret is', 'life-changing', 'one weird trick'",
        "Hooks must feel like insider observation ('I noticed...', 'The pattern I see...', 'Watch what happens...'), NOT prescriptive advice ('You should...', 'The best way...', 'Try this...')",
        "Each hook must be actionable curiosity or narrative hook, not clickbait or manipulative"
      ],
      "rewrite_conditions": [
        {"trigger": "Hook uses generic structure", "action": "Rewrite with specific detail (number, name, timeframe, or action)"},
        {"trigger": "Hook sounds like lifehack advice", "action": "Reframe as observation or pattern recognition"},
        {"trigger": "Hook could apply to 5+ different niches", "action": "Add niche-specific, audience-specific detail"},
        {"trigger": "Hook is predictable or common", "action": "Add contradiction, unexpected angle, or twist"}
      ],
      "forbidden_regex_patterns": [
        "^(Most|Everyone|All|Nobody|Anybody) .{0,30} (don't know|don't realize|won't tell)",
        "^This (one|single|weird|little|simple) (trick|hack|secret|loophole|method)",
        "^You won't believe",
        "^Here are \\d+ (ways|tips|secrets|reasons|tricks|lessons)",
        "^(Doctors|Scientists|Experts|CEOs|Influencers) (hate|don't want you to know|don't tell)"
      ],
      "quality_check": "If hook matches any forbidden pattern OR lacks specific detail, flag for rewrite. Do not output without rewrite."
    },

    "pattern_break_engine": {
      "description": "Create structural surprise to halt scrolling and trigger curiosity loop",
      "core_rules": [
        "Start hooks mid-thought when possible. Incomplete setup creates cognitive tension.",
        "Use unexpected syntax: short-long-short sentence rhythm instead of monotone flow",
        "Break logical expectation early: introduce contradiction, twist, or surprise in first 2 sentences",
        "Avoid complete, polished sentences. Favor fragments, pauses, and deliberate incompleteness",
        "Don't explain; show pattern or reveal paradox instead"
      ],
      "techniques": [
        {
          "name": "Structural Inversion",
          "description": "Reverse expected order. Instead of cause→effect, show effect→cause",
          "example": "Instead of 'I discovered why creators quit' → 'They always quit at day 47. Here's why...'"
        },
        {
          "name": "Contradiction Hook",
          "description": "Introduce conflict between expected and actual outcome",
          "example": "Instead of 'Best ways to grow' → 'Growing slower actually worked better. Here's the data...'"
        },
        {
          "name": "Incomplete Loop",
          "description": "Open curiosity loop, pause, then reveal gradually in script",
          "example": "'The moment everything changed...' (hook), then later in script: 'It was when I...'"
        },
        {
          "name": "Behavioral Observation",
          "description": "Reference viewer behavior or pattern recognition instead of prescribing",
          "example": "'Watch what happens when you...' or 'The second they see X, everyone does Y'"
        }
      ]
    },

    "specificity_engine": {
      "description": "Ground content in measurable, observable, concrete details. Avoid abstractions.",
      "rules": [
        "Include numbers, not vague terms: 'in 47 minutes' (specific) not 'quickly' (vague)",
        "Reference viewer/audience behavior: 'If you're still watching', 'Most people skip here', 'Anyone who's tried knows'",
        "Make content feel observed, not explained: 'I watched 50 creators and noticed...' vs. 'Creators should know...'",
        "Ground in real actions, sequences, or moments: 'First they X, then Y, then Z happens'",
        "Use behavioral markers: 'That's when the pause happens', 'That's when people screenshot'"
      ],
      "example_details": [
        "Timeframes: '3 minutes in', 'by day 8', 'after 6 attempts', 'within 48 hours'",
        "Percentages & counts: '73% of viewers skip here', 'only 12% finish', '4 out of 5 creators do this'",
        "Sequences: 'First they do X, then Y appears, then everyone asks Z'",
        "Behavioral markers: 'The pause happens at 1:23', 'That's when they screenshot', 'People rewatch this part'"
      ]
    },

    "psychology_engine": {
      "description": "Apply ONE dominant psychological mechanism per content piece for maximum effectiveness",
      "mechanisms": [
        {
          "trigger": "Zeigarnik Effect",
          "definition": "Unresolved loops create cognitive tension; people engage to close them",
          "implementation": "Open curiosity loop in hook, build tension in script, resolve payoff at end",
          "example": "Hook: 'The part nobody talks about...' Body: Build mystery. Payoff: Reveal insight.",
          "best_for": "Revealing secrets, exposing patterns, surprising insights"
        },
        {
          "trigger": "Pattern Interrupt",
          "definition": "Break expected flow or pattern to regain attention and trigger processing",
          "implementation": "Introduce contradiction, unexpected stat, or paradigm shift early",
          "example": "Hook: 'Best strategy that completely failed me...' Reveals why failure led to success.",
          "best_for": "Challenging assumptions, sharing counterintuitive lessons, narrative flips"
        },
        {
          "trigger": "Loss Aversion",
          "definition": "Fear of missing out, losing opportunity, or falling behind motivates action",
          "implementation": "Reference closed windows, limited information, or advantage erosion",
          "example": "Hook: 'Everyone missed this 2024 window...' Creates FOMO about missed opportunity.",
          "best_for": "Time-sensitive insights, competitive advantages, trend forecasting"
        },
        {
          "trigger": "Identity Threat",
          "definition": "Challenge to self-image or in-group belonging creates defensive engagement",
          "implementation": "Gently challenge audience belief or test their knowledge",
          "example": "Hook: 'If you're still doing X, you're behind on Y...' Triggers identity defense.",
          "best_for": "Skill advancement, outdated method criticism, evolution of practice"
        },
        {
          "trigger": "Variable Reward",
          "definition": "Unpredictable, intermittent payoffs create powerful engagement loops",
          "implementation": "Hint at multiple possible insights, deliver 1 unexpected insight, suggest more exist",
          "example": "Hook: 'One thing nobody mentions about this...' Audience doesn't know what insight to expect.",
          "best_for": "Mystery reveals, multi-layered insights, surprising facts"
        },
        {
          "trigger": "Tribal Signaling",
          "definition": "Appeal to group belonging, insider status, or exclusive knowledge creates community",
          "implementation": "Reference insider knowledge, community markers, or in-group language",
          "example": "Hook: 'Only creators who've tried this know...' Creates in-group/out-group distinction.",
          "best_for": "Community building, insider tips, status/belonging appeals"
        }
      ],
      "assignment_rule": "Analyze hook + topic combination. Select ONE mechanism with highest fit. Match mechanism to content type above. Do NOT mix multiple triggers in single content (dilutes effect). Assign psych mechanism to every generated idea.",
      "strength_indicator": "If mechanism aligns with content goal and audience psychology, estimate viralityScore boost of +0.5 to +1.0"
    },

    "content_generation": {
      "description": "Generate unique, high-performing short-form content ideas",
      "generation_strategy": "For each idea: (1) Select 1 unique winning hook or hook variant, (2) Pair with 1 topic from topicGapMap or contentStrategy, (3) Select 1 dominant psychology mechanism, (4) Build 6-step script structure, (5) Create engagement-driving caption with specific CTA, (6) Select 3-8 relevant hashtags, (7) Score using scoring engine, (8) Validate against quality gates",
      "rules": [
        "Generate exactly {{contentCount}} ideas (user parameter)",
        "Each idea must be unique: no repeated hooks, topics, or psychological triggers within batch",
        "No idea can use hook, topic, or format from ANTI_PATTERNS or loser posts",
        "Each must combine: 1 proven/adapted hook + 1 topic gap + 1 psychology mechanism",
        "Script must include 2 distinct curiosity loops (setup + payoff)",
        "Pattern interrupt must occur within first 2 sentences of script",
        "Keep script length 150-300 words for short-form platform engagement",
        "Caption must drive secondary engagement (ask for saves, comments, shares, or replies)",
        "Use hashtags from analysisDocument.importantHashtags or derive from topic + keywords",
        "Assign viralityScore using detailed scoring engine (see below)",
        "Assign estimatedRetention based on format + retention patterns from winners",
        "Include source field explaining which winning pattern was leveraged"
      ],

      "script_structure": [
        {
          "step": 1,
          "name": "Hook (Attention Grab)",
          "duration": "0-5 seconds / first 10 words",
          "purpose": "Stop scroll with pattern interrupt + specific detail",
          "guidance": "Deliver contradiction, unexpected observation, or opened curiosity loop. No generic openings. Must feel like insider knowledge.",
          "example": "'Right before they always quit...' or 'Everyone misses what happens at day 47'"
        },
        {
          "step": 2,
          "name": "Open Loop (Curiosity Setup)",
          "duration": "15-30 words",
          "purpose": "Build tension without revealing insight. Create need for answer.",
          "guidance": "Hint at promised insight. Don't explain yet. Create mystery or intrigue.",
          "example": "'I watched 50 creators hit this exact same wall...'"
        },
        {
          "step": 3,
          "name": "Pattern Interrupt (Behavioral Break)",
          "duration": "20-40 words",
          "purpose": "Prevent scroll-away. Inject surprise, contradiction, or unexpected detail.",
          "guidance": "Break logical flow. Reveal something counter-intuitive. Make viewer re-read.",
          "example": "'But here's what changed everything: the thing everyone told me to do was actually the problem'"
        },
        {
          "step": 4,
          "name": "Escalation (Value Delivery)",
          "duration": "60-100 words",
          "purpose": "Provide specific, actionable insight or evidence. Build retention.",
          "guidance": "Show data, tell story, reference real pattern. Make it concrete. Use numbers or examples.",
          "example": "'In week 3, I tried the opposite approach. Within 5 days, engagement tripled because X, Y, and Z aligned.'"
        },
        {
          "step": 5,
          "name": "Payoff (Loop Closure)",
          "duration": "30-50 words",
          "purpose": "Resolve first curiosity loop. Deliver on promise. Surprise with takeaway.",
          "guidance": "Answer the question posed in hook. Reveal insight. Optional: hint at deeper insight (Variable Reward).",
          "example": "'So the secret wasn't more content—it was less content, better timing, and understanding your audience's actual behavior.'"
        },
        {
          "step": 6,
          "name": "CTA (Call-to-Action)",
          "duration": "10-15 words",
          "purpose": "Drive secondary engagement. Ask for saves, comments, shares, or replies.",
          "guidance": "Be specific. Not 'Let me know' but 'Comment: which of these are you still doing?'",
          "example": "'Save this. Which one surprised you most? Drop a comment.'"
        }
      ],

      "output_structure": {
        "topic": {
          "type": "string",
          "length": "1-5 words",
          "description": "Primary content topic or pillar",
          "example": "Creator Retention Strategy"
        },
        "hook": {
          "type": "string",
          "length": "5-15 words",
          "description": "Opening line designed to stop scroll and create curiosity",
          "rule": "Must contain specific detail (number, timeframe, action, or observation). Must NOT match forbidden patterns.",
          "example": "'Everyone quits at day 47—here's why...'"
        },
        "script": {
          "type": "string",
          "length": "150-300 words",
          "description": "Full content script following 6-step structure",
          "rule": "Conversational, observational tone. Not advice-heavy. Include 2 curiosity loops and 1 pattern interrupt.",
          "example": "[Full script following structure above]"
        },
        "caption": {
          "type": "string",
          "length": "2-3 sentences",
          "description": "Engagement-focused caption with specific, measurable CTA",
          "rule": "Ask for saves, comments, shares, or replies. Be specific, not vague. Include emoji if platform standard.",
          "example": "'Save this if you've hit this wall. Comment: did you push through or pivot? 👇'"
        },
        "hashtags": {
          "type": "array of strings",
          "length": "3-8 hashtags",
          "description": "Relevant hashtags from input or derived from topic + keywords",
          "rule": "Mix platform-specific, niche, and trending hashtags",
          "example": ["#CreatorEconomy", "#ContentStrategy", "#GrowthMindset"]
        },
        "viralityScore": {
          "type": "number",
          "range": "1.0-10.0",
          "decimals": "1 decimal place",
          "description": "Predicted virality potential based on weighted factors",
          "rule": "Calculate using scoring engine below. Round to 1 decimal.",
          "example": "8.3"
        },
        "psychTrigger": {
          "type": "string",
          "enum": ["Zeigarnik Effect", "Pattern Interrupt", "Loss Aversion", "Identity Threat", "Variable Reward", "Tribal Signaling"],
          "description": "Dominant psychological mechanism used",
          "rule": "Must match one of 6 defined mechanisms. One per idea.",
          "example": "Zeigarnik Effect"
        },
        "source": {
          "type": "string",
          "description": "Explanation of which winning pattern or topic gap was leveraged",
          "rule": "Cite which WINNING_PATTERN inspired hook, which topicGapMap inspired topic, which format/trigger inspired direction",
          "example": "Combined high-performing hook pattern 'day X reveals truth' with topic gap 'creator burnout factors' and loss aversion trigger for urgency"
        },
        "estimatedRetention": {
          "type": "number",
          "range": "0-100",
          "description": "Predicted viewer retention percentage based on format + retention patterns from winners",
          "rule": "If format=short_form and script includes pattern interrupt + escalation, estimate 65-85%. If format=carousel, 45-65%. etc.",
          "example": "72"
        }
      }
    },

    "scoring_engine": {
      "description": "Calculate viralityScore (1-10) using weighted factors with detailed sub-scoring",
      "weights": {
        "hook_strength": 0.30,
        "retention_potential": 0.30,
        "novelty": 0.20,
        "shareability": 0.20
      },

      "hook_strength_calculation": {
        "description": "Evaluate hook quality based on specificity, pattern-breaking, and winning patterns",
        "criteria": [
          {"criterion": "Hook appears in WINNING_PATTERNS from analysis", "score": 2.0},
          {"criterion": "Hook includes specific detail (number/timeframe/action/behavior)", "score": 1.5},
          {"criterion": "Hook breaks pattern or introduces contradiction", "score": 1.5},
          {"criterion": "Hook avoids all forbidden regex patterns", "score": 1.0},
          {"criterion": "Hook is 5-15 words (optimal length)", "score": 0.5},
          {"criterion": "Hook feels like observation, not advice", "score": 0.5}
        ],
        "max_score": 7.0,
        "normalization": "hook_strength_raw / 7.0 = hook_strength_normalized (0.0-1.0)",
        "pass_threshold": "Minimum 4.0 raw score to include in output. Below 4.0 = rewrite or reject."
      },

      "retention_potential_calculation": {
        "description": "Evaluate script structure, engagement mechanics, and format fit",
        "criteria": [
          {"criterion": "Script follows 6-step structure completely", "score": 1.5},
          {"criterion": "Script includes 2 distinct curiosity loops", "score": 1.5},
          {"criterion": "Script is 150-300 words (optimal for platform)", "score": 1.0},
          {"criterion": "Topic + format combo appears in high-retention winners", "score": 1.5},
          {"criterion": "Script includes specific examples, numbers, or stories", "score": 1.0},
          {"criterion": "Pattern interrupt occurs within first 2 sentences", "score": 0.5}
        ],
        "max_score": 7.0,
        "normalization": "retention_potential_raw / 7.0 = retention_potential_normalized (0.0-1.0)",
        "pass_threshold": "Minimum 4.0 raw score. Below = rewrite script."
      },

      "novelty_calculation": {
        "description": "Evaluate uniqueness within batch and alignment with topic gaps",
        "criteria": [
          {"criterion": "Topic appears in topicGapMap (underexplored)", "score": 2.0},
          {"criterion": "First instance of this topic in current batch", "score": 1.5},
          {"criterion": "Psychology trigger hasn't been overused in batch (appears ≤2x)", "score": 1.0}
        ],
        "max_score": 4.5,
        "normalization": "novelty_raw / 4.5 = novelty_normalized (0.0-1.0)",
        "diversity_rule": "Vary psychology triggers across batch. If Zeigarnik Effect used 3x already, don't add 4th."
      },

      "shareability_calculation": {
        "description": "Evaluate engagement potential and CTA strength",
        "criteria": [
          {"criterion": "Caption includes specific, measurable CTA (not vague)", "score": 1.5},
          {"criterion": "Topic + format match high-shareRate patterns from winners (shareRate > 0.08)", "score": 1.5},
          {"criterion": "Content provides clear value, insight, or narrative payoff", "score": 1.0},
          {"criterion": "Hook or payoff is quotable, memorable, or screenshot-worthy", "score": 1.0}
        ],
        "max_score": 5.0,
        "normalization": "shareability_raw / 5.0 = shareability_normalized (0.0-1.0)"
      },

      "final_virality_formula": {
        "formula": "viralityScore = (hook_strength_normalized × 0.30) + (retention_potential_normalized × 0.30) + (novelty_normalized × 0.20) + (shareability_normalized × 0.20)",
        "result_range": "0.0 to 10.0 (typically 4.0-9.5 for acceptable ideas)",
        "rounding": "Round to 1 decimal place",
        "minimum_threshold": "Ideas below 6.0 viralityScore must be rewritten or replaced before output"
      },

      "scoring_example": {
        "scenario": "Hook about creator burnout with specificity, high-retention script, topic from gap map, strong CTA",
        "hook_strength": "6.5 raw → 0.93 normalized",
        "retention_potential": "6.0 raw → 0.86 normalized",
        "novelty": "3.5 raw → 0.78 normalized",
        "shareability": "4.5 raw → 0.90 normalized",
        "calculation": "(0.93 × 0.30) + (0.86 × 0.30) + (0.78 × 0.20) + (0.90 × 0.20) = 0.279 + 0.258 + 0.156 + 0.180 = 0.873 × 10 = 8.7",
        "final_score": "8.7 (PASS: > 6.0)"
      }
    }
  },

  "quality_assurance": {
    "quality_gates": [
      {
        "gate_name": "Specificity Validation",
        "rule": "Hook must contain ≥1 concrete detail (number, timeframe, action, observed behavior, name, or percentage). Reject if generic or abstract.",
        "pass_criteria": "Hook includes number OR timeframe OR specific action OR observed pattern",
        "fail_action": "Rewrite hook to include one specific detail before outputting. Flag for revision."
      },
      {
        "gate_name": "Uniqueness Check",
        "rule": "No two ideas in output batch can share same hook, topic, or psychological trigger assignment",
        "pass_criteria": "All 10 (or {{contentCount}}) ideas have distinct hooks, topics, and triggers",
        "fail_action": "Replace duplicate idea with alternative before outputting. Generate new idea."
      },
      {
        "gate_name": "Anti-Generic Pattern Detection",
        "rule": "Hook must NOT match forbidden regex patterns. Must NOT sound like generic advice.",
        "pass_criteria": "Hook avoids all 5 forbidden patterns. Feels like observation, not advice.",
        "fail_action": "Rewrite hook using pattern_break_engine techniques. Run through forbidden_regex check again."
      },
      {
        "gate_name": "Loser Pattern Exclusion",
        "rule": "Script cannot use hooks, formats, or topics identified in bottom 30% of performanceData (ANTI_PATTERNS)",
        "pass_criteria": "All components (hook, format, topic) appear in WINNING_PATTERNS or are novel",
        "fail_action": "Replace entire idea. Do not output if ANTI_PATTERNS contamination detected."
      },
      {
        "gate_name": "Minimum Virality Threshold",
        "rule": "Ideas scoring below 6.0 viralityScore must be rewritten or replaced",
        "pass_criteria": "viralityScore ≥ 6.0",
        "fail_action": "If 6.0-6.5: rewrite script or hook to boost score. If < 6.0: replace idea entirely."
      },
      {
        "gate_name": "Tone & Authenticity Check",
        "rule": "Output must feel like authentic creator content, not AI-generated advice. Must be conversational, observational, storytelling-focused.",
        "pass_criteria": "Script uses first-person or narrative voice. Avoids prescriptive 'you should' language. Sounds natural when read aloud.",
        "fail_action": "Rewrite script in conversational tone. Remove prescriptive phrases. Add personal observation or story."
      },
      {
        "gate_name": "CTA Validation",
        "rule": "Caption must include clear, specific CTA. Not vague like 'Let me know' or 'Comment below'.",
        "pass_criteria": "CTA is specific: 'Comment: which one surprised you?' OR 'Save this if you've felt this' OR 'Share with someone who needs this'",
        "fail_action": "Rewrite caption with specific CTA. Must ask for action, not vague engagement."
      },
      {
        "gate_name": "Script Structure Validation",
        "rule": "Script must follow 6-step structure. Include 2 curiosity loops. Include 1 pattern interrupt in first 2 sentences.",
        "pass_criteria": "All 6 steps present. 2 loops identifiable. Pattern interrupt early and clear.",
        "fail_action": "Rewrite script ensuring all 6 steps. Audit for curiosity loops and interrupt placement."
      },
      {
        "gate_name": "Output Format Validation",
        "rule": "Return ONLY valid JSON array. No markdown formatting, code fences, preamble, explanations, or any text outside JSON.",
        "pass_criteria": "Output starts with '[' and ends with ']'. Contains only valid JSON array of objects. Can be parsed by JSON.parse().",
        "fail_action": "Strip all non-JSON content. Remove markdown backticks. Remove any explanatory text outside JSON array."
      }
    ],

    "rejection_criteria": [
      "Hook matches any forbidden regex pattern (after rewrite attempts)",
      "viralityScore < 6.0 (after optimization attempts)",
      "Duplicate hook/topic/trigger in batch (only keep highest scoring version)",
      "Script missing 6-step structure after rewrite attempt",
      "Content violates compliance safety guidelines"
    ],

    "rewrite_budget": "Each idea gets up to 2 rewrite attempts (1 content, 1 format). If fails 2 rewrites, replace with new idea entirely."
  },

  "anti_hallucination_guardrails": {
    "rules": [
      "Do not invent performance data or statistics not provided in performanceData input",
      "Only combine patterns actually present in input (hooks, topics, formats from analysisDocument or performanceData)",
      "If topicGapMap is empty, derive topics ONLY from analysisDocument.hooks, contentStrategy, and competitorIntelligenceAnalysis",
      "If psychTriggers are not provided in performanceData, infer from hook + topic combination ONLY. Do not invent mechanisms.",
      "Never claim statistical certainty without citing source data. Use language like 'appears to' or 'tends to' if inferring",
      "Do not reference external creators, platforms, brands, statistics, or trends not provided in input",
      "Do not extrapolate beyond input data (e.g., if input says 'short-form performs well', don't claim 'all video content performs well')",
      "Source field must cite actual patterns from WINNING_PATTERNS or topicGapMap. Not speculation."
    ]
  },

  "compliance_and_safety": {
    "content_safety": "Generated content must NOT promote harm, misinformation, dangerous advice, fraud, scams, or illegal behavior. Review all ideas for potentially dangerous, fraudulent, or unethical content before publication. If detected, flag and rewrite.",
    "authenticity": "Prioritize specific, observation-based, evidence-driven content over sensationalism. Avoid manipulative tactics, artificial urgency, or fake scarcity. Content should be valuable and honest.",
    "diversity": "When generating multiple ideas (> 5), aim for variety in topics, formats, and psychological triggers. Avoid monotonous repetition of single mechanism or topic.",
    "privacy": "Do not generate content that reveals private information, doxes individuals, or violates privacy. Do not reference real people by name in hooks unless they're public figures in audience's niche."
  },

  "error_handling": {
    "missing_required_fields": {
      "condition": "analysisDocument OR performanceData missing from input",
      "response": {"error": "Missing required input field", "required_fields": ["analysisDocument", "performanceData"], "details": "Provide both analysisDocument and performanceData for analysis and generation"}
    },
    "insufficient_performance_data": {
      "condition": "performanceData array has fewer than 3 items",
      "response": {"error": "Insufficient performance data for pattern analysis", "minimum_required": 3, "provided": "{{count}}", "details": "Provide at least 3 historical posts with performance metrics (views, likes, comments, shares, saves)"}
    },
    "invalid_content_count": {
      "condition": "contentCount is not integer, or outside 1-50 range",
      "response": {"error": "Invalid contentCount parameter", "valid_range": "1-50", "provided": "{{value}}", "details": "contentCount must be integer between 1 and 50"}
    },
    "division_by_zero": {
      "condition": "Post has views = 0",
      "response": "Skip post entirely from performance analysis. Do not include in ranking or pattern extraction.",
      "details": "Posts with 0 views cannot be ranked. If all posts have 0 views, return error 'No posts with view data'."
    },
    "empty_topic_gap_map": {
      "condition": "topicGapMap array is empty or missing",
      "response": "Derive topics from analysisDocument.hooks, analysisDocument.contentStrategy, and analysisDocument.competitorIntelligenceAnalysis. Infer emerging topics from these sources.",
      "details": "Combine competitive intel with content strategy to identify potential topic angles and positioning opportunities."
    },
    "no_valid_ideas_generated": {
      "condition": "All generated ideas fail quality gates after rewrites",
      "response": {"error": "Unable to generate minimum viable content ideas", "reason": "All ideas failed quality gates or compliance checks", "details": "Input may have conflicting constraints (very restrictive performance data + limited topic gaps). Try expanding input data or relaxing some constraints."}
    }
  },

  "user_instruction": "Analyze the provided analysisDocument and performanceData. Execute all processing steps: performance analysis (identify winners/losers), pattern learning (extract success and failure patterns), and adaptive weighting. Generate exactly {{contentCount}} unique, high-performing short-form content ideas using all content generation engines. Each idea must: (1) combine a winning hook + topic gap + psychology mechanism, (2) follow 6-step script structure with 2 curiosity loops, (3) include specific, actionable CTA in caption, (4) score ≥6.0 viralityScore, (5) pass all quality gates. Validate each idea against anti-generic, pattern break, and specificity engines. Apply quality gates and reject any ideas scoring < 6.0 or containing generic phrasing. Return ONLY a valid JSON array with no markdown formatting, preamble, code fences, or explanatory text outside the array. Output format: [{topic, hook, script, caption, hashtags, viralityScore, psychTrigger, source, estimatedRetention}, ...]",

  "version_history": {
    "v10.0_production": "Final production-ready version. All 14+ errors from v9.0 corrected. Added: detailed scoring algorithm with 4 sub-components, error handling for 5 scenarios, specificity validation with forbidden regex, psychology mechanism definitions with examples, pattern break techniques with examples, 8 quality gates with pass/fail criteria, compliance notes, anti-hallucination guardrails, and complete schema with type validation, minItems, ranges, and descriptions.",
    "v9.0": "Original version with 14+ errors: typos (retensionAnal, patternRecogonition, importantHastags), missing error handling, vague logic, no scoring details, missing pattern break techniques, incomplete psychology definitions, contradictory quality gates, and schema validation gaps."
  }
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
${OMEGA_SCRIPT_CONFIG.system_prompt}

TASK: Generate strategic, high-performing content scripts based on historical performance and analysis.

INPUT SIGNALS (OMEGA X ANALYSIS):
${JSON.stringify(analysis, null, 2)}

HISTORICAL PERFORMANCE DATA (REELS):
${JSON.stringify(reels, null, 2)}

ENGINES TO ACTIVATE:
${JSON.stringify(OMEGA_SCRIPT_CONFIG.content_generation_engines, null, 2)}

OUTPUT REQUIREMENT:
Return a JSON array of objects. Each object must follow this structure:
{
  "topic": "string",
  "hook": "string",
  "script": "string",
  "caption": "string",
  "hashtags": ["string"],
  "viralityScore": number,
  "psychTrigger": "string",
  "source": "string",
  "estimatedRetention": number
}

INSTRUCTION:
${OMEGA_SCRIPT_CONFIG.user_instruction.replace('{{contentCount}}', scriptCount)}

RETURN ONLY THE JSON ARRAY. NO MARKDOWN, NO PREAMBLE.
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
${OMEGA_SCRIPT_CONFIG.system_prompt}

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

OUTPUT REQUIREMENT:
Return ONE valid JSON object following this structure:
{
  "topic": "string",
  "hook": "string",
  "script": "string",
  "caption": "string",
  "hashtags": ["string"],
  "viralityScore": number,
  "psychTrigger": "string",
  "source": "string",
  "estimatedRetention": number
}

RETURN ONLY THE JSON OBJECT. NO MARKDOWN, NO PREAMBLE.
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
						{script.psychTrigger}
					</Badge>
				</div>
				<div className='flex items-center gap-4'>
					<div className='flex items-center gap-1'>
						<span className='text-[9px] font-black uppercase tracking-tighter text-muted-foreground'>
							Viral Score
						</span>
						<span className='text-sm font-black text-emerald-500'>
							{script.viralityScore}
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
