import { html } from 'lit';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/steps/define.js';

export default {
  title: 'Patterns/Onboarding',
  component: 'nve-patterns'
};

/**
 * @summary Multi-step wizard layout with progress stepper for guided workflows. Use for onboarding flows, enrollment forms, or configuration processes where users complete sequential steps with clear progress tracking.
 * @tags pattern
 */
export const UserOnboardingWizard = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Robotics Ops</h2>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="column gap:lg pad:lg align:horizontal-stretch" style="max-width: 980px; min-height: 980px; margin: auto">
    <div nve-layout="row align:center pad-bottom:lg">
      <nve-steps>
        <nve-steps-item selected>Vehicle Info</nve-steps-item>
        <nve-steps-item>Sensor Suite</nve-steps-item>
        <nve-steps-item>Software Stack</nve-steps-item>
        <nve-steps-item>Safety Thresholds</nve-steps-item>
        <nve-steps-item>Flash Firmware</nve-steps-item>
      </nve-steps>
    </div>

    <h1 nve-text="heading lg">Vehicle Information</h1>
    
    <nve-card style="min-height: 300px; width: 100%;"></nve-card>

    <nve-card style="min-height: 300px; width: 100%; margin-bottom: 24px;"></nve-card>
  </main>

  <nve-page-panel slot="footer">
    <nve-page-panel-content>
      <div nve-layout="row align:space-between gap:md" style="max-width:860px;margin:auto">
        <nve-button id="btn-back" container="flat" disabled size="sm">Back</nve-button>
        <div nve-layout="row gap:sm align:vertical-center">
          <span id="step-indicator" nve-text="body sm muted">Step 1 of 5</span>
          <nve-button id="btn-next" interaction="emphasis" size="sm">Next</nve-button>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};

/**
 * @summary Multi-step wizard layout. Use for complex multi-step forms with validation, progress, and save checkpoints.
 * @tags pattern
 */
export const MultiStepFormWizard = {
  render: () => html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
    <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
  </nve-page-header>

  <main nve-layout="grid gap:lg pad:lg align:horizontal-stretch" style="max-width: 980px; min-height: 980px; margin: auto">
    <div nve-layout="span:1">
      <nve-steps vertical>
        <nve-steps-item selected>Robot Profile</nve-steps-item>
        <nve-steps-item>Perception Sensors</nve-steps-item>
        <nve-steps-item>Navigation Stack</nve-steps-item>
        <nve-steps-item>Safety Limits</nve-steps-item>
        <nve-steps-item>Deploy Runtime</nve-steps-item>
      </nve-steps>
    </div>
    <section nve-layout="span:9 column gap:lg">
      <h1 nve-text="heading lg">Deployment Setup</h1>
      
      <nve-card style="min-height: 300px; width: 100%;"></nve-card>
      <nve-card style="min-height: 300px; width: 100%;"></nve-card>
    </section>
  </main>

  <nve-page-panel slot="footer">
    <nve-page-panel-content>
      <div nve-layout="row align:space-between gap:md" style="max-width:860px;margin:auto">
        <nve-button id="btn-back" container="flat" disabled size="sm">Previous</nve-button>
        <div nve-layout="row gap:sm align:vertical-center">
          <span id="step-indicator" nve-text="body sm muted">Stage 1 of 5</span>
          <nve-button id="btn-next" interaction="emphasis" size="sm">Continue</nve-button>
        </div>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
</nve-page>
  `
};
