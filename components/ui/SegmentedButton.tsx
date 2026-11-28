import { Icon } from "./Icon";

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedButtonProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

/** Botón segmentado M3 (2 a 4 opciones, selección única). La opción activa muestra `check`. */
export function SegmentedButton({ options, value, onChange, ariaLabel }: SegmentedButtonProps) {
  return (
    <div className="gp-seg" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button key={option.value} type="button" aria-pressed={active} onClick={() => onChange(option.value)}>
            {active && <Icon name="check" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
