import { LICENSE_BODIES, SPDX_URLS } from './licenses.js';

const HEADER = `NOTICE

Elements - NVIDIA Elements Design System
Copyright 2024-2026 NVIDIA Corporation
`;

const EMPTY_BODY = `This product does not include any bundled third-party software.
`;

const SEPARATOR = '='.repeat(78);

const DEPS_INTRO_PROJECT = 'This project includes the following bundled third-party software:';
const DEPS_INTRO_ROOT = 'This product includes the following bundled third-party software:';

function byNameCI(a, b) {
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

function bySpdxCI(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function renderSummaryDep(dep, usedBy) {
  const usedByPart = usedBy && usedBy.length > 0 ? ` (used by: ${usedBy.join(', ')})` : '';
  return `- ${dep.name} v${dep.version} [${dep.license}]${usedByPart}
  Copyright: ${dep.copyright}`;
}

function renderSummaryAsset(asset) {
  const urlPart = asset.url ? ` (${asset.url})` : '';
  return `- ${asset.name} [${asset.license}]${urlPart}
  Copyright: ${asset.copyright}`;
}

function renderLicenseEntry(entry) {
  if (entry.version) {
    return `${entry.name} v${entry.version} - Copyright ${entry.copyright}`;
  }
  return `${entry.name} - Copyright ${entry.copyright}`;
}

function groupByLicense(entries) {
  const groups = new Map();
  for (const entry of entries) {
    if (!groups.has(entry.license)) groups.set(entry.license, []);
    groups.get(entry.license).push(entry);
  }
  return groups;
}

function renderLicenseSections(groups) {
  const licenses = [...groups.keys()].sort(bySpdxCI);
  const sections = [];
  for (const license of licenses) {
    const body = LICENSE_BODIES[license];
    if (!body) {
      const names = groups
        .get(license)
        .map(e => e.name)
        .join(', ');
      throw new Error(
        `No license body registered for SPDX "${license}" (needed for: ${names}). Add it to notice/licenses.js or simplify the SPDX expression.`
      );
    }
    const entries = groups.get(license).slice().sort(byNameCI);
    const lines = entries.map(renderLicenseEntry).join('\n');
    sections.push(`${SEPARATOR}
${license}
${SEPARATOR}

The following bundled components are provided under the ${license} license:

${lines}

${body}`);
  }
  return sections.join('\n\n');
}

function renderFooter(licenses) {
  if (licenses.length === 0) return '';
  const ordered = [...new Set(licenses)].sort(bySpdxCI);
  const parts = ordered.filter(l => SPDX_URLS[l]).map(l => `${l}: ${SPDX_URLS[l]}`);
  if (parts.length === 0) return '';
  return `For license details, see: ${parts.join(', ')}\n`;
}

export function renderProjectNotice({ deps, assets }) {
  const sortedDeps = deps.slice().sort(byNameCI);

  if (sortedDeps.length === 0 && !assets) {
    return `${HEADER}\n${EMPTY_BODY}`;
  }

  const summaryParts = [];
  if (sortedDeps.length > 0) {
    summaryParts.push(DEPS_INTRO_PROJECT);
    summaryParts.push('');
    summaryParts.push(sortedDeps.map(d => renderSummaryDep(d, null)).join('\n\n'));
  }
  if (assets) {
    if (summaryParts.length > 0) summaryParts.push('');
    summaryParts.push(assets.header);
    summaryParts.push('');
    summaryParts.push(assets.entries.map(renderSummaryAsset).join('\n\n'));
  }

  const licenseEntries = [...sortedDeps, ...(assets ? assets.entries.map(e => ({ ...e, version: null })) : [])];
  const groups = groupByLicense(licenseEntries);
  const licenseSections = renderLicenseSections(groups);
  const footer = renderFooter(licenseEntries.map(e => e.license));

  return `${HEADER}
${summaryParts.join('\n')}

${licenseSections}

${footer}`;
}

export function renderRootNotice(entries) {
  const sorted = entries.slice().sort((a, b) => byNameCI(a.dep, b.dep));

  if (sorted.length === 0) {
    return `${HEADER}\n${EMPTY_BODY}`;
  }

  const summary = sorted.map(e => renderSummaryDep(e.dep, e.usedBy)).join('\n\n');
  const groups = groupByLicense(sorted.map(e => e.dep));
  const licenseSections = renderLicenseSections(groups);
  const footer = renderFooter(sorted.map(e => e.dep.license));

  return `${HEADER}
${DEPS_INTRO_ROOT}

${summary}

${licenseSections}

${footer}`;
}
