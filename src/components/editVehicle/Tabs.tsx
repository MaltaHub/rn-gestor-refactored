interface TabProps {
  active: string;
  onChange: (tab: string) => void;
  tabs: { key: string; label: string }[];
}

export function Tabs({ active, onChange, tabs }: TabProps) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              active === tab.key
                ? "border-red-500 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
