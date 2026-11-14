import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";

export default function HoyPage() {
  return (
    <>
      <AppBar overline="Hoy" title="Hoy" />
      <div className="gp-empty">
        <span className="gp-empty__icon">
          <Icon name="today" size="lg" />
        </span>
        <p className="gp-empty__text">Próximamente.</p>
      </div>
    </>
  );
}
