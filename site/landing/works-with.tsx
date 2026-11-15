import { WORKS_WITH_CLIENTS } from '@site/data/client-list.ts';
import { BrandIcon } from '@site/icons/brand-icons.tsx';

export const WorksWith = () => (
  <div class="wrap works reveal">
    <span class="lbl">Works with any MCP client, including</span>
    <div class="clients">
      {WORKS_WITH_CLIENTS.map((client) => (
        <span>
          <BrandIcon brand={client.brand} size={18} />
          {client.name}
        </span>
      ))}
    </div>
  </div>
);
