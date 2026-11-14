import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="gp-field">
      <label className="gp-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
