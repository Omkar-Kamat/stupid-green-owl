interface IllustrationImageProps {
  src: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function IllustrationImage({
  src,
  width,
  height,
  className = "h-auto w-full",
  priority = false,
}: IllustrationImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      className={className}
      aria-hidden
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
