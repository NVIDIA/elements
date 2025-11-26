import type { PackageDownload, ProjectTestSummary, Release } from '../types.js';

export interface ProjectsTestSummary {
  created: string;
  projects: Record<string, ProjectTestSummary>;
}

export interface ReleasesSummary {
  created: string;
  data: Release[];
}

export interface DownloadsSummary {
  created: string;
  packages: PackageDownload[];
  totalDownloads: number;
}
