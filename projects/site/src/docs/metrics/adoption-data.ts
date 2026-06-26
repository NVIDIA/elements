// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface PackageDownloadTrend {
  labels: string[];
  packages: {
    name: string;
    total: number;
    values: number[];
  }[];
}

export interface CdnVersionShareRow {
  name: string;
  latestVersion: string;
  latestVersionShare: number;
  latestVersionRequests: number;
  topVersion: string;
  topVersionShare: number;
  topNonLatestVersion: string;
  topNonLatestVersionShare: number;
  topNonLatestVersionRequests: number;
  otherVersionShare: number;
  otherVersionRequests: number;
  cdnRequests: number;
}

export interface ChannelMixPoint {
  x: number;
  y: number;
  name: string;
  status: string;
}

export interface ReleaseAdoptionTimeline {
  labels: string[];
  npmDownloads: number[];
  cdnRequests: number[];
  releaseMarkers: {
    date: string;
    label: string;
    value: number;
  }[];
}

interface AdoptionDailyCountLike {
  date: string;
  count: number;
}

interface AdoptionPackageLike {
  name: string;
  status: string;
  latestVersion: string | null;
  publishDates: {
    version: string;
    date: string;
  }[];
  npm: {
    total: number;
    daily: AdoptionDailyCountLike[];
  };
  cdn: {
    total: number;
    daily: AdoptionDailyCountLike[];
    versions: {
      version: string;
      total: number;
      share: number;
    }[];
    latestVersionShare: number;
    topVersion: {
      version: string;
      total?: number;
      share: number;
    } | null;
  };
}

interface AdoptionCdnVersionLike {
  version: string;
  total: number;
  share: number;
}

interface AdoptionSummaryLike {
  packages: AdoptionPackageLike[];
}

export function getPackageLabel(packageName: string): string {
  return packageName.replace('@nvidia-elements/', '');
}

function getSortedDates(packages: AdoptionPackageLike[]): string[] {
  return [
    ...new Set(
      packages.flatMap(packageData => [
        ...packageData.npm.daily.map(day => day.date),
        ...packageData.cdn.daily.map(day => day.date)
      ])
    )
  ].sort((a, b) => a.localeCompare(b));
}

function getDailyValue(packageData: AdoptionPackageLike, date: string, source: 'npm' | 'cdn'): number {
  const daily = source === 'npm' ? packageData.npm.daily : packageData.cdn.daily;
  return daily.find(day => day.date === date)?.count ?? 0;
}

function getLatestVersionData(
  packageData: AdoptionPackageLike,
  latestVersion: string
): AdoptionCdnVersionLike | undefined {
  return packageData.cdn.versions.find(version => version.version === latestVersion);
}

function getTopNonLatestVersionData(
  packageData: AdoptionPackageLike,
  latestVersion: string
): AdoptionCdnVersionLike | undefined {
  return packageData.cdn.versions
    .filter(version => version.version !== latestVersion)
    .reduce<
      AdoptionCdnVersionLike | undefined
    >((topVersion, version) => (!topVersion || version.total > topVersion.total ? version : topVersion), undefined);
}

function getLatestVersion(packageData: AdoptionPackageLike): string {
  return packageData.latestVersion ?? 'unavailable';
}

function getTopVersion(packageData: AdoptionPackageLike): string {
  return packageData.cdn.topVersion?.version ?? 'unavailable';
}

function getTopVersionShare(packageData: AdoptionPackageLike): number {
  return packageData.cdn.topVersion?.share ?? 0;
}

function getVersionName(versionData?: AdoptionCdnVersionLike): string {
  return versionData?.version ?? 'none';
}

function getVersionShare(versionData?: AdoptionCdnVersionLike): number {
  return versionData?.share ?? 0;
}

function getVersionTotal(versionData?: AdoptionCdnVersionLike): number {
  return versionData?.total ?? 0;
}

function getRoundedPercent(value: number): number {
  return Number(value.toFixed(2));
}

function getOtherVersionRequests(
  packageData: AdoptionPackageLike,
  latestRequests: number,
  topNonLatestRequests: number
): number {
  return Math.max(packageData.cdn.total - latestRequests - topNonLatestRequests, 0);
}

function getOtherVersionShare(
  packageData: AdoptionPackageLike,
  topNonLatestVersionData?: AdoptionCdnVersionLike
): number {
  return getRoundedPercent(
    Math.max(100 - packageData.cdn.latestVersionShare - getVersionShare(topNonLatestVersionData), 0)
  );
}

function getCdnVersionShareRow(packageData: AdoptionPackageLike): CdnVersionShareRow {
  const latestVersion = getLatestVersion(packageData);
  const latestVersionData = getLatestVersionData(packageData, latestVersion);
  const topNonLatestVersionData = getTopNonLatestVersionData(packageData, latestVersion);
  const latestVersionRequests = getVersionTotal(latestVersionData);
  const topNonLatestVersionRequests = getVersionTotal(topNonLatestVersionData);

  return {
    name: getPackageLabel(packageData.name),
    latestVersion,
    latestVersionShare: packageData.cdn.latestVersionShare,
    latestVersionRequests,
    topVersion: getTopVersion(packageData),
    topVersionShare: getTopVersionShare(packageData),
    topNonLatestVersion: getVersionName(topNonLatestVersionData),
    topNonLatestVersionShare: getVersionShare(topNonLatestVersionData),
    topNonLatestVersionRequests,
    otherVersionShare: getOtherVersionShare(packageData, topNonLatestVersionData),
    otherVersionRequests: getOtherVersionRequests(packageData, latestVersionRequests, topNonLatestVersionRequests),
    cdnRequests: packageData.cdn.total
  };
}

export function getPackageDownloadTrend(adoption: AdoptionSummaryLike): PackageDownloadTrend {
  const labels = getSortedDates(adoption.packages);
  const packages = adoption.packages
    .filter(packageData => packageData.npm.total > 0)
    .map(packageData => ({
      name: getPackageLabel(packageData.name),
      total: packageData.npm.total,
      values: labels.map(date => getDailyValue(packageData, date, 'npm'))
    }))
    .sort((a, b) => b.total - a.total);

  return {
    labels,
    packages
  };
}

export function getCdnVersionShareRows(adoption: AdoptionSummaryLike): CdnVersionShareRow[] {
  return adoption.packages
    .filter(packageData => packageData.cdn.total > 0)
    .map(getCdnVersionShareRow)
    .sort((a, b) => b.cdnRequests - a.cdnRequests);
}

export function getChannelMixPoints(adoption: AdoptionSummaryLike): ChannelMixPoint[] {
  return adoption.packages
    .map(packageData => ({
      x: packageData.npm.total,
      y: packageData.cdn.total,
      name: getPackageLabel(packageData.name),
      status: packageData.status
    }))
    .sort((a, b) => b.x + b.y - (a.x + a.y));
}

export function getReleaseAdoptionTimeline(adoption: AdoptionSummaryLike): ReleaseAdoptionTimeline {
  const labels = getSortedDates(adoption.packages);
  const npmDownloads = labels.map(date =>
    adoption.packages.reduce((total, packageData) => total + getDailyValue(packageData, date, 'npm'), 0)
  );
  const cdnRequests = labels.map(date =>
    adoption.packages.reduce((total, packageData) => total + getDailyValue(packageData, date, 'cdn'), 0)
  );
  const releaseMarkers = adoption.packages
    .flatMap(packageData =>
      packageData.publishDates.map(release => {
        const date = release.date.slice(0, 10);
        const value = Math.max(
          adoption.packages.reduce((total, currentPackage) => total + getDailyValue(currentPackage, date, 'npm'), 0),
          adoption.packages.reduce((total, currentPackage) => total + getDailyValue(currentPackage, date, 'cdn'), 0)
        );

        return {
          date,
          label: `${getPackageLabel(packageData.name)} ${release.version}`,
          value
        };
      })
    )
    .filter(marker => labels.includes(marker.date));

  return {
    labels,
    npmDownloads,
    cdnRequests,
    releaseMarkers
  };
}
