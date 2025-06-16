import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 50, height = 50, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/be-fest-client-logo.png"
        alt="Be Fest Logo"
        width={width}
        height={height}
        className="object-contain"
      />
    </div>
  );
}
