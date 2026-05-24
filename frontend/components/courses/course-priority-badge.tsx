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
      ? "bg-red-900/70 text-red-300/80"
      : priority === "medium"
        ? "bg-yellow-900/70 text-yellow-300/80"
        : "bg-green-900/70 text-green-300/80";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}