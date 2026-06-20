"use client";

export type TabType =
  | "staff"
  | "clients"
  | "appointments"
  | "calendar";

interface NavbarTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

const tabs: {
  label: string;
  value: TabType;
}[] = [
  {
    label: "Staff",
    value: "staff",
  },
  {
    label: "Clients",
    value: "clients",
  },
  {
    label: "Appointments",
    value: "appointments",
  },
  {
    label: "Calendar",
    value: "calendar",
  },
];

export default function NavbarTabs({
  activeTab,
  onChange,
}: NavbarTabsProps) {
  return (
    <div className="mb-6 flex gap-4 border-b pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() =>
            onChange(tab.value)
          }
          className={`
            rounded-[14px]
            px-5
            py-3
            transition-all
            ${
              activeTab === tab.value
                ? "bg-[#ff8a24] text-white"
                : "border border-[#d9d9d9] bg-white"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}