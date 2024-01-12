/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/StaticArea","sap/ui/core/util/ShortcutHelper","sap/base/assert"],function(t,e,r){"use strict";var o={register:function(r,o,i){if(!r){throw new Error("Shortcut.register: oScopeControl must be given.")}if(typeof i!=="function"){throw new Error("Shortcut.register: a function fnCallback must be given.")}var n=e.getNormalizedShortcutSpec(o);e.validateKeyCombination(n);var u=e.findShortcut(r,n);if(u){throw new Error("Same shortcut is already registered on this element")}function a(){var e=document.activeElement,r=document.createElement("span"),o=t.getDomRef(),n=arguments;r.setAttribute("tabindex",0);r.setAttribute("id","sap-ui-shortcut-focus");r.style.position="absolute";r.style.top="50%";r.style.bottom="50%";r.style.left="50%";r.style.right="50%";o.appendChild(r);setTimeout(function(){r.focus();setTimeout(function(){e.focus();o.removeChild(r);i.apply(null,n)})})}var c={};c["onkeydown"]=e.handleKeydown.bind(null,n,o,a);r.addEventDelegate(c);var s=r.data("sap.ui.core.Shortcut");if(!s){s=[];r.data("sap.ui.core.Shortcut",s)}s.push({shortcutSpec:n,platformIndependentShortcutString:e.getNormalizedShortcutString(n),delegate:c})},isRegistered:function(t,o){r(t,"Shortcut.isRegistered: oScopeControl must be given.");var i=e.getNormalizedShortcutSpec(o);return!!e.findShortcut(t,i)},unregister:function(t,o){r(t,"Shortcut.unregister: oScopeControl must be given.");var i=e.getNormalizedShortcutSpec(o);var n=e.findShortcut(t,i);if(n){t.removeEventDelegate(n.delegate);var u=t.data("sap.ui.core.Shortcut");var a=u.indexOf(n);u.splice(a,1);return true}return false}};return o});
//# sourceMappingURL=Shortcut.js.map