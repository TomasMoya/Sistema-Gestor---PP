import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";

export default function CalendarioPage() {
  return (
    <>
      <AppBar overline="Calendario" title="Calendario" />
      <div className="gp-empty">
        <span className="gp-empty__icon">
          <Icon name="calendar_month" size="lg" />
        </span>
        <p className="gp-empty__text">Próximamente.</p>
      </div>
    </>
  );
}
