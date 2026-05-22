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
      ? "bg-red-100 text-red-700"
      : priority === "medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}