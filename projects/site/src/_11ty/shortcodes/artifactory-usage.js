export async function renderArtifactoryUsageShortcode() {
  return /* html */ `
<nve-alert status="warning">Enterprise environments requiring strong security posture and legal compliance, using a package manager and Artifactory is strongly recommended.</nve-alert>

### Security and Licensing Risks

When choosing between static bundles and build-time tooling with a package manager, it's important to consider security and legal compliance:

- **Automated Vulnerability Scanning**: NPM/PNPM and Artifactory provide built-in security scanning that detects known vulnerabilities in dependencies
- **Dependency Auditing**: Package managers track the complete dependency tree, making it easy to audit third-party libraries and identify versions used
- **License Compliance**: Automated license scanning helps compliance with legal requirements by flagging incompatible/restricted licenses
- **Update Management**: Centralized package management enables coordinated security updates, ensuring critical patches are applied consistently
- **Version Control**: Package lock files provide reproducible builds while keeping the actual library code out of source control

### Committing Third-Party Libraries to Source Control Risks

- **License Violations**: Manual license tracking is error-prone and may result in using libraries with incompatible or restricted licenses, creating legal liability
- **Hidden Vulnerabilities**: Without automated scanning, security vulnerabilities in committed libraries may go undetected until they're exploited
- **Stale Dependencies**: Committed libraries are often not updated regularly, leaving projects exposed to known security issues
- **Audit Complexity**: Determining which third-party code is present, what versions are in use, and their license terms becomes a manual, time-consuming process
- **Repository Bloat**: Large binary files and library code increase repository size and slow down clone operations
<br /><br />
`;
}
