type CoursePriorityBadgeProps = {
  priority: "high" | "medium" | "low";
  label: string;
};

export default function CoursePriorityBadge({
  priority,
  label,
}: CoursePriorityBadgeProps) {
  const className =
    priority === "high"
      ? "bg-badge-high text-badge-high-txt"
      : priority === "medium"
        ? "bg-badge-medium text-badge-medium-txt"
        : "bg-badge-low text-badge-low-txt";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium mt-2 ${className}`}
    >
      {label}
    </span>
  );
}