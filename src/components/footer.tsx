import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 px-4 py-8 lg:px-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-base font-bold text-foreground">FitX Technologies Pvt. Ltd.</div>
          <p className="mt-2 text-xs">© 2026 FitX. All rights reserved.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-foreground/80">Contact</div>
          <a href="mailto:support@fitx.app" className="mt-2 inline-flex items-center gap-2 hover:text-foreground">
            <Mail className="size-3.5" /> support@fitx.app
          </a>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-foreground/80">Legal</div>
          <ul className="mt-2 space-y-1 text-xs">
            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
            <li><a href="#" className="hover:text-foreground">Cookies Policy</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-foreground/80">Follow us</div>
          <div className="mt-2 flex items-center gap-3">
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="size-4" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground"><Facebook className="size-4" /></a>
            <a href="#" aria-label="X (Twitter)" className="hover:text-foreground"><Twitter className="size-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
