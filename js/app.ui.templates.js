/*
 * Copyright (c) 2016 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global window*/

/**
 * The templates module.
 * Provides HTML templates for all pages used in the application.
 *
 * @module app.ui.templates
 * @requires {@link app.common}
 * @namespace app.ui.templates
 * @memberof app.ui
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineTemplates(app) {
    'use strict';


    /**
     * Template for device list element.
     * All values which should be replaced with actual data are marked
     * with "%" signs.
     *
     * @memberof app.ui.templates
     * @private
     * @const {string}
     */
    var DEVICE_TEMPLATE = '<li data-address="%address%" ' +
            'class="li-has-multiline %cssClasses%"><a href="#">%name%' +
            '<span class="ui-li-sub-text">%status%</span></a></li>';

    /**
     * Returns HTML for device list element (template text filled
     * with specified data).
     * All necessary values are escaped with HTML entities.
     *
     * @memberof app.ui.templates
     * @public
     * @param {object} data
     * @param {string} data.address Hardware address of the device.
     * @param {string} data.name Device name.
     * @param {string} data.status Device status shown as subtext.
     * @param {string[]} data.cssClasses Css classes added to list item.
     * @returns {string}
     */
    function getDeviceListElement(data) {
        return DEVICE_TEMPLATE
            .replace('%address%', app.common.escapeHTML(data.address))
            .replace('%name%', app.common.escapeHTML(data.name))
            .replace('%status%', app.common.escapeHTML(data.status))
            .replace('%cssClasses%', data.cssClasses.join(' '));
    }

    app.ui = app.ui || {};
    app.ui.templates = {
        getDeviceListElement: getDeviceListElement
    };

})(window.app);

