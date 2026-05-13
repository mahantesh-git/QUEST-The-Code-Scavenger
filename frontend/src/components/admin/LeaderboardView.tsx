import { useState } from 'react';
import { Download, Send, Loader2 } from 'lucide-react';
import { Leaderboard } from '@/components/Leaderboard';
import { adminDownloadMainReport, adminPostDiscordReport } from '@/lib/api';
import { useAdminToast } from '@/contexts/AdminToastContext';

interface LeaderboardViewProps {
  token: string;
}

export function LeaderboardView({ token }: LeaderboardViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const { showToast } = useAdminToast();

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await adminDownloadMainReport(token);
      showToast('Excel report downloaded.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Download failed', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDiscord = async () => {
    if (isPosting) return;
    setIsPosting(true);
    try {
      await adminPostDiscordReport(token);
      showToast('Standings posted to Discord.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Discord post failed', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="h-full relative overflow-hidden glass-morphism rounded-none border-0">
      <div className="absolute inset-0 z-0">
        <Leaderboard />
      </div>

      {/* Action Bar — top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          id="btn-download-report"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest bg-black/70 border border-white/10 hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5 text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Download Excel Report"
        >
          {isDownloading
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Download className="w-3 h-3" />}
          <span>Export_.xlsx</span>
        </button>

        <button
          id="btn-discord-report"
          onClick={handleDiscord}
          disabled={isPosting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest bg-black/70 border border-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)]/70 hover:text-[var(--color-accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Post standings to Discord"
        >
          {isPosting
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Send className="w-3 h-3" />}
          <span>Post_Discord</span>
        </button>
      </div>

      {/* Sync status badge — bottom right */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
        <div className="px-4 py-2 glass-morphism border-r-2 border-[var(--color-accent)] text-right">
          <div className="text-[8px] font-mono text-white/70 uppercase tracking-[0.2em]">Sync_Status</div>
          <div className="text-[10px] font-mono text-[var(--color-accent)] uppercase tracking-[0.3em]">Link_Established</div>
        </div>
      </div>
    </div>
  );
}
