// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

/**
 * This is your JavaScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module.
 */

// Import JavaScript modules
import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';

const MODULE_ID = 'pf2e-mobile-sheet';

/**
 * @param {boolean} force
 * @param {*} args
 */
function log(force, ...args) {
  try {
    const isDebugging = game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID);

    if (force || isDebugging) {
      console.log(MODULE_ID, '|', ...args);
    }
  } catch (e) {
    /* empty */
  }
}

function getDebug() {
  return game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID);
}

// Initialize module
Hooks.once('init', async () => {
  log(true, 'pf2e-mobile-sheet | Initializing pf2e-mobile-sheet');

  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

const isMobile = navigator.userAgentData.mobile;
Hooks.once('init', async function () {
  if (!isMobile) return;
  const styleSheet = document.createElement('style');
  styleSheet.innerText = `
.mobile-pf2e #ui-right #sidebar {
  width: ${window.innerWidth}px;
}`;
  document.head.appendChild(styleSheet);
});

Hooks.once('ready', async function () {
  if (!isMobile && !getDebug()) return;
  $('body').addClass('mobile-pf2e');
  $('.taskbar-workspaces, .taskbar-docking-container, .taskbar, .simple-calendar').remove();
  $('#ui-bottom, tokenbar').remove();
});
Hooks.on('renderChatLog', async function () {
  if (!isMobile && !getDebug()) return;
  const sendButton = $(
    `<div class="dorako-ui"><button type="button" class="send-button"><i class="fas fa-paper-plane"/></button></div>`,
  );
  sendButton.on('click', () => {
    document
      .querySelector('#chat-message')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' }));
  });
  $('#chat-form').append(sendButton);
  log(false, 'Add Send Button');
});

Hooks.on('renderCharacterSheetPF2e', (_, html) => {
  if (!isMobile && !getDebug()) return;
  html.css('width', '');
  html.css('height', '');
  html.css('top', 0);
  html.css('left', 0);
  html.find('.skills-list h6').text('Mods');
  const profRanks = html.find('.skills-list select').children();
  profRanks.eq(0).text('Untr');
  profRanks.eq(1).text('Train');
  profRanks.eq(2).text('Exp');
  profRanks.eq(3).text('Mstr');
  profRanks.eq(4).text('Leg');
  const combatRanks = html.find('.combat-list select').children();
  combatRanks.eq(0).text('Untr');
  combatRanks.eq(1).text('Train');
  combatRanks.eq(2).text('Exp');
  combatRanks.eq(3).text('Mstr');
  combatRanks.eq(4).text('Leg');

  const sidebarTabButton = $(
    `<a class="item" id="sidebar-tab" data-tab="sidebar" title="Sidebar"><i class="fa-solid fa-address-card"></i></a>`,
  );
  const afterButton = html.find('.sheet-navigation .navigation-title');
  if (html.find('.sheet-navigation #sidebar-tab').length === 0) sidebarTabButton.insertAfter(afterButton);
  const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
  const aside = html.find('aside');
  aside.css('background-image', 'none');
  aside.detach().appendTo(sidebarTab);
  if (html.find('.sheet-content .tab.sidebar').length === 0) html.find('.sheet-content').append(sidebarTab);
});

Hooks.once('devModeReady', async ({ registerPackageDebugFlag }) => {
  await registerPackageDebugFlag(MODULE_ID);
});
