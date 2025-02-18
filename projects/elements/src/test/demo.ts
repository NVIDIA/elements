import { generateId } from '@nvidia-elements/core/internal';

export interface DemoItem {
  field1: { label: string; value: string };
  field2: { label: string; value: string | number };
  field3: { label: string; value: string | number };
  field4: { label: string; value: string | number };
  field5: { label: string; value: string | number };
}

/* default "infrastructure" */
function createItem(type: '' | 'models' | 'hardware' | 'system' = ''): DemoItem {
  const id = generateId().replace('_', '');
  const created = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(
    new Date(new Date(2020, 0, 1).getTime() + Math.random() * (new Date().getTime() - new Date(2012, 0, 1).getTime()))
  );

  if (type === 'models') {
    const status = ['finished', 'pending', 'running', 'queued'][Math.floor(Math.random() * 4)];
    const nodes = [1, 4, 16, 32][Math.floor(Math.random() * 4)];
    const model = ['GPT-2', 'BioBERT', 'PeopleNet', 'VehicleTypeNet', 'BioMegatron', 'FinMegatron'][
      Math.floor(Math.random() * 6)
    ];
    return {
      field1: { label: 'id', value: id },
      field2: { label: 'status', value: status },
      field3: { label: 'model', value: model },
      field4: { label: 'nodes', value: nodes },
      field5: { label: 'created', value: created }
    };
  } else if (type === 'hardware') {
    return [
      {
        field1: { label: 'id', value: id },
        field2: { label: 'model', value: '4090' },
        field3: { label: 'memory', value: '24gb' },
        field4: { label: 'cores', value: 16384 },
        field5: { label: 'created', value: created }
      },
      {
        field1: { label: 'id', value: id },
        field2: { label: 'model', value: '4080' },
        field3: { label: 'memory', value: '16gb' },
        field4: { label: 'cores', value: 9728 },
        field5: { label: 'created', value: created }
      },
      {
        field1: { label: 'id', value: id },
        field2: { label: 'model', value: '4070ti' },
        field3: { label: 'memory', value: '12gb' },
        field4: { label: 'cores', value: 7680 },
        field5: { label: 'created', value: created }
      },
      {
        field1: { label: 'id', value: id },
        field2: { label: 'model', value: '4070' },
        field3: { label: 'memory', value: '12gb' },
        field4: { label: 'cores', value: 5888 },
        field5: { label: 'created', value: created }
      },
      {
        field1: { label: 'id', value: id },
        field2: { label: 'model', value: '4060ti' },
        field3: { label: 'memory', value: '16gb' },
        field4: { label: 'cores', value: 4352 },
        field5: { label: 'created', value: created }
      },
      {
        field1: { label: 'id', value: id },
        field2: { label: 'model', value: '4060' },
        field3: { label: 'memory', value: '8gb' },
        field4: { label: 'cores', value: 3072 },
        field5: { label: 'created', value: created }
      }
    ][Math.floor(Math.random() * 6)];
  } else {
    // default "infrastructure"
    return {
      field1: { label: 'id', value: id },
      field2: { label: 'task', value: ['build', 'test', 'integration'][Math.floor(Math.random() * 3)] },
      field3: { label: 'status', value: ['finished', 'pending', 'running', 'queued'][Math.floor(Math.random() * 4)] },
      field4: { label: 'priority', value: ['p0', 'p1', 'p2'][Math.floor(Math.random() * 3)] },
      field5: { label: 'created', value: created }
    };
  }
}

// cache the result to reuse, this prevents storybook from getting stuck in render loops
// due to to trying to stablize the prior render to the current in React
const data = {
  '': {
    '10': Array(10)
      .fill('')
      .map(() => createItem('')) // infrastructure
  },
  models: {
    '10': Array(10)
      .fill('')
      .map(() => createItem('models'))
  },
  hardware: {
    '10': Array(10)
      .fill('')
      .map(() => createItem('hardware'))
  }
};

/**
 * demo data for stories only, provides a set of demo object that sync with the storybook data option
 */
export function getItems(rows = 10): DemoItem[] {
  const type = ((window as any).NVE_SB_GLOBALS?.dataTheme as '' | 'models' | 'hardware') ?? ''; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (data[type][rows]) {
    return [...data[type][rows]];
  } else {
    data[type][rows] = Array(rows)
      .fill('')
      .map(() => createItem(type));
    return [...data[type][rows]];
  }
}

/** demo data for datagrid stories only */
export function grid(rows = 9, columns = 4) {
  return {
    columns: Array(columns)
      .fill('')
      .map((_, i) => {
        return { id: `${i + 1}`, label: `Column ${i + 1}`, sort: 'none' };
      }),
    rows: Array(rows)
      .fill('')
      .map((_, ri) => {
        return {
          id: `${ri + 1}`,
          cells: Array(columns)
            .fill('')
            .map((_, ci) => {
              return { id: `${ci + 1}`, label: `Cell ${ri + 1}-${ci + 1}` };
            })
        };
      })
  };
}
