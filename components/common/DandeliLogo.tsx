import Image from 'next/image';

interface DandeliLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'emerald';
  showSlogan?: boolean;
}

export function DandeliLogo({
  size = 'md',
  variant = 'dark',
  showSlogan = false,
}: DandeliLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base font-extrabold tracking-tight',
    md: 'text-xl font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
  };

  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-xs`}>
        <Image
          src="/assets/aistudio/2b41b9ea-0a38-4e30-bbf8-d99be3cc8381_848fa95f.png"
          alt="DANDELI Logo"
          fill
          className="object-contain"
          referrerPolicy="no-referrer"
          priority
        />
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`${textSizes[size]} ${
              isLight ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}
          >
            DANDELI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-2"></span>
        </div>
        {showSlogan && (
          <span
            className={`text-[10px] font-medium tracking-wide ${
              isLight ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            Mudah Bergerak, Mudah Mengantar
          </span>
        )}
      </div>
    </div>
  );
}
