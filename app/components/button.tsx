import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'yellow' | 'outline' | 'outline-light' | 'dark' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center rounded-pill font-label text-[0.76rem] transition duration-200 ease-out hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed';

const sizes: Record<Size, string> = {
  md: 'px-[22px] py-[12px]',
  lg: 'px-[32px] py-[16px] text-[0.84rem]',
};

const variants: Record<Variant, string> = {
  yellow: 'bg-yellow text-navy hover:brightness-105',
  outline: 'border border-navy text-navy hover:bg-navy hover:text-white',
  'outline-light': 'border border-white/50 text-white hover:bg-white/10',
  dark: 'bg-navy text-white hover:bg-navy-soft',
  ghost: 'text-navy hover:text-navy-soft hover:translate-y-0',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'dark',
  size = 'md',
  full,
  className = '',
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'dark',
  size = 'md',
  full,
  className = '',
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
