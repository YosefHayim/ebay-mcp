import type { ToolCatalog } from '../../scripts/buildToolCatalog.ts';

interface FactsRowProps {
  catalog: ToolCatalog;
}

export const FactsRow = ({ catalog }: FactsRowProps) => {
  const facts = [
    { figure: String(catalog.toolCount), label: 'typed tools' },
    { figure: String(catalog.familyCount), label: 'tool families' },
    { figure: '2', label: 'transports: STDIO and local HTTP' },
    { figure: 'MIT', label: 'license, free to use and fork' },
  ];

  return (
    <section class="wrap section">
      <div class="facts reveal">
        {facts.map((fact) => (
          <div key={fact.label} class="fact">
            <div class="v">{fact.figure}</div>
            <div class="l">{fact.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
