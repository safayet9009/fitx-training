import { Modal } from "./ui-kit";

export function VideoModal({
  open, onClose, youtubeId, title, info,
}: {
  open: boolean;
  onClose: () => void;
  youtubeId: string;
  title: string;
  info?: { muscle?: string; difficulty?: string; reps?: string; calories?: number }[];
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
          {open && (
            <iframe
              className="absolute inset-0 size-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={title}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        {info && info.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {info.flatMap((row, i) =>
              Object.entries(row).map(([k, v]) => (
                <div key={`${i}-${k}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                  <div className="mt-0.5 text-sm font-semibold capitalize">{String(v)}</div>
                </div>
              )),
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
