type Props = { src: string; title: string; poster?: string };
export function VideoPlayer({ src, title, poster }: Props) {
  return (
    <figure className="overflow-hidden rounded-lg border shadow-sm">
      <video
        controls
        poster={poster}
        className="aspect-video w-full bg-black"
        aria-label={title}
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
      <figcaption className="p-3 text-sm text-muted-foreground">{title}</figcaption>
    </figure>
  );
}
