import { readFileSync } from 'node:fs';
import { renderBaseHead, IS_MR_PREVIEW, IS_DEV_MODE } from './_11ty/layouts/common.js';
import { svgLogosShortcode } from './_11ty/shortcodes/svg-logos.js';

const BASE_HEAD = renderBaseHead({ title: 'Elements', disableTheme: true });
const styles = readFileSync(new URL('./index.css', import.meta.url), 'utf-8');

export function render() {
  return /* html */ `
<!doctype html>
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    ${BASE_HEAD}
    <!-- IS_MR_PREVIEW: ${IS_MR_PREVIEW}, IS_DEV_MODE: ${IS_DEV_MODE} -->
    <!-- eslint-disable @html-eslint/use-baseline -->
    <link
      rel="preload"
      href="https://cdn-prod.nvidia.com/assets/elements/hero/nv-wave-avif.avif"
      fetchpriority="high"
      as="image" />
    <link
      rel="preload"
      href="https://cdn-prod.nvidia.com/assets/elements/hero/voxels-avif.avif"
      fetchpriority="high"
      as="image" />
    <!-- eslint-enable @html-eslint/use-baseline -->
    <style>${styles}</style>
    <script type="module">
      import './index.ts';
    </script>
  </head>

  <body>
    <nve-page>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm"></nve-logo>
        <a slot="prefix" href=".">Elements</a>
        <nve-button container="flat">
          <a href="docs/about/getting-started/">Catalog</a>
        </nve-button>
        <nve-button container="flat">
          <a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a>
        </nve-button>
        <nve-button container="flat">
          <a href="starters/" target="_blank">Starters</a>
        </nve-button>
        <nve-button container="flat">
          <a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a>
        </nve-button>
      </nve-page-header>

      <main>
        <!-- Hero Section -->
        <section id="hero">
          <img
            aria-hidden="true"
            class="background"
            src="https://cdn-prod.nvidia.com/assets/elements/hero/nv-wave-avif.avif"
            alt="NVIDIA Background"
            role="presentation" />
          <div class="content full">
            <div class="layout">
              <div id="hero-text" nve-layout="column gap:xl align:vertical-center">
                <span nve-text="display xl semibold emphasis">
                  Build faster, together<br />
                  <span>with</span> <span class="lime-green-gradient gradient-txt">Elements.</span>
                </span>
                <span nve-text="regular heading lg default relaxed">
                  NVIDIA Elements is a flexible, framework-agnostic design system and toolkit that empowers teams to
                  build exceptional user experiences.
                </span>
                <nve-button size="lg">
                  <a href="docs/about/getting-started/">Get Started</a>
                </nve-button>
              </div>
              <nvd-animated-build></nvd-animated-build>
            </div>
          </div>
        </section>

        <!-- Section : Ideas to Reality -->
        <section>
          <nvd-starry-sky class="background" style="opacity:70%"></nvd-starry-sky>

          <div class="content" nve-layout="column align:center gap:xxl">
            <div nve-text="semibold display center">
              <span class="silver-gradient gradient-txt">Turn your ideas</span>
              <span class="fuchsia-lavender-gradient gradient-txt">into reality</span>
              <br />
              <span class="silver-gradient gradient-txt">at the speed of light.</span>
            </div>

            <div nve-layout="column &lg|row  gap:lg">
              <div nve-layout="row gap:lg" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="shapes"></nve-icon>
                </nve-logo>

                <div class="feature-text horizontal" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Buildless Prototyping</div>
                  <div nve-text="muted md regular relaxed">
                    No complicated setup. Just start building and iterating. No handoff, no translation.
                  </div>
                </div>
              </div>

              <div nve-layout="row gap:lg" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="scissors"></nve-icon>
                </nve-logo>

                <div class="feature-text horizontal" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Snippet Templates</div>
                  <div nve-text="muted md regular relaxed">
                    Autocomplete common UX patterns without worrying about breaking changes.
                  </div>
                </div>
              </div>

              <div nve-layout="row gap:lg" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="refresh"></nve-icon>
                </nve-logo>

                <div class="feature-text horizontal" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Infinite Remixes</div>
                  <div nve-text="muted md regular relaxed">
                    Experiment, pivot, and explore—Elements makes iteration low-cost and easy.
                  </div>
                </div>
              </div>
            </div>
            <!-- /* TODO: orange and blue layers should be relative size */ -->

            <div class="video-container">
              <div class="glint"></div>
              <div class="glimmer"></div>
              <video loop muted preload="none">
                <source
                  src="https://cdn-prod.nvidia.com/assets/elements/screencast/browse-pattern-snippets-dark.webm"
                  type="video/webm"
                  loading="lazy"
                  decoding="async" />
                Your browser does not support the video tag or WebM format.
              </video>
            </div>
          </div>
        </section>

        ${svgLogosShortcode()}
        <!-- Section : Work -->
        <section id="works-for-you">
          <div class="radial-gradient-overlay"></div>
          <div class="gradient-line"></div>
          <div class="content work" nve-layout="column gap:xxl align:center">
            <div nve-text="semibold display center">
              <span class="silver-gradient gradient-txt">Work the way</span>
              <br />
              <span class="silver-gradient gradient-txt">that works</span>
              <span class="lime-green-gradient gradient-txt">for you.</span>
            </div>

            <div nve-layout="column &lg|row align:space-between gap:lg">
              <div nve-layout="row gap:lg" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="terminal"></nve-icon>
                </nve-logo>
                <div class="feature-text horizontal" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Any Framework or Language</div>
                  <div nve-text="muted md regular relaxed">
                    Learn once, use anywhere. Build mastery that transfers across tools.
                  </div>
                </div>
              </div>

              <div nve-layout="row gap:lg" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="cursor-ripples"></nve-icon>
                </nve-logo>
                <div class="feature-text horizontal" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Flexible by Nature</div>
                  <div nve-text="muted md regular relaxed">
                    Stateless and adaptable to integrate into your existing apps seamlessly.
                  </div>
                </div>
              </div>

              <div nve-layout="row gap:lg" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="clock"></nve-icon>
                </nve-logo>
                <div class="feature-text horizontal" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Future Proof</div>
                  <div nve-text="muted md regular relaxed">
                    Built on web standards, ensuring long term stability without framework churn.
                  </div>
                </div>
              </div>
            </div>

            <div nve-layout="column &xl|row align:center gap:xl" style="align-items: center">
              <nvd-framework-selector></nvd-framework-selector>
              <div class="codeblock-container">
                <nve-codeblock style="width: 494px; height: 516px; font-size: 12px;" language="html"></nve-codeblock>
              </div>
            </div>
          </div>
        </section>

        <!-- Section : Built Exceptional -->
        <section id="metrics" class="grid-box-container">
          <div class="background grid-box-bg"></div>
          <div class="content leading" nve-layout="column align:center">
            <div nve-layout="column gap:lg">
              <div nve-text="semibold display md">
                <span class="silver-gradient gradient-txt">Built to be</span>
                <span class="lime-cyan-gradient gradient-txt">exceptional</span>
                <br />
                <span class="silver-gradient gradient-txt">right out of the box.</span>
              </div>
              <div nve-text="muted md regular relaxed">
                Elements is accessible, standards-compliant, and optimized for performance from day one.
              </div>
              <div nve-layout="column gap:lg">
                <div class="feature-grid">
                  <div class="feature-grid-item gradient-card" nve-layout="row gap:md align:vertical-center">
                    <nve-icon name="expand-details" size="lg"></nve-icon>
                    <div nve-text="label semibold md">WCAG 2.1</div>
                  </div>
                  <div class="feature-grid-item gradient-card" nve-layout="row gap:md align:vertical-center">
                    <nve-icon name="expand-details" size="lg"></nve-icon>
                    <div nve-text="label semibold md">WAI-ARIA 1.3</div>
                  </div>
                  <div class="feature-grid-item gradient-card" nve-layout="row gap:md align:vertical-center">
                    <nve-icon name="keyboard" size="lg"></nve-icon>
                    <div nve-text="label semibold md">Keyboard navigation</div>
                  </div>
                  <div class="feature-grid-item gradient-card" nve-layout="row gap:md align:vertical-center">
                    <nve-icon name="flag" size="lg"></nve-icon>
                    <div nve-text="label semibold md">Internationalization</div>
                  </div>
                  <div class="feature-grid-item gradient-card" nve-layout="row gap:md align:vertical-center">
                    <nve-icon name="meter" size="lg"></nve-icon>
                    <div nve-text="label semibold md">Lighthouse Tested</div>
                  </div>
                  <div class="feature-grid-item gradient-card" nve-layout="row gap:md align:vertical-center">
                    <nve-icon name="pulse" size="lg"></nve-icon>
                    <div nve-text="label semibold md">Axe Accessibility Tested</div>
                  </div>
                </div>

                <nve-button container="inline" size="lg">
                  <a href="./docs/api-design/" target="_blank">
                    Learn more about our Best Practices
                    <nve-icon name="arrow" direction="right"></nve-icon>
                  </a>
                </nve-button>
              </div>
            </div>
          </div>
          <div class="content trailing escaping" nve-layout="column align:center align:horizontal-stretch pad-x:xxs">
            <nvd-metrics-carousel></nvd-metrics-carousel>
          </div>
        </section>

        <!-- Section : Customize -->
        <section>
          <div class="background" style="background: var(--nve-sys-layer-shell-accent-background)"></div>
          <div class="content trailing" nve-layout="column gap:xxl align:center align:horizontal-stretch">
            <div nve-layout="column gap:lg">
              <div nve-text="semibold display md">
                <span class="silver-gradient gradient-txt">Ready to use.</span>
                <br />
                <span class="silver-gradient gradient-txt">Easy to</span>
                <span class="blue-purple-gradient gradient-txt">customize.</span>
              </div>
              <div nve-text="muted md regular relaxed">
                Whether you're helping build self driving cars, an AI supercomputer or the next generation gaming
                platform, our design tokens and customization lets you create the best experience for your users.
              </div>
            </div>
            <nvd-theme-form></nvd-theme-form>
            <div>
              <nve-button container="inline" size="lg">
                <a
                  href="https://NVIDIA.github.io/elements/docs/foundations/themes/"
                  target="_blank">
                  Learn more about our Theming features
                  <nve-icon name="arrow" direction="right"></nve-icon>
                </a>
              </nve-button>
            </div>
          </div>
          <div class="content leading escaping" nve-layout="column align:center" style="padding: 0;">
            <nvd-theme-preview></nvd-theme-preview>
          </div>
        </section>

        <!-- Section : Design with Markup -->
        <section>
          <div class="content" nve-layout="column align:center align:horizontal-stretch gap:xxl">
            <div nve-layout="column &lg|row gap:lg">
              <div nve-layout="column gap:lg" class="feature">
                <div nve-text="semibold display">
                  <span class="coral-yellow-gradient gradient-txt">Design directly</span>
                  <br />
                  <span class="silver-gradient gradient-txt">in markup.</span>
                </div>

                <div nve-text="muted md regular relaxed">
                  Our attribute system makes it easier to compose your design right in HTML—so you can build faster and
                  more efficiently.
                </div>

                <nve-button container="inline" size="lg">
                  <a href="./docs/foundations/layout/" target="_blank">
                    Learn more about our attribute system
                    <nve-icon name="arrow" direction="right"></nve-icon>
                  </a>
                </nve-button>
              </div>

              <div nve-layout="row &lg|column gap:lg pad-top:md" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="typography"></nve-icon>
                </nve-logo>
                <div class="feature-text vertical" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Typography</div>
                  <div nve-text="muted md regular relaxed">
                    Apply consistent typographic styles with simple nve-text attributes
                  </div>
                </div>
              </div>

              <div nve-layout="row &lg|column gap:lg pad-top:md" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="outline"></nve-icon>
                </nve-logo>
                <div class="feature-text vertical" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Layout</div>
                  <div nve-text="muted md regular relaxed">
                    Achieve grid, horizontal, and vertical layouts with simple nve-layout attributes
                  </div>
                </div>
              </div>

              <div nve-layout="row &lg|column gap:lg pad-top:md" class="feature">
                <nve-logo class="feature-icon" color="gray-slate">
                  <nve-icon name="laptop-phone"></nve-icon>
                </nve-logo>
                <div class="feature-text vertical" nve-layout="column gap:sm">
                  <div nve-text="emphasis heading medium">Responsiveness</div>
                  <div nve-text="muted md regular relaxed">
                    Designed for a range of devices and screen densities without extra work
                  </div>
                </div>
              </div>
            </div>
            <div class="video-container">
              <div class="glint orange"></div>
              <div class="glimmer orange"></div>
              <video loop muted preload="none">
                <source
                  loading="lazy"
                  decoding="async"
                  src="https://cdn-prod.nvidia.com/assets/elements/screencast/layout-typography-snippets-dark.webm" />
                Your browser does not support the video tag or WebM format.
              </video>
            </div>
          </div>
        </section>

        <!-- Section : Get Started -->
        <section id="starter">
          <div class="content" nve-layout="column gap:xxl align:center align:horizontal-stretch">
            <div nve-layout="column gap:lg">
              <div nve-text="semibold display">
                <span class="silver-gradient gradient-txt">From zero to running</span>
                <br />
                <span class="lime-green-gradient gradient-txt">in minutes.</span>
              </div>
              <div nve-text="muted md regular">
                No need to start from scratch. We've got starter projects—just clone, run, and start building.
              </div>
              <div nve-layout="column &sm|row gap:sm">
                <nve-button size="lg">
                  <a href="./docs/about/support/" target="_blank">View our community</a>
                </nve-button>
                <nve-button interaction="emphasis" size="lg">
                  <a href="./docs/about/getting-started/" target="_blank">Start building</a>
                </nve-button>
              </div>
            </div>

            <div nve-layout="grid gap:lg align-items:stretch span-items:12 &sm|span-items:6 &lg|span-items:4">
              <nvd-glassmorphic-card
                logo-src="/static/images/integrations/vite.svg"
                logo-alt="Vite Logo"
                title="MPA & Vite"
                style="--background: linear-gradient(135deg, rgba(144, 116, 240, 0.45) 0%, rgba(144, 116, 240, 0.15) 100%); --background-logo: url(/static/images/integrations/vite.svg)">
              </nvd-glassmorphic-card>

              <nvd-glassmorphic-card
                logo-src="/static/images/integrations/angular.svg"
                logo-alt="Angular Logo"
                title="Angular (v12+)"
                style="--background: linear-gradient(135deg, rgba(236, 72, 153, 0.45) 0%, rgba(236, 72, 153, 0.15) 100%); --background-logo: url(/static/images/integrations/angular.svg)">
              </nvd-glassmorphic-card>

              <nvd-glassmorphic-card
                logo-src="/static/images/integrations/nextjs.svg"
                logo-alt="Next.js Logo"
                title="Next.js (v15)"
                style="--background: linear-gradient(135deg, rgba(31, 31, 31, 0.45) 0%, rgba(144, 116, 240, 0.1) 100%); --background-logo: url(/static/images/integrations/nextjs.svg)">
              </nvd-glassmorphic-card>

              <nvd-glassmorphic-card
                logo-src="/static/images/integrations/react.svg"
                logo-alt="React Logo"
                title="React (v18/v19)"
                style="--background: linear-gradient(135deg, rgba(97, 218, 251, 0.45) 0%, rgba(144, 116, 240, 0.1) 100%); --background-logo: url(/static/images/integrations/react.svg)">
              </nvd-glassmorphic-card>

              <nvd-glassmorphic-card
                logo-src="/static/images/integrations/eleventy.svg"
                logo-alt="Eleventy Logo"
                title="Eleventy"
                style="--background: linear-gradient(135deg, rgba(125, 145, 190, 0.45) 0%, rgba(125, 145, 190, 0.15) 100%); --background-logo: url(/static/images/integrations/eleventy.svg)">
              </nvd-glassmorphic-card>

              <nvd-glassmorphic-card
                logo-src="/static/images/integrations/vue.svg"
                logo-alt="Vue.js Logo"
                title="Vue (v3)"
                style="--background: linear-gradient(135deg, rgba(65, 184, 131, 0.45) 0%, rgba(144, 116, 240, 0.1) 100%); --background-logo: url(https://NVIDIA.github.io/elements/static/images/integrations/vue.svg)">
              </nvd-glassmorphic-card>
            </div>
          </div>
        </section>

        <!-- Section : Loop -->
        <section id="loop">
          <div class="content" nve-layout="column align:center gap:xxl">
            <div nve-text="semibold emphasis display center">
              Stay in the
              <span class="amber-orange-gradient gradient-txt">Loop.</span>
            </div>
            <div nve-layout="column &md|row gap:lg">
              <div class="contact gradient-card" nve-layout="column gap:lg pad:lg align:space-between">
                <div nve-layout="row gap:md align:vertical-center">
                  <div>
                    <img
                      src="https://cdn-prod.nvidia.com/assets/elements/splash/gitlab-icon.svg"
                      alt="GitLab Logo"
                      style="width: 28px;height: 26px;" />
                  </div>
                  <div nve-text="heading medium md emphasis">Gitlab Repo</div>
                </div>
                <div nve-text="body medium md muted">Explore the code. Submit issues. Help shape what's next.</div>
                <nve-button container="inline">
                  <a href="https://github.com/NVIDIA/elements" target="_blank">
                    View
                    <nve-icon name="arrow" direction="right"></nve-icon>
                  </a>
                </nve-button>
              </div>
              <div class="contact gradient-card" nve-layout="column gap:lg pad:lg align:space-between">
                <div nve-layout="row gap:md align:vertical-center">
                  <div>
                    <img
                      src="https://cdn-prod.nvidia.com/assets/elements/splash/slack-icon-svg.svg"
                      alt="Slack Logo"
                      style="width: 28px;height: 28px;" />
                  </div>
                  <div nve-text="heading medium md emphasis">Slack Support</div>
                </div>
                <div nve-text="body medium md muted">Join the conversation. Get help, share ideas, and connect.</div>
                <nve-button container="inline">
                  <a href="http://nv/elements-slack" target="_blank">
                    View
                    <nve-icon name="arrow" direction="right"></nve-icon>
                  </a>
                </nve-button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </nve-page>
  </body>
</html>
  `;
}
