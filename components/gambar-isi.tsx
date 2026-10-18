import Image from "next/image";

export function GambarIsi({
  src,
  sizes,
  priority = false,
  className = "object-cover",
  alt = "",
}: {
  src: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  alt?: string;
}) {
  return <Image src={src} alt={alt} fill sizes={sizes} preload={priority} loading={priority ? "eager" : "lazy"} className={className} />;
}
