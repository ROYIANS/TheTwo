import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonTone = "primary" | "ghost" | "danger" | "quiet" | "icon" | "plain";
export type ButtonSize = "small" | "medium" | "large" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    tone,
    size,
    fullWidth = false,
    type = "button",
    ...props
  },
  ref,
) {
  const resolvedTone = tone ?? inferButtonTone(className);
  const resolvedSize = size ?? (resolvedTone === "icon" ? "icon" : "medium");
  const classes = resolvedTone === "plain"
    ? ["app-button-plain", className]
    : ["app-button", `app-button-${resolvedTone}`, `app-button-${resolvedSize}`, fullWidth && "app-button-full", className];

  return (
    <button
      ref={ref}
      type={type}
      className={classes.filter(Boolean).join(" ")}
      data-button-tone={resolvedTone}
      {...props}
    />
  );
});

function inferButtonTone(className: string | undefined): ButtonTone {
  const classes = className ?? "";
  if (/agent-scrim|object-node|evidence-object|start-choice|opportunity-list-main|comparison-opportunity-head|profile-direction-link/.test(classes)) return "plain";
  if (/button-primary|landing-nav-enter|landing-primary-action|export-package|record-application/.test(classes)) return "primary";
  if (/button-quiet|decision-package-link|intake-example/.test(classes)) return "quiet";
  if (/icon-button/.test(classes)) return "icon";
  return "ghost";
}
