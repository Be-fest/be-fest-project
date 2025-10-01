import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  theme?: 'client' | 'provider';
}

export function Logo({ width = 50, height = 50, className = '', theme = 'client' }: LogoProps) {
  const logoSrc = theme === 'provider' ? '/be-fest-provider-logo.png' : '/be-fest-client-logo.png';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src={logoSrc}
        alt="Be Fest Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
}
