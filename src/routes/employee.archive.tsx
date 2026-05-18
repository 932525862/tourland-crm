import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Archive, RefreshCw, Clock, Search, CheckSquare, Users, FileText, CalendarCheck } from "lucide-react";
import { API } from "@/lib/api/client";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/uz-latn";

export const Route = createFileRoute("/employee/archive")({
  component: EmployeeArchive,
});

interface ActivityLog {
  id: string;
  actionType: string;
  details?: any;
  user?: { firstName: string; lastName: string };
  createdAt: string;
}

const CATEGORIES: { label: string; value: string; icon: React.ElementType }[] = [
  { label: "Barchasi", value: "ALL", icon: Archive },
  { label: "Vazifalar", value: "TASK", icon: CheckSquare },
  { label: "Mijozlar", value: "CLIENT", icon: Users },
  { label: "Formalar", value: "FORM", icon: FileText },
  { label: "Davomat", value: "ATTENDANCE", icon: CalendarCheck },
];

const ACTION_LABELS: Record<string, string> = {
  TASK_CREATED: "Vazifa yaratildi",
  TASK_STATUS_CHANGED: "Vazifa holati o'zgardi",
  TASK_VERIFIED: "Vazifa tasdiqlandi",
  TASK_REJECTED: "Vazifa rad etildi",
  TASK_INCOMPLETE: "Vazifa yakunlanmadi",
  PROFILE_UPDATED: "Profil yangilandi",
  CLIENT_CREATED: "Mijoz qo'shildi",
  CLIENT_UPDATED: "Mijoz yangilandi",
  CLIENT_NOTE_ADDED: "Izoh qo'shildi",
  CLIENT_PAYMENT_ADDED: "To'lov qo'shildi",
  CLIENT_SALE_UPDATED: "Sotuv yangilandi",
  FORM_CREATED: "Forma yaratildi",
  FORM_UPDATED: "Forma yangilandi",
  ATTENDANCE_CHECK_IN: "Kirishga belgilandi",
  ATTENDANCE_CHECK_OUT: "Chiqishga belgilandi",
};

const ACTION_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  TASK: { bg: "bg-primary/10", text: "text-primary", icon: CheckSquare },
  CLIENT: { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: Users },
  FORM: { bg: "bg-violet-500/10", text: "text-violet-500", icon: FileText },
  ATTENDANCE: { bg: "bg-amber-500/10", text: "text-amber-500", icon: CalendarCheck },
  DEFAULT: { bg: "bg-secondary", text: "text-muted-foreground", icon: Clock },
};

function getCategory(actionType: string) {
  if (actionType.startsWith("TASK")) return "TASK";
  if (actionType.startsWith("CLIENT")) return "CLIENT";
  if (actionType.startsWith("FORM")) return "FORM";
  if (actionType.startsWith("ATTENDANCE")) return "ATTENDANCE";
  return "DEFAULT";
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "todo": return "bg-secondary text-secondary-foreground border-border";
    case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "done": return "bg-success/15 text-success border-success/20";
    case "rejected": return "bg-destructive/15 text-destructive border-destructive/20";
    case "incomplete": return "bg-destructive/10 text-destructive grayscale opacity-70";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function EmployeeArchive() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await API.employeeArchive();
      setLogs(data);
    } catch {
      toast.error("Arxiv ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesCategory = category === "ALL" || getCategory(l.actionType) === category;
      const matchesSearch =
        !search ||
        ACTION_LABELS[l.actionType]?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.fullName?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [logs, category, search]);

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8 flex items-start justify-between flex-wrap gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Archive className="w-10 h-10 text-primary" /> Mening Arxivim
          </h1>
          <p className="text-muted-foreground mt-1.5 font-medium">
            Barcha bajargan harakatlaringiz tarixi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-52"
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-3 rounded-2xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {CATEGORIES.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              category === value
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {loading && logs.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-secondary/40 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-[40px] p-24 text-center">
          <div className="w-24 h-24 bg-secondary rounded-[32px] flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
            <Archive className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Harakatlar topilmadi</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Sizda hozircha hech qanday arxiv harakatlari yo'q.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const cat = getCategory(log.actionType);
            const style = ACTION_COLORS[cat] ?? ACTION_COLORS.DEFAULT;
            const IconComponent = style.icon;
            return (
              <div
                key={log.id}
                className="group bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center ${style.text} shrink-0 transition-colors`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-foreground">
                      {ACTION_LABELS[log.actionType] ?? log.actionType.replace(/_/g, " ")}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                      {CATEGORIES.find(c => c.value === cat)?.label ?? cat}
                    </span>
                  </div>

                  {log.details?.title && (
                    <p className="text-sm text-foreground/70 mb-1">"{log.details.title}"</p>
                  )}
                  {log.details?.fullName && (
                    <p className="text-sm text-foreground/70 mb-1">{log.details.fullName}</p>
                  )}
                  {log.details?.amount !== undefined && (
                    <p className="text-sm text-emerald-500 font-semibold mb-1">
                      +{log.details.amount.toLocaleString()} so'm
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {log.details?.oldStatus && (
                      <>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(log.details.oldStatus)}`}>
                          {log.details.oldStatus}
                        </span>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    {log.details?.newStatus && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(log.details.newStatus)}`}>
                        {log.details.newStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <div className="text-[10px] font-medium text-foreground">
                    {dayjs(log.createdAt).locale("uz-latn").format("DD MMM, HH:mm")}
                  </div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    Muvaffaqiyatli
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
