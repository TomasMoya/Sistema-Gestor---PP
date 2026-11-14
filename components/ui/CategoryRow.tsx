import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

interface CategoryRowProps {
  name: string;
  icon: string;
  colorVar: string; // ej. "var(--cat-home)"
  amount: number;
  share: number; // 0–1
  onClick?: () => void;
}

export function CategoryRow({ name, icon, colorVar, amount, share, onClick }: CategoryRowProps) {
  return (
    <li className={cn("gp-item", onClick && "gp-item--link")} onClick={onClick}>
      <span className="gp-item__lead gp-cat__lead" style={{ background: colorVar }}>
        <Icon name={icon} />
      </span>
      <div className="gp-item__body">
        <div className="gp-item__title">{name}</div>
        <ProgressBar thin value={share} color={colorVar} label={`${name}: ${formatPercent(share)} del gasto del mes`} className="gp-cat__bar" />
      </div>
      <div className="gp-item__trail">
        <div>
          <div className="gp-cat__amount gp-num">{formatCurrency(amount)}</div>
          <div className="gp-cat__pct gp-num">{formatPercent(share)}</div>
        </div>
      </div>
    </li>
  );
}
