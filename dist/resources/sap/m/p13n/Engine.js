/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/p13n/modules/AdaptationProvider","sap/base/util/merge","sap/base/Log","sap/m/p13n/modification/FlexModificationHandler","sap/m/MessageStrip","sap/ui/core/library","sap/ui/core/Element","sap/m/p13n/modules/DefaultProviderRegistry","sap/m/p13n/modules/UIManager","sap/m/p13n/modules/StateHandlerRegistry","sap/m/p13n/modules/xConfigAPI","sap/m/p13n/enum/ProcessingStrategy"],function(t,e,n,r,i,o,a,s,c,l,h,f){"use strict";var g="Engine: This class is a singleton. Please use the getInstance() method instead.";var p=o.MessageType;var u=new WeakMap;var d;var y=t.extend("sap.m.p13n.Engine",{constructor:function(){t.call(this);if(d){throw Error(g)}this._aRegistry=[];this._aStateHandlers=[];this.defaultProviderRegistry=s.getInstance(this);this.uimanager=c.getInstance(this);this.stateHandlerRegistry=l.getInstance()}});y.prototype.register=function(t,e){if(!e.hasOwnProperty("controller")){throw new Error("Please provide at least a configuration 'controller' containing a map of key-value pairs (key + Controller class) in order to register adaptation.")}var n=this._getRegistryEntry(t);if(n){this.deregister(t)}n=this._createRegistryEntry(t,e);var r=Object.keys(e.controller);r.forEach(function(n){var r=e.controller[n];if(!this.getController(t,n)){if(this._aRegistry.indexOf(t.getId())<0){this._aRegistry.push(t.getId())}this.addController(r,n)}}.bind(this));var i=t.getCustomData().find(t=>t.getKey()=="xConfig");if(i&&JSON.parse(i.getValue().replace(/\\/g,""))?.modified){this.fireStateChange(t)}};y.prototype.deregister=function(t){var e=this._getRegistryEntry(t);Object.keys(e.controller).forEach(function(t){var n=e.controller[t];n.destroy();delete e.controller[t]});u.delete(t);var n=this._aRegistry.indexOf(t.getId());this._aRegistry.splice(n,1)};y.prototype.show=function(t,e,n){return this.hasChanges(t).catch(t=>false).then(function(r){return this.uimanager.show(t,e,{...n,enableReset:r})}.bind(this))};y.prototype.attachStateChange=function(t){return this.stateHandlerRegistry.attachChange(t)};y.prototype.detachStateChange=function(t){return this.stateHandlerRegistry.detachChange(t)};y.prototype.hasChanges=function(t,e){const n=this.getController(t,e)?.getChangeOperations();let r;if(n){r=Object.values(n)}var i=this._determineModification(t);return this.getModificationHandler(t).hasChanges({selector:t,changeTypes:r},i?.payload).then(t=>t)};y.prototype.reset=function(t,e){if(e===undefined){e=this.getRegisteredControllers(t)}e=e instanceof Array?e:[e];var n=[];e.forEach(function(e){n=n.concat(this.getController(t,e).getSelectorForReset())}.bind(this));var r={selectors:n,selector:t};if(e){var i=[];e.forEach(function(e){i=i.concat(Object.values(this.getController(t,e).getChangeOperations()))}.bind(this));r.changeTypes=[].concat.apply([],i)}var o=this._determineModification(t);return o.handler.reset(r,o.payload).then(function(){this.stateHandlerRegistry.fireChange(t);return this.initAdaptation(t,e).then(function(n){e.forEach(function(e){var r=this.getController(t,e);r.update(n)}.bind(this))}.bind(this))}.bind(this))};y.prototype.applyState=function(t,e){return this.retrieveState(t).then(function(r){var i=[],o=[],a={};if(t.validateState instanceof Function){a=t.validateState(this.externalizeKeys(t,e))}if(a.validation===p.Error){n.error(a.message)}var s=Object.keys(e);s.forEach(function(n){var r=this.getController(t,n);if(!r){return}var o=this.createChanges({control:t,key:n,state:r.sanityCheck(e[n]),suppressAppliance:true,applyAbsolute:false});i.push(o)}.bind(this));return Promise.all(i).then(function(e){var n={};e.forEach(function(t,e){if(t&&t.length>0){o=o.concat(t);var r=s[e];n[r]=t}});return this._processChanges(t,n)}.bind(this))}.bind(this))};y.prototype.retrieveState=function(t){return this.checkControlInitialized(t).then(function(){return y.getInstance().waitForChanges(t).then(function(){var n={};y.getInstance().getRegisteredControllers(t).forEach(function(e){n[e]=y.getInstance().getController(t,e).getCurrentState(true)});return e({},n)})})};y.prototype._setModificationHandler=function(t,e){if(!e.isA("sap.m.p13n.modification.ModificationHandler")){throw new Error("Only sap.m.p13n.modification.ModificationHandler derivations are allowed for modification")}var n=this._determineModification(t);n.handler=e;this._getRegistryEntry(t).modification=n};y.prototype._addToQueue=function(t,e){var n=this._getRegistryEntry(t);var r=function(t){if(n.pendingModification===t){n.pendingModification=null}};n.pendingModification=n.pendingModification instanceof Promise?n.pendingModification.then(e):e();n.pendingModification.then(r.bind(null,n.pendingModification));return n.pendingModification};y.prototype.createChanges=function(t){var n=y.getControlInstance(t.control);var r=t.key;var i=t.state;var o=!!t.suppressAppliance;if(!r||!t.control||!i){return Promise.resolve([])}var a=function(){return this.initAdaptation(n,r).then(function(){return i}).then(function(i){var a=this.getController(n,r);var s=a.getChangeOperations();var c=this._getRegistryEntry(n);var l=a.getCurrentState();var h=e(l instanceof Array?[]:{},l);var f={existingState:t.stateBefore||h,applyAbsolute:t.applyAbsolute,changedState:i,control:a.getAdaptationControl(),changeOperations:s,deltaAttributes:["key"],propertyInfo:c.helper.getProperties().map(function(t){return{key:t.key,name:t.name}})};var g=a.getDelta(f);if(!o){var p={};p[r]=g;return this._processChanges(n,p).then(function(){return g})}return g||[]}.bind(this))}.bind(this);return this._addToQueue(n,a)};y.prototype.waitForChanges=function(t){var e=this._determineModification(t);var n=this._getRegistryEntry(t);return n&&n.pendingModification?n.pendingModification:Promise.resolve().then(function(){return e.handler.waitForChanges({element:t},e.payload)})};y.prototype.isModificationSupported=function(t){var e=this._determineModification(t);return e.handler.isModificationSupported({element:t},e.payload)};y.prototype.fireStateChange=function(t){return this.retrieveState(t).then(function(e){this.stateHandlerRegistry.fireChange(t,e)}.bind(this))};y.prototype._processChanges=function(t,e){var n=[];var r=Object.keys(e);var i={};r.forEach(function(r){i[r]=this.getController(t,r).changesToState(e[r]);n=n.concat(e[r])}.bind(this));if(n instanceof Array&&n.length>0){var o=this._determineModification(t);return o.handler.processChanges(n,o.payload).then(function(e){var n=y.getControlInstance(t);this.fireStateChange(n);return e}.bind(this))}else{return Promise.resolve([])}};y.prototype.getRTASettingsActionHandler=function(t,e,n){var i;var o=this.hasForReference(t,"sap.m.p13n.PersistenceProvider");if(o.length>0&&!t.isA("sap.ui.mdc.link.Panel")){return Promise.reject("Please do not use a PeristenceProvider in RTA.")}var a=this.getModificationHandler(t);var s=new r;var c=new Promise(function(t,e){i=t});s.processChanges=function(t){i(t);return Promise.resolve(t)};this._setModificationHandler(t,s);this.uimanager.show(t,n,{showReset:false}).then(function(t){var n=t.getCustomHeader();if(n){n.getContentRight()[0].setVisible(false)}t.addStyleClass(e.styleClass);if(e.fnAfterClose instanceof Function){t.attachAfterClose(e.fnAfterClose)}});c.then(function(){this._setModificationHandler(t,a);s.destroy()}.bind(this));return c};y.prototype.enhanceXConfig=function(t,e){var n=y.getControlInstance(t);var r=this._getRegistryEntry(t);e.currentState=y.getInstance().getController(n,e.changeType)?.getCurrentState();return h.enhanceConfig(n,e).then(function(t){if(r){r.xConfig=t}return t})};y.prototype.readXConfig=function(t,e){var n=y.getControlInstance(t);return h.readConfig(n,e)||{}};y.prototype.externalizeKeys=function(t,e){var n={};Object.keys(e).forEach(function(r){var i=this.getController(y.getControlInstance(t),r);if(i){n[i.getStateKey()]=e[r]}}.bind(this));return n};y.prototype.internalizeKeys=function(t,e){var n=this.getRegisteredControllers(t),r={};n.forEach(function(n){var i=this.getController(t,n).getStateKey();if(e.hasOwnProperty(i)){r[n]=e[i]}}.bind(this));return r};y.prototype.diffState=function(t,n,r){var i=[],o={};n=e({},n);r=e({},r);Object.keys(r).forEach(function(e){i.push(this.createChanges({control:t,stateBefore:n[e],state:r[e],applyAbsolute:f.FullReplace,key:e,suppressAppliance:true}))}.bind(this));return Promise.all(i).then(function(e){Object.keys(r).forEach(function(i,a){if(r[i]){var s=this.getController(t,i).changesToState(e[a],n[i],r[i]);o[i]=s}}.bind(this));return o}.bind(this))};y.prototype.checkControlInitialized=function(t){var e=y.getControlInstance(t);var n=e.initialized instanceof Function?e.initialized():Promise.resolve();return n||Promise.resolve()};y.prototype.checkPropertyHelperInitialized=function(t){var e=y.getControlInstance(t);return e.initPropertyHelper instanceof Function?e.initPropertyHelper():Promise.resolve()};y.prototype.initAdaptation=function(t,e){this.verifyController(t,e);var n=this._getRegistryEntry(t);var r=y.getControlInstance(t);if(n.helper){return Promise.resolve(n.helper)}return this.checkPropertyHelperInitialized(r).then(function(t){n.helper=t;return t},function(t){throw new Error(t)})};y.prototype.addController=function(t,e,n){var r=this._getRegistryEntry(t.getAdaptationControl(),n);r.controller[e]=t};y.prototype.getController=function(t,e){var n=this._getRegistryEntry(t),r;if(n&&n.controller.hasOwnProperty(e)){r=n.controller[e]}if(!r){this.getRegisteredControllers(t).forEach(function(n){var i=this.getController(t,n);if(i){Object.keys(i.getChangeOperations()).forEach(function(t){if(i.getChangeOperations()[t]===e){r=i}})}}.bind(this))}return r};y.prototype.verifyController=function(t,e){var n=e instanceof Array?e:[e];n.forEach(function(e){if(!this.getController(t,e)){var n=y.getControlInstance(t);throw new Error("No controller registered yet for "+n.getId()+" and key: "+e)}}.bind(this))};y.prototype.getUISettings=function(t,e){var n=Array.isArray(e)?e:[e];this.verifyController(t,n);var r=this._getRegistryEntry(t).helper;var i={},o=[];n.forEach(function(e){var n=this.getController(t,e);var i=n.initAdaptationUI(r);if(i instanceof Promise){o.push(i)}}.bind(this));return Promise.all(o).then(function(t){t.forEach(function(t,e){var r=n[e];i[r]={panel:t}});return i})};y.prototype.isRegistered=function(t){var e=this._getRegistryEntry(t);return!!e};y.prototype.isRegisteredForModification=function(t){var e=this._getRegistryEntry(t);return e&&!!e.modification};y.prototype.getRegisteredControllers=function(t){var e=this._getRegistryEntry(t);return e?Object.keys(e.controller):[]};y.prototype._getRegistryEntry=function(t){var e=y.getControlInstance(t);return u.get(e)};y.prototype.getModificationHandler=function(t){var e=this._determineModification(t);return e.handler};y.prototype._createRegistryEntry=function(t,e){var n=y.getControlInstance(t);if(!u.has(n)){u.set(n,{modification:e&&e.modification?{handler:e.modification,payload:{mode:"Auto",hasVM:true,hasPP:false}}:null,controller:{},activeP13n:null,helper:e&&e.helper?e.helper:null,xConfig:null,pendingAppliance:{}})}return u.get(n)};y.prototype.trace=function(t,e){var n=this._getRegistryEntry(t);this.getRegisteredControllers(t).forEach(function(r){var i=this.getController(t,r);var o=i.getChangeOperations();Object.keys(o).forEach(function(t){if(o[t]===e.changeSpecificData.changeType){n.pendingAppliance[r]=[].concat(n.pendingAppliance[r]||[]).concat(e)}})}.bind(this))};y.prototype.getTrace=function(t,e){var n=this._getRegistryEntry(t),r;if(n){r=Object.keys(n.pendingAppliance)}return r};y.prototype.clearTrace=function(t,e){var n=this._getRegistryEntry(t);if(n){n.pendingAppliance={}}};y.prototype._determineModification=function(t){var e=this._getRegistryEntry(t);if(e&&e.modification){return e.modification}var n=this.hasForReference(t,"sap.m.p13n.PersistenceProvider").concat(this.hasForReference(t,"sap.ui.mdc.p13n.PersistenceProvider"));var i=this.hasForReference(t,"sap.ui.fl.variants.VariantManagement");var o=n.length?n:undefined;var a=o?o[0].getMode():"Standard";var s={handler:r.getInstance(),payload:{hasVM:i&&i.length>0,hasPP:n&&n.length>0,mode:a}};if(e&&!e.modification){e.modification=s}return s};y.prototype.hasForReference=function(t,e){var n=t&&t.getId?t.getId():t;var r=a.registry.filter(function(t){if(!t.isA(e)){return false}var r=t.getFor instanceof Function?t.getFor():[];for(var i=0;i<r.length;i++){if(r[i]===n||d.hasControlAncestorWithId(n,r[i])){return true}}return false});return r};y.prototype.hasControlAncestorWithId=function(t,e){var n;if(t===e){return true}n=sap.ui.getCore().byId(t);while(n){if(n.getId()===e){return true}if(typeof n.getParent==="function"){n=n.getParent()}else{return false}}return false};y.getControlInstance=function(t){return typeof t=="string"?sap.ui.getCore().byId(t):t};y.prototype.hasActiveP13n=function(t){return!!this._getRegistryEntry(t).activeP13n};y.prototype.setActiveP13n=function(t,e,n){this._getRegistryEntry(t).activeP13n=e?{usedControllers:e,modified:n}:null};y.prototype.validateP13n=function(t,e,r){var o=this.getController(t,e);var a=y.getControlInstance(t);var s=this._getRegistryEntry(t).controller;var c={};Object.keys(s).forEach(function(t){c[t]=s[t].getCurrentState()});if(o&&o.model2State instanceof Function){c[e]=o.model2State();var l={validation:p.None};if(a.validateState instanceof Function){l=a.validateState(this.externalizeKeys(a,c),e)}var h;if(l.validation!==p.None){h=new i({type:l.validation,text:l.message})}if(r.setMessageStrip instanceof Function){r.setMessageStrip(h)}else{n.warning("message strip could not be provided - the adaptation UI needs to implement 'setMessageStrip'")}}};y.prototype.handleP13n=function(t,e){var n=[];e.forEach(function(e){var r=this.getController(t,e);var i=r.getP13nData();if(i){var o=this.createChanges({control:t,key:e,state:i,suppressAppliance:true,applyAbsolute:true}).then(function(t){return r.getBeforeApply().then(function(e){var n=e?e.concat(t):t;return n})});n.push(o)}}.bind(this));return Promise.all(n).then(function(n){var r=[];var i={};n.forEach(function(t,n){r=r.concat(t);var o=e[n];i[o]=t});if(r.length>0){y.getInstance()._processChanges(t,i)}})};y.getInstance=function(){if(!d){d=new y}return d};y.prototype._getRegistry=function(){var t={stateHandlerRegistry:this.stateHandlerRegistry,defaultProviderRegistry:this.defaultProviderRegistry,controlRegistry:{}};this._aRegistry.forEach(function(e){var n=sap.ui.getCore().byId(e);t.controlRegistry[e]=u.get(n)});return t};y.prototype.destroy=function(){t.prototype.destroy.apply(this,arguments);d=null;this._aRegistry=null;u.delete(this);this.defaultProviderRegistry.destroy();this.defaultProviderRegistry=null;this.stateHandlerRegistry.destroy();this.stateHandlerRegistry=null;this.uimanager.destroy();this.uimanager=null};return y});
//# sourceMappingURL=Engine.js.map