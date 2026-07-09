import Image from "next/image";
import { cn } from "@/shared/utils/cn";

const SIZE_CLASS = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
} as const;

const SIZE_PX = { sm: 32, md: 40, lg: 64, xl: 96 } as const;

interface AvatarProps {
  name: string;
  photoUrl: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

export function Avatar({ name, photoUrl, size = "md", className }: AvatarProps) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={SIZE_PX[size]}
        height={SIZE_PX[size]}
        className={cn(
          "shrink-0 rounded-full border border-line object-cover",
          SIZE_CLASS[size],
          className,
        )}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-strong",
        SIZE_CLASS[size],
        className,
      )}
    >
      {name.slice(0, 1)}
    </span>
  );
}
