import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordGuardProps {
	children: React.ReactNode;
}

const STATIC_PASSWORD = 'test1234';

export default function PasswordGuard({ children }: PasswordGuardProps) {
	const [password, setPassword] = useState('');
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [error, setError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const storedAuth = localStorage.getItem('site_auth');
		if (storedAuth === STATIC_PASSWORD) {
			setIsAuthenticated(true);
		}
		setIsLoading(false);
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (password === STATIC_PASSWORD) {
			localStorage.setItem('site_auth', STATIC_PASSWORD);
			setIsAuthenticated(true);
			setError(false);
		} else {
			setError(true);
			setPassword('');
			// Shake animation or feedback
		}
	};

	if (isLoading) {
		return (
			<div className="h-screen w-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div className="h-screen w-screen bg-background flex items-center justify-center relative overflow-hidden font-sans antialiased">
			{/* Decorative background elements */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
				<div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
				<div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
			</div>

			<div className="w-full max-w-md p-8 z-10">
				<div className="flex flex-col items-center text-center space-y-6">
					{/* Logo/Icon */}
					<div className="relative">
						<div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
							<Lock className="text-primary h-8 w-8" />
						</div>
						<div className="absolute -top-1 -right-1">
							<div className="h-4 w-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
						</div>
					</div>

					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							Secure Access
						</h1>
						<p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
							Please enter the access code to continue to <span className="text-foreground font-semibold">ReelOS</span>.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="w-full space-y-4">
						<div className="relative group">
							<Input
								type="password"
								placeholder="Enter access code..."
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									if (error) setError(false);
								}}
								className={`h-12 bg-card/50 backdrop-blur-xl border-border/50 px-4 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/20 text-center text-lg tracking-widest ${
									error ? 'border-destructive/50 ring-2 ring-destructive/10 animate-shake' : 'focus:border-primary/50'
								}`}
								autoFocus
							/>
						</div>

						{error && (
							<p className="text-destructive text-xs font-medium animate-in fade-in slide-in-from-top-1">
								Incorrect password. Please try again.
							</p>
						)}

						<Button 
							type="submit" 
							className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98] group"
						>
							<span>Access Dashboard</span>
							<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</Button>
					</form>

					<div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold pt-4">
						<ShieldCheck size={12} />
						<span>End-to-End Encrypted</span>
					</div>
				</div>
			</div>

			<style>{`
				@keyframes shake {
					0%, 100% { transform: translateX(0); }
					25% { transform: translateX(-4px); }
					75% { transform: translateX(4px); }
				}
				.animate-shake {
					animation: shake 0.2s ease-in-out 0s 2;
				}
			`}</style>
		</div>
	);
}
