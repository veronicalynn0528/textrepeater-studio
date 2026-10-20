/* Regional GA4 consent. No account data, query strings or advertising consent. */
(function () {
  'use strict';
  if (window.SiteConsent) return;
  var required = 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH'.split(' ');
  var key = 'analytics_consent';
  var lifetime = 365 * 86400000;
  var config, choice = null, country = '', resolved = false, started = false, lastPage = '', panel, settings;
  var state = 'denied';
  var clarityStopped = false;
  function claritySafe(value) {
    try {
      var u = new URL(value || location.href, location.origin);
      if (!path(u.href) || u.search || u.hash) return false;
      if (!document.referrer) return true;
      var ref = new URL(document.referrer);
      return /^https?:$/.test(ref.protocol) && ref.pathname === '/' && !ref.search && !ref.hash && !ref.username && !ref.password;
    } catch (_) { return false; }
  }
  function stopClarity() {
    if (window.clarity) { window.clarity('consentv2', {analytics_Storage: 'denied', ad_Storage: 'denied'}); window.clarity('stop'); clarityStopped = true; }
  }
  var sessionChoice = null;
  var tag = function () {};
  function read() {
    try {
      var saved = JSON.parse(localStorage.getItem(key));
      if (saved && (saved.value === 'granted' || saved.value === 'denied') &&
          Number.isFinite(saved.expires) && saved.expires > Date.now() && saved.expires <= Date.now() + lifetime) return saved;
    } catch (_) { /* Storage is optional. */ }
    return null;
  }
  function legacy() {
    // Honor a previous opt-out, but never invent a date for an old opt-in.
    for (var i = 0; i < (config.legacyKeys || []).length; i++) {
      try {
        var raw = localStorage.getItem(config.legacyKeys[i]);
        if (!raw) continue;
        var value = raw, expires = 0;
        try { var parsed = JSON.parse(raw); value = parsed.choice || parsed.value || raw; expires = parsed.expires || 0; } catch (_) {}
        if (expires && (expires <= Date.now() || expires > Date.now() + lifetime)) { localStorage.removeItem(config.legacyKeys[i]); continue; }
        var denied = ['denied', 'declined', 'rejected', 'deny'].indexOf(value) >= 0;
        var granted = ['granted', 'accepted', 'allow'].indexOf(value) >= 0;
        if (denied || granted && expires) {
          var migrated = {value: denied ? 'denied' : 'granted', expires: expires || Date.now() + lifetime};
          localStorage.setItem(key, JSON.stringify(migrated));
          localStorage.removeItem(config.legacyKeys[i]);
          return migrated;
        }
      } catch (_) {}
    }
    return null;
  }
  function fields(value) {
    return {analytics_storage: value, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
  }
  function path(value) {
    try {
      var url = new URL(value || location.href, location.origin);
      if (url.origin !== location.origin) return null;
      var p = url.pathname.replace(/\/$/, '') || '/';
      if (config.publicPath) return config.publicPath(url.href);
      if (config.publicPaths) return config.publicPaths.indexOf(p) >= 0 ? p : null;
      if (/^\/(?:api|admin|settings|account|studio|checkout|orders?|pickup|download|sign-in|sign-up|reset-password|support)(?:\/|$)/.test(p)) return null;
      return p;
    } catch (_) { return null; }
  }
  function clearCookies() {
    for (var item of document.cookie.split(';')) {
      var name = item.trim().split('=')[0];
      if (!/^(_ga(?:_|$)|_gid$|_gat|_clck$|_clsk$)/.test(name)) continue;
      var parts = location.hostname.split('.');
      var domains = [''];
      for (var i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'), '.' + parts.slice(i).join('.'));
      for (var d of domains) document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (d ? '; Domain=' + d : '') + (location.protocol === 'https:' ? '; Secure' : '');
    }
  }
  function consent(value) {
    state = value;
    tag('consent', 'update', fields(value));
    if (value === 'denied') clearCookies();
    if (window.clarity) window.clarity('consentv2', {analytics_Storage: claritySafe() ? value : 'denied', ad_Storage: 'denied'});
    if (value === 'denied' || !claritySafe()) stopClarity();
  }
  function announce() {
    window.dispatchEvent(new CustomEvent('site-consent-change', {detail: {value: state, country: country, explicit: !!choice}}));
  }
  function safeContext(p) {
    var ref = '';
    try { ref = new URL(document.referrer).origin; } catch (_) {}
    return {page_location: location.origin + p, page_referrer: ref,
      page_title: config.pageTitle ? config.pageTitle(p) || '' : config.pageTitles && config.pageTitles[p] || document.title};
  }
  function addScript(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id; script.async = true; script.src = src;
    script.referrerPolicy = 'no-referrer';
    document.head.appendChild(script);
  }
  function page(value) {
    var p = path(value);
    if (config.onPage) { if (resolved) config.onPage(p, state); return; }
    window['ga-disable-' + config.id] = !p || state !== 'granted';
    if (!resolved || !p || !config.id || state !== 'granted') {
      lastPage = '';
      if (!p) stopClarity();
      if (panel && !p) render(false);
      return;
    }
    var context = safeContext(p);
    if (!started) {
      started = true;
      tag('js', new Date());
      tag('config', config.id, Object.assign({}, context, {
        send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_expires: lifetime / 1000, cookie_update: false
      }));
      addScript('regional-ga-loader', 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.id));
    }
    // Update safe context before Google's history listeners observe navigation.
    tag('set', context);
    if (lastPage !== p) {
      lastPage = p;
      tag('event', 'page_view', Object.assign({send_to: config.id}, context));
    }
    if (!claritySafe(value)) stopClarity();
    if (config.clarityId && state === 'granted' && claritySafe(value)) {
      if (!window.clarity) {
        var clarity = function () { (clarity.q = clarity.q || []).push(arguments); };
        window.clarity = clarity;
      }
      if (clarityStopped) { window.clarity('start'); clarityStopped = false; }
      window.clarity('consentv2', {analytics_Storage: 'granted', ad_Storage: 'denied'});
      addScript('regional-clarity-loader', 'https://www.clarity.ms/tag/' + encodeURIComponent(config.clarityId));
    }
  }
  function effective() {
    return choice ? choice.value : country && required.indexOf(country) < 0 ? 'granted' : 'denied';
  }
  function render(open) {
    if (!panel) return;
    panel.hidden = !open;
    var toggle = panel.querySelector('[data-analytics-toggle]');
    var optOutRegion = !!country && required.indexOf(country) < 0;
    panel.querySelector('[data-toggle-label]').hidden = !optOutRegion;
    panel.querySelectorAll('[data-choice]').forEach(function (button) { button.hidden = optOutRegion; });
    toggle.checked = state === 'granted';
    var status = panel.querySelector('[data-consent-status]');
    if (status) status.textContent = 'Analytics is ' + (state === 'granted' ? 'on.' : 'off.');
    document.documentElement.style.setProperty('--consent-bar-height', open ? panel.offsetHeight + 'px' : '0px');
  }
  function choose(value) {
    if (value !== 'granted' && value !== 'denied') return;
    sessionChoice = {value: value, expires: Date.now() + lifetime};
    choice = sessionChoice;
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch (_) {}
    consent(value);
    page(); announce();
    render(false);
    if (settings) settings.focus({preventScroll: true});
  }
  function ui() {
    if (panel) return;
    var style = document.createElement('link'); style.rel = 'stylesheet'; style.href = '/site-consent.css'; document.head.appendChild(style);
    panel = document.createElement('section');
    panel.id = 'regional-analytics-consent'; panel.className = 'site-consent';
    panel.setAttribute('aria-label', 'Analytics privacy settings');
    panel.hidden = true;
    panel.innerHTML = '<p><strong>Analytics privacy settings</strong></p><p data-consent-body>We use Google Analytics to understand site usage. Accept analytics?</p><p data-consent-status></p><label data-toggle-label hidden><input type="checkbox" data-analytics-toggle role="switch"> Allow analytics</label><div class="site-consent-actions"><button type="button" data-choice="granted">Accept</button><button type="button" data-choice="denied">Reject</button><a data-policy>Privacy policy</a></div>';
    if (config.clarityId || config.hasClarity) panel.querySelector('[data-consent-body]').textContent = 'We use Google Analytics to measure visits and Microsoft Clarity for page interactions and session recordings. Allow analytics?';
    panel.querySelector('[data-policy]').href = config.privacy || '/privacy';
    panel.querySelector('[data-analytics-toggle]').addEventListener('change', function (event) { choose(event.target.checked ? 'granted' : 'denied'); });
    panel.querySelectorAll('[data-choice]').forEach(function (button) { button.addEventListener('click', function () { choose(button.dataset.choice); }); });
    document.body.appendChild(panel);
    settings = document.querySelector('[data-privacy-settings]');
    if (!settings) {
      settings = document.createElement('button'); settings.type = 'button';
      settings.textContent = 'Privacy settings'; settings.setAttribute('data-privacy-settings', '');
      var footer = document.querySelector('footer');
      if (footer) footer.appendChild(settings); else { settings.className = 'site-consent-settings'; document.body.appendChild(settings); }
    }
    settings.addEventListener('click', function () { render(true); panel.querySelector(country && required.indexOf(country) < 0 ? '[data-analytics-toggle]' : 'button').focus(); });
    render(resolved && !!path() && !choice && (!country || required.indexOf(country) >= 0));
  }
  async function region() {
    if (typeof window.__REGION === 'string' && /^[A-Z]{2}$/.test(window.__REGION) && !/^(XX|T1|ZZ)$/.test(window.__REGION)) return window.__REGION;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 2500);
    try {
      var response = await fetch(config.regionEndpoint || '/cdn-cgi/trace', {cache: 'no-store', credentials: 'same-origin', signal: controller.signal});
      if (!response.ok) return '';
      // Static Vercel sites expose the hosting country through a same-origin redirect.
      var hint = new URL(response.url);
      var hintedCountry = hint.searchParams.get('country');
      if (hint.origin === location.origin && /^[A-Z]{2}$/.test(hintedCountry || '') && !/^(XX|T1|ZZ)$/.test(hintedCountry)) return hintedCountry;
      var text = await response.text();
      var match = text.match(/^loc=([A-Z]{2})$/m);
      if (match && !/^(XX|T1|ZZ)$/.test(match[1])) return match[1];
      try { var result = JSON.parse(text); if (/^[A-Z]{2}$/.test(result.country) && !/^(XX|T1|ZZ)$/.test(result.country)) return result.country; } catch (_) {}
    } catch (_) { /* Unknown geography stays denied. */ }
    finally { clearTimeout(timer); }
    return '';
  }
  function refresh() {
    var saved = sessionChoice && sessionChoice.expires > Date.now() ? sessionChoice : read();
    if (choice && !saved) { choice = null; sessionChoice = null; consent(effective()); page(); announce(); render(!!path() && (!country || required.indexOf(country) >= 0)); }
  }
  async function start(options) {
    if (config) return;
    if (!options || location.hostname !== options.host || !/^G-[A-Z0-9]{6,20}$/.test(options.id || '')) return;
    config = options;
    choice = read() || legacy();
    if (!config.onPage) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      tag = window.gtag;
    }
    tag('consent', 'default', fields(choice ? choice.value : 'denied'));
    tag('set', 'ads_data_redaction', true);
    // No Google script is loaded until this page is known to be public.
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui, {once: true}); else ui();
    for (var method of ['pushState', 'replaceState']) {
      (function (name) {
        var original = history[name];
        history[name] = function () {
          page(arguments.length > 2 && arguments[2] != null ? String(arguments[2]) : location.href);
          return original.apply(this, arguments);
        };
      })(method);
    }
    window.addEventListener('popstate', function () { page(); });
    window.addEventListener('hashchange', function () { page(); });
    window.addEventListener('storage', function (event) {
      if (event.key !== key && event.key !== null) return;
      sessionChoice = null; choice = read(); consent(effective()); page(); announce();
      render(!!path() && !choice && (!country || required.indexOf(country) >= 0));
    });
    window.addEventListener('focus', refresh);
    setInterval(refresh, 60000);
    country = await region(); resolved = true;
    consent(effective()); page(); announce();
    render(!!path() && !choice && (!country || required.indexOf(country) >= 0));
  }
  window.SiteConsent = {start: start, choose: choose, open: function () { render(true); },
    page: page, state: function () { return {value: state, country: country, explicit: !!choice, resolved: resolved}; }};
  var script = document.currentScript;
  if (script && script.dataset.gaId) start({id: script.dataset.gaId, host: script.dataset.host, privacy: script.dataset.privacy, regionEndpoint: script.dataset.regionEndpoint, clarityId: script.dataset.clarityId, legacyKeys: (script.dataset.legacyKeys || '').split(',').filter(Boolean)});
})();
