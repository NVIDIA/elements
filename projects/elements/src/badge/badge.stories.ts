import { html } from 'lit';
import '@elements/elements/badge/define.js';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Badge/Examples',
  component: 'mlv-badge',
};

export const Default = {
  render: () => html`
  <mlv-badge>badge</mlv-badge>
  `
};

export const Status = {
  render: () => html`
<div mlv-layout="row gap:xs align:wrap">
  <mlv-badge status="scheduled">scheduled</mlv-badge>
  <mlv-badge status="queued">queued</mlv-badge>
  <mlv-badge status="pending">pending</mlv-badge>
  <mlv-badge status="starting">starting</mlv-badge>
  <mlv-badge status="running">running</mlv-badge>
  <mlv-badge status="restarting">restarting</mlv-badge>
  <mlv-badge status="stopping">stopping</mlv-badge>
  <mlv-badge status="finished">finished</mlv-badge>
  <mlv-badge status="failed">failed</mlv-badge>
  <mlv-badge status="unknown">unknown</mlv-badge>
  <mlv-badge status="ignored">ignored</mlv-badge>
</div>
  `
}

export const StatusFlat = {
  render: () => html`
<div mlv-layout="row gap:md align:wrap">
  <mlv-badge container="flat" status="scheduled">scheduled</mlv-badge>
  <mlv-badge container="flat" status="queued">queued</mlv-badge>
  <mlv-badge container="flat" status="pending">pending</mlv-badge>
  <mlv-badge container="flat" status="starting">starting</mlv-badge>
  <mlv-badge container="flat" status="running">running</mlv-badge>
  <mlv-badge container="flat" status="restarting">restarting</mlv-badge>
  <mlv-badge container="flat" status="stopping">stopping</mlv-badge>
  <mlv-badge container="flat" status="finished">finished</mlv-badge>
  <mlv-badge container="flat" status="failed">failed</mlv-badge>
  <mlv-badge container="flat" status="unknown">unknown</mlv-badge>
  <mlv-badge container="flat" status="ignored">ignored</mlv-badge>
</div>
  `
}

export const StatusIcon = {
  render: () => html`
<div mlv-layout="row gap:md align:wrap">
  <mlv-badge container="flat" status="scheduled" aria-label="scheduled"></mlv-badge>
  <mlv-badge container="flat" status="queued" aria-label="queued"></mlv-badge>
  <mlv-badge container="flat" status="pending" aria-label="pending"></mlv-badge>
  <mlv-badge container="flat" status="starting" aria-label="starting"></mlv-badge>
  <mlv-badge container="flat" status="running" aria-label="running"></mlv-badge>
  <mlv-badge container="flat" status="restarting" aria-label="restarting"></mlv-badge>
  <mlv-badge container="flat" status="stopping" aria-label="stopping"></mlv-badge>
  <mlv-badge container="flat" status="finished" aria-label="finished"></mlv-badge>
  <mlv-badge container="flat" status="failed" aria-label="failed"></mlv-badge>
  <mlv-badge container="flat" status="unknown" aria-label="unknown"></mlv-badge>
  <mlv-badge container="flat" status="ignored" aria-label="ignored"></mlv-badge>
</div>
  `
}

export const Support = {
  render: () => html`
<div mlv-layout="row gap:md">
  <mlv-badge status="accent">accent</mlv-badge>
  <mlv-badge status="warning">warning</mlv-badge>
  <mlv-badge status="success">success</mlv-badge>
  <mlv-badge status="danger">danger</mlv-badge>
</div>
  `
}

export const StatusLightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-badge status="scheduled">scheduled</mlv-badge>
  <mlv-badge status="queued">queued</mlv-badge>
  <mlv-badge status="pending">pending</mlv-badge>
  <mlv-badge status="starting">starting</mlv-badge>
  <mlv-badge status="running">running</mlv-badge>
  <mlv-badge status="restarting">restarting</mlv-badge>
  <mlv-badge status="stopping">stopping</mlv-badge>
  <mlv-badge status="finished">finished</mlv-badge>
  <mlv-badge status="failed">failed</mlv-badge>
  <mlv-badge status="unknown">unknown</mlv-badge>
  <mlv-badge status="ignored">ignored</mlv-badge>
</div>
  `
}

export const StatusDarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:md pad:md align:wrap">
  <mlv-badge status="scheduled">scheduled</mlv-badge>
  <mlv-badge status="queued">queued</mlv-badge>
  <mlv-badge status="pending">pending</mlv-badge>
  <mlv-badge status="starting">starting</mlv-badge>
  <mlv-badge status="running">running</mlv-badge>
  <mlv-badge status="restarting">restarting</mlv-badge>
  <mlv-badge status="stopping">stopping</mlv-badge>
  <mlv-badge status="finished">finished</mlv-badge>
  <mlv-badge status="failed">failed</mlv-badge>
  <mlv-badge status="unknown">unknown</mlv-badge>
  <mlv-badge status="ignored">ignored</mlv-badge>
</div>
  `
}

export const Trend = {
  render: () => html`
<div mlv-layout="row gap:md">
  <mlv-badge status="trend-neutral">+15%</mlv-badge>
  <mlv-badge status="trend-up">+15%</mlv-badge>
  <mlv-badge status="trend-down">-15%</mlv-badge>
</div>
  `
}

export const Color = {
  render: () => html`
<div mlv-layout="row gap:sm align:wrap">
  <mlv-badge color="red-cardinal"><mlv-icon name="placeholder"></mlv-icon> red-cardinal</mlv-badge>
  <mlv-badge color="gray-slate"><mlv-icon name="placeholder"></mlv-icon> gray-slate</mlv-badge>
  <mlv-badge color="gray-denim"><mlv-icon name="placeholder"></mlv-icon> gray-denim</mlv-badge>
  <mlv-badge color="blue-indigo"><mlv-icon name="placeholder"></mlv-icon> blue-indigo</mlv-badge>
  <mlv-badge color="blue-cobalt"><mlv-icon name="placeholder"></mlv-icon> blue-cobalt</mlv-badge>
  <mlv-badge color="blue-sky"><mlv-icon name="placeholder"></mlv-icon> blue-sky</mlv-badge>
  <mlv-badge color="teal-cyan"><mlv-icon name="placeholder"></mlv-icon> teal-cyan</mlv-badge>
  <mlv-badge color="green-mint"><mlv-icon name="placeholder"></mlv-icon> green-mint</mlv-badge>
  <mlv-badge color="teal-seafoam"><mlv-icon name="placeholder"></mlv-icon> teal-seafoam</mlv-badge>
  <mlv-badge color="green-grass"><mlv-icon name="placeholder"></mlv-icon> green-grass</mlv-badge>
  <mlv-badge color="yellow-amber"><mlv-icon name="placeholder"></mlv-icon> yellow-amber</mlv-badge>
  <mlv-badge color="orange-pumpkin"><mlv-icon name="placeholder"></mlv-icon> orange-pumpkin</mlv-badge>
  <mlv-badge color="red-tomato"><mlv-icon name="placeholder"></mlv-icon> red-tomato</mlv-badge>
  <mlv-badge color="pink-magenta"><mlv-icon name="placeholder"></mlv-icon> pink-magenta</mlv-badge>
  <mlv-badge color="purple-plum"><mlv-icon name="placeholder"></mlv-icon> purple-plum</mlv-badge>
  <mlv-badge color="purple-violet"><mlv-icon name="placeholder"></mlv-icon> purple-violet</mlv-badge>
  <mlv-badge color="purple-lavender"><mlv-icon name="placeholder"></mlv-icon> purple-lavender</mlv-badge>
  <mlv-badge color="pink-rose"><mlv-icon name="placeholder"></mlv-icon> pink-rose</mlv-badge>
  <mlv-badge color="green-jade"><mlv-icon name="placeholder"></mlv-icon> green-jade</mlv-badge>
  <mlv-badge color="lime-pear"><mlv-icon name="placeholder"></mlv-icon> lime-pear</mlv-badge>
  <mlv-badge color="yellow-nova"><mlv-icon name="placeholder"></mlv-icon> yellow-nova</mlv-badge>
  <mlv-badge color="brand-green"><mlv-icon name="placeholder"></mlv-icon> brand-green</mlv-badge>
</div>
  `
};

export const Prominence = {
  render: () => html`
<div mlv-layout="row gap:sm align:wrap">
  <mlv-badge prominence="emphasis" color="red-cardinal"><mlv-icon name="placeholder"></mlv-icon> red-cardinal</mlv-badge>
  <mlv-badge prominence="emphasis" color="gray-slate"><mlv-icon name="placeholder"></mlv-icon> gray-slate</mlv-badge>
  <mlv-badge prominence="emphasis" color="gray-denim"><mlv-icon name="placeholder"></mlv-icon> gray-denim</mlv-badge>
  <mlv-badge prominence="emphasis" color="blue-indigo"><mlv-icon name="placeholder"></mlv-icon> blue-indigo</mlv-badge>
  <mlv-badge prominence="emphasis" color="blue-cobalt"><mlv-icon name="placeholder"></mlv-icon> blue-cobalt</mlv-badge>
  <mlv-badge prominence="emphasis" color="blue-sky"><mlv-icon name="placeholder"></mlv-icon> blue-sky</mlv-badge>
  <mlv-badge prominence="emphasis" color="teal-cyan"><mlv-icon name="placeholder"></mlv-icon> teal-cyan</mlv-badge>
  <mlv-badge prominence="emphasis" color="green-mint"><mlv-icon name="placeholder"></mlv-icon> green-mint</mlv-badge>
  <mlv-badge prominence="emphasis" color="teal-seafoam"><mlv-icon name="placeholder"></mlv-icon> teal-seafoam</mlv-badge>
  <mlv-badge prominence="emphasis" color="green-grass"><mlv-icon name="placeholder"></mlv-icon> green-grass</mlv-badge>
  <mlv-badge prominence="emphasis" color="yellow-amber"><mlv-icon name="placeholder"></mlv-icon> yellow-amber</mlv-badge>
  <mlv-badge prominence="emphasis" color="orange-pumpkin"><mlv-icon name="placeholder"></mlv-icon> orange-pumpkin</mlv-badge>
  <mlv-badge prominence="emphasis" color="red-tomato"><mlv-icon name="placeholder"></mlv-icon> red-tomato</mlv-badge>
  <mlv-badge prominence="emphasis" color="pink-magenta"><mlv-icon name="placeholder"></mlv-icon> pink-magenta</mlv-badge>
  <mlv-badge prominence="emphasis" color="purple-plum"><mlv-icon name="placeholder"></mlv-icon> purple-plum</mlv-badge>
  <mlv-badge prominence="emphasis" color="purple-violet"><mlv-icon name="placeholder"></mlv-icon> purple-violet</mlv-badge>
  <mlv-badge prominence="emphasis" color="purple-lavender"><mlv-icon name="placeholder"></mlv-icon> purple-lavender</mlv-badge>
  <mlv-badge prominence="emphasis" color="pink-rose"><mlv-icon name="placeholder"></mlv-icon> pink-rose</mlv-badge>
  <mlv-badge prominence="emphasis" color="green-jade"><mlv-icon name="placeholder"></mlv-icon> green-jade</mlv-badge>
  <mlv-badge prominence="emphasis" color="lime-pear"><mlv-icon name="placeholder"></mlv-icon> lime-pear</mlv-badge>
  <mlv-badge prominence="emphasis" color="yellow-nova"><mlv-icon name="placeholder"></mlv-icon> yellow-nova</mlv-badge>
  <mlv-badge prominence="emphasis" color="brand-green"><mlv-icon name="placeholder"></mlv-icon> brand-green</mlv-badge>
</div>
  `
};

export const Flat = {
  render: () => html`
<div mlv-layout="row gap:sm align:wrap">
  <mlv-badge container="flat" color="red-cardinal"><mlv-icon name="placeholder"></mlv-icon> red-cardinal</mlv-badge>
  <mlv-badge container="flat" color="gray-slate"><mlv-icon name="placeholder"></mlv-icon> gray-slate</mlv-badge>
  <mlv-badge container="flat" color="gray-denim"><mlv-icon name="placeholder"></mlv-icon> gray-denim</mlv-badge>
  <mlv-badge container="flat" color="blue-indigo"><mlv-icon name="placeholder"></mlv-icon> blue-indigo</mlv-badge>
  <mlv-badge container="flat" color="blue-cobalt"><mlv-icon name="placeholder"></mlv-icon> blue-cobalt</mlv-badge>
  <mlv-badge container="flat" color="blue-sky"><mlv-icon name="placeholder"></mlv-icon> blue-sky</mlv-badge>
  <mlv-badge container="flat" color="teal-cyan"><mlv-icon name="placeholder"></mlv-icon> teal-cyan</mlv-badge>
  <mlv-badge container="flat" color="green-mint"><mlv-icon name="placeholder"></mlv-icon> green-mint</mlv-badge>
  <mlv-badge container="flat" color="teal-seafoam"><mlv-icon name="placeholder"></mlv-icon> teal-seafoam</mlv-badge>
  <mlv-badge container="flat" color="green-grass"><mlv-icon name="placeholder"></mlv-icon> green-grass</mlv-badge>
  <mlv-badge container="flat" color="yellow-amber"><mlv-icon name="placeholder"></mlv-icon> yellow-amber</mlv-badge>
  <mlv-badge container="flat" color="orange-pumpkin"><mlv-icon name="placeholder"></mlv-icon> orange-pumpkin</mlv-badge>
  <mlv-badge container="flat" color="red-tomato"><mlv-icon name="placeholder"></mlv-icon> red-tomato</mlv-badge>
  <mlv-badge container="flat" color="pink-magenta"><mlv-icon name="placeholder"></mlv-icon> pink-magenta</mlv-badge>
  <mlv-badge container="flat" color="purple-plum"><mlv-icon name="placeholder"></mlv-icon> purple-plum</mlv-badge>
  <mlv-badge container="flat" color="purple-violet"><mlv-icon name="placeholder"></mlv-icon> purple-violet</mlv-badge>
  <mlv-badge container="flat" color="purple-lavender"><mlv-icon name="placeholder"></mlv-icon> purple-lavender</mlv-badge>
  <mlv-badge container="flat" color="pink-rose"><mlv-icon name="placeholder"></mlv-icon> pink-rose</mlv-badge>
  <mlv-badge container="flat" color="green-jade"><mlv-icon name="placeholder"></mlv-icon> green-jade</mlv-badge>
  <mlv-badge container="flat" color="lime-pear"><mlv-icon name="placeholder"></mlv-icon> lime-pear</mlv-badge>
  <mlv-badge container="flat" color="yellow-nova"><mlv-icon name="placeholder"></mlv-icon> yellow-nova</mlv-badge>
  <mlv-badge container="flat" color="brand-green"><mlv-icon name="placeholder"></mlv-icon> brand-green</mlv-badge>
</div>
  `
};

export const Overflow = {
  render: () => html`
  <mlv-badge status="pending" style="--width: 150px">some really long content</mlv-badge>
  `
};
