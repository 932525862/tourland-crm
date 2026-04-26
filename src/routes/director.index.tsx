import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState, updateDirector } from "@/lib/store";
import { toast } from "sonner";
import { User, Save } from "lucide-react";

export const Route = createFileRoute("/director/")({
  component: DirectorProfile,
});

function DirectorProfile() {
  const { state, update } = useAppState();
  const [name, setName] = useState(state.director.name);
  const [login, setLogin] = useState(state.director.login);
  const [password, setPassword] = useState(state.director.password);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !login.trim() || !password.trim()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    update((s) => updateDirector(s, { name: name.trim(), login: login.trim(), password }));
    toast.success("Ma'lumotlar saqlandi");
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground mt-1">O'z ma'lumotlaringizni tahrirlang</p>
      </header>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground shadow-[var(--shadow-md)]">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{state.director.name}</h2>
            <p className="text-sm text-muted-foreground">Direktor</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Ism</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Parol</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--gradient-primary)] text-primary-foreground font-medium shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)] transition-all"
          >
            <Save className="w-4 h-4" /> Saqlash
          </button>
        </form>
      </div>
    </div>
  );
}
