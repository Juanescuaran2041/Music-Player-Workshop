type Props = {
  label: string;
  size?: "sm" | "lg";
};

const sizes = {
  sm: "h-9 w-9 text-sm",
  lg: "h-24 w-24 text-3xl",
};

export default function Avatar({ label, size = "sm" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`bg-brand flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md shadow-slate-900/10 ${sizes[size]}`}
    >
      {label}
    </span>
  );
}
