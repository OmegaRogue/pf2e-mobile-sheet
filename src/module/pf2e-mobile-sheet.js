import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
// import { SettingsMenuPF2e as game } from "foundry-pf2e/src/module/system/settings/menu.js";

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
  // if (!isMobile) return;
});

Hooks.once('ready', async function () {
  if (!isMobile && !getDebug()) return;
  const body = $('body');
  body.addClass('mobile-pf2e');
  if (game.modules.get('pathfinder-ui')?.active) body.addClass('pf2e-ui');
  $('.taskbar-workspaces, .taskbar-docking-container, .taskbar, .simple-calendar').remove();
  $('#ui-bottom, tokenbar').remove();
  const collapseButton = $('#sidebar .collapse > i');
  collapseButton.removeClass('fa-caret-left');
  collapseButton.removeClass('fa-caret-right');
  collapseButton.addClass('fa-bars');
  $('#sidebar > nav#sidebar-tabs > a.collapse').prependTo($('#sidebar-tabs'));
});
Hooks.on('renderChatLog', async function () {
  if (!isMobile && !getDebug()) return;
  const sendButton = $(`<button type="button" class="button send-button"><i class="fas fa-paper-plane"/></button>`);
  sendButton.on('click', () => {
    document
      .querySelector('#chat-message')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' }));
  });
  $('#chat-form').append(sendButton);
  log(false, 'Add Send Button');
});

async function dragEndFullscreenWindow() {
  const wind = $('.fullscreen-window');
  wind.css('width', '');
  wind.css('height', '');
  wind.css('top', '');
  wind.css('left', '');
}

async function renderFullscreenWindow(app, html) {
  if (!isMobile && !getDebug()) return;
  if (!html.hasClass('window-app') || html.hasClass('dialog')) {
    log(false, app.id, html.classList);
    return;
  }
  html.addClass('fullscreen-window');
  html.css('width', '');
  html.css('height', '');
  html.css('top', '');
  html.css('left', '');
  const header = html.find('header');
  header.removeClass('draggable');
  header.removeClass('resizable');
}

Hooks.on('renderActorSheet', renderFullscreenWindow);
Hooks.on('renderApplication', renderFullscreenWindow);
Hooks.on('dragEndActorSheet', dragEndFullscreenWindow);
Hooks.on('dragEndApplication', dragEndFullscreenWindow);
Hooks.on('setAppScaleEvent', dragEndFullscreenWindow);

Hooks.on('renderCharacterSheetPF2e', (_, html) => {
  if (!isMobile && !getDebug()) return;
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
    `<a class="item" id="sidebar-tab" data-tab="sidebar" title="Sidebar"><i class="fa-solid fa-bars"></i></a>`,
  );
  const afterButton = html.find('.sheet-navigation .navigation-title');
  if (html.find('.sheet-navigation #sidebar-tab').length === 0) sidebarTabButton.insertAfter(afterButton);
  const sidebarTab = $(`<div class="tab sidebar" data-group="primary" data-tab="sidebar"/>`);
  const aside = html.find('aside');
  aside.css('background-image', 'none');
  aside.find('.logo').remove();
  aside.detach().appendTo(sidebarTab);
  if (html.find('.sheet-content .tab.sidebar').length === 0) html.find('.sheet-content').append(sidebarTab);
});

Hooks.once('devModeReady', async ({ registerPackageDebugFlag }) => {
  await registerPackageDebugFlag(MODULE_ID);
  getDebug();
});

Hooks.on('collapseSidebar', (_, collapsed) => {
  const sidebar = $('#sidebar');
  const collapseButton = sidebar.find('.collapse > i');
  if (collapsed) {
    collapseButton.removeClass('fa-caret-left');
    //collapseButton.addClass('fa-caret-left');
  } else {
    collapseButton.removeClass('fa-caret-right');
    //collapseButton.addClass('fa-caret-left');
  }
});
