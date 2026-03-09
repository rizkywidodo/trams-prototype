import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md focus-within:border-violet-400/50 transition-colors">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div
    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 opacity-0"
    style={{
      animation: `testimonialIn 0.6s ease-out ${delay} forwards`,
      transform: 'translateY(10px) scale(0.95)',
      filter: 'blur(4px)',
    }}
  >
    <div className="flex items-center gap-3 mb-2">
      <img src={testimonial.avatarSrc} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
      <div>
        <p className="text-sm font-semibold text-white">{testimonial.name}</p>
        <p className="text-xs text-white/50">{testimonial.handle}</p>
      </div>
    </div>
    <p className="text-sm text-white/70 leading-relaxed">{testimonial.text}</p>
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span>Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0f]">
      {/* Left column: sign-in form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div
            className="space-y-2 opacity-0"
            style={{
              animation: 'fadeSlideIn 0.6s ease-out 0.1s forwards',
              transform: 'translateY(10px)',
              filter: 'blur(4px)',
            }}
          >
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-white/50 text-sm">{description}</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); onSignIn?.(e); }}
            className="space-y-5 opacity-0"
            style={{
              animation: 'fadeSlideIn 0.6s ease-out 0.3s forwards',
              transform: 'translateY(10px)',
              filter: 'blur(4px)',
            }}
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Email Address</label>
              <GlassInputWrapper>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                />
              </GlassInputWrapper>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">Password</label>
              <GlassInputWrapper>
                <div className="flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                    {showPassword ? <EyeOff className="w-4 h-4 text-white/40" /> : <Eye className="w-4 h-4 text-white/40" />}
                  </button>
                </div>
              </GlassInputWrapper>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                <input type="checkbox" name="remember" className="rounded border-white/20 bg-white/5 accent-violet-500" />
                Keep me signed in
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-violet-400 transition-colors">Reset password</a>
            </div>

            <button type="submit" className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/25">
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-3 text-white/30 text-xs">
            <div className="flex-1 h-px bg-white/10" />
            Or continue with
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={onGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-center text-xs text-white/40">
            New to our platform?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-violet-400 hover:underline transition-colors">Create Account</a>
          </p>
        </div>
      </div>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-8 overflow-hidden">
          <img
            src={heroImageSrc}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover rounded-l-3xl opacity-0"
            style={{
              animation: 'slideRightIn 0.8s ease-out 0.2s forwards',
              transform: 'translateX(20px)',
              filter: 'blur(8px)',
            }}
          />
          {testimonials.length > 0 && (
            <div className="relative z-10 space-y-4 max-w-sm">
              {testimonials[0] && <TestimonialCard testimonial={testimonials[0]} delay="0.5s" />}
              {testimonials[1] && <TestimonialCard testimonial={testimonials[1]} delay="0.7s" />}
              {testimonials[2] && <TestimonialCard testimonial={testimonials[2]} delay="0.9s" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
