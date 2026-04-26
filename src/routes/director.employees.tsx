import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState, addEmployee, updateEmployee, deleteEmployee } from "@/lib/store";
import { toast } from "sonner";
import { UserPlus, Pencil, Trash2, X, Phone, User as UserIcon } from "lucide-react";
import type { Employee } from "@/lib/types";

export const Route = createFileRoute("/director/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const { state, update } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  return (
    <div className="p-6 md:p-10">
      <header className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hodimlar</h1>
          <p className="text-muted-foreground mt-1">
            Jami: {state.employees.length} ta hodim
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--gradient-primary)] text-primary-foreground font-medium shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)] transition-all"
        >
          <UserPlus className="w-4 h-4" /> Yangi hodim
        </button>
      </header>

      {state.employees.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Hali hodim qo'shilmagan</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {state.employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-card border border-border rounded-xl p-4 md:p-5 flex items-center gap-4 hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 grid sm:grid-cols-3 gap-2">
                <div>
                  <p className="font-semibold text-foreground truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {emp.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Login</p>
                  <p className="text-sm font-mono text-foreground truncate">{emp.login}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parol</p>
                  <p className="text-sm font-mono text-foreground truncate">{emp.password}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setEditing(emp); setShowForm(true); }}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Tahrirlash"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`${emp.firstName}ni o'chirishni tasdiqlaysizmi?`)) {
                      update((s) => deleteEmployee(s, emp.id));
                      toast.success("Hodim o'chirildi");
                    }
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EmployeeFormDialog
          employee={editing}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            if (editing) {
              update((s) => updateEmployee(s, editing.id, data));
              toast.success("Hodim ma'lumotlari yangilandi");
            } else {
              update((s) => addEmployee(s, data));
              toast.success("Yangi hodim qo'shildi");
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function EmployeeFormDialog({
  employee,
  onClose,
  onSave,
}: {
  employee: Employee | null;
  onClose: () => void;
  onSave: (data: Omit<Employee, "id" | "createdAt">) => void;
}) {
  const [firstName, setFirstName] = useState(employee?.firstName ?? "");
  const [lastName, setLastName] = useState(employee?.lastName ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [login, setLogin] = useState(employee?.login ?? "");
  const [password, setPassword] = useState(employee?.password ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !login.trim() || !password.trim()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    onSave({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), login: login.trim(), password });
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-lg)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {employee ? "Hodimni tahrirlash" : "Yangi hodim qo'shish"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Ism</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Familya</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Tel raqam</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Login</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Parol</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
              Bekor qilish
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--gradient-primary)] text-primary-foreground font-medium shadow-[var(--shadow-md)]">
              {employee ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
