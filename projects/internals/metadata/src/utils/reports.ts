import type { PackageDownload, Project, ProjectTestSummary, Release } from '../types.js';

/**
 * @summary A summary of the metadata for all Elements projects.
 */
export interface MetadataSummary {
  created: string;
  projects: {
    '@nvidia-elements/core': Project;
    '@nvidia-elements/core-react': Project;
    '@nvidia-elements/styles': Project;
    '@nvidia-elements/testing': Project;
    '@nvidia-elements/themes': Project;
    '@nvidia-elements/behaviors-alpine': Project;
    '@nvidia-elements/brand': Project;
    '@nvidia-elements/code': Project;
    '@nvidia-elements/forms': Project;
    '@nvidia-elements/markdown': Project;
    '@nvidia-elements/playwright-screencast': Project;
    '@nvidia-elements/monaco': Project;
    '@internals/metadata': Project;
    '@internals/patterns': Project;
  };
}

export interface ProjectsTestSummary {
  created: string;
  projects: Record<string, ProjectTestSummary>;
}

export interface ReleasesSummary {
  created: string;
  releases: Release[];
}

export interface DownloadsReport {
  created: string;
  packages: PackageDownload[];
  totalDownloads: number;
}
