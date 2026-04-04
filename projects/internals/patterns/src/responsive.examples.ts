// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Patterns/Responsive',
  component: 'nve-patterns'
};

/**
 * @summary Responsive tabs pattern using container queries to collapse overflow tabs into a menu.
 */
export const CollapsibleTabs = {
  render: () => html`
    <style>
      .demo-section {
        overflow: hidden;
        container-type: inline-size;
        resize: both;
        border: 1px solid #ccc;
        width: 500px;
        padding: 12px;
        margin-bottom: 24px;
      }

      .demo-section nve-tabs-item:last-child {
        display: none;
      }

      @container (max-width: 350px) {
        .demo-section nve-tabs-item:nth-child(n+4):not(:last-child) {
          display: none;
        }
        
        .demo-section nve-tabs-item:last-child {
          display: block;
        }
      }
    </style>

    <div class="demo-section">
      <nve-tabs behavior-select>
        <nve-tabs-item selected>Tab 1</nve-tabs-item>
        <nve-tabs-item>Tab 2</nve-tabs-item>
        <nve-tabs-item>Tab 3</nve-tabs-item>
        <nve-tabs-item>Tab 4</nve-tabs-item>
        <nve-tabs-item>Tab 5</nve-tabs-item>
        <nve-tabs-item>Tab 6</nve-tabs-item>
        <nve-tabs-item popovertarget="more-tabs">
          <nve-icon name="more-actions"></nve-icon>
        </nve-tabs-item>
      </nve-tabs>

      <nve-dropdown id="more-tabs">
        <nve-menu>
          <nve-menu-item>Tab 4</nve-menu-item>
          <nve-menu-item>Tab 5</nve-menu-item>
          <nve-menu-item>Tab 6</nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </div>
  `
};

/**
 * @summary Responsive toolbar pattern using container queries to collapse actions into overflow menu.
 */
export const CollapsibleToolbar = {
  render: () => html`
    <style>
      .demo-section {
        overflow: hidden;
        container-type: inline-size;
        resize: both;
        border: 1px solid #ccc;
        width: 600px;
        padding: 12px;
        margin-bottom: 24px;
      }

      .demo-section [slot="suffix"]:last-child {
        display: none;
      }

      @container (max-width: 450px) {
        .demo-section [slot="suffix"]:nth-child(n+3):not(:last-child) {
          display: none;
        }

        .demo-section [slot="suffix"]:last-child {
          display: block;
        }
      }
    </style>

    <div class="demo-section">
      <nve-toolbar>
        <nve-search>
          <input type="search" placeholder="Search..." aria-label="search" />
        </nve-search>
        
        <nve-button container="flat" slot="suffix">
          <nve-icon name="filter"></nve-icon> Filter
        </nve-button>
        <nve-button container="flat" slot="suffix">
          <nve-icon name="sort-ascending"></nve-icon> Sort
        </nve-button>
        <nve-button container="flat" slot="suffix">
          <nve-icon name="download"></nve-icon> Export
        </nve-button>
        <nve-icon-button container="flat" slot="suffix" icon-name="gear" aria-label="Settings"></nve-icon-button>
        <nve-icon-button container="flat" slot="suffix" icon-name="more-actions" aria-label="More actions" popovertarget="toolbar-more-actions"></nve-icon-button>
      </nve-toolbar>

      <nve-dropdown id="toolbar-more-actions">
        <nve-menu>
          <nve-menu-item>
            <nve-icon name="download"></nve-icon> Export
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="gear"></nve-icon> Settings
          </nve-menu-item>
        </nve-menu>
      </nve-dropdown>
    </div>
  `
};