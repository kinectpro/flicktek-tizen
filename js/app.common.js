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

/* global window*/

/**
 * Application common utility module.
 * Provides common methods used by other modules.
 *
 * @module app.common
 * @namespace app.common
 * @memberof app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

// strict mode wrapper function
(function defineAppCommon(app) {
    'use strict';

    /**
     * Dispatches an event.
     *
     * @memberof app.common
     * @public
     * @param {string} eventName Event name.
     * @param {*} data Detailed data.
     */
    function dispatchEvent(eventName, data) {
        var customEvent = new window.CustomEvent(eventName, {
            detail: data,
            cancelable: true
        });

        window.dispatchEvent(customEvent);
    }

    /**
     * Returns string with escaped HTML special characters.
     *
     * @memberof app.common
     * @public
     * @param {string} string
     * @returns {string}
     */
    function escapeHTML(string) {
        return string
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Returns closest HTML element (including itself) satisfying
     * specified selector.
     * If element is not found, null value is returned.
     *
     * @memberof app.common
     * @public
     * @param {HTMLElement} element
     * @param {string} selector
     * @returns {HTMLElement}
     */
    function closestElement(element, selector) {
        do {
            if (element.webkitMatchesSelector(selector)) {
                return element;
            }

            element = element.parentElement;

        } while (element !== null);

        return null;
    }

    /**
     * Converts string to bytes array.
     * Uses two bytes for each character.
     *
     * @memberof app.common
     * @public
     * @param {string} string
     * @returns {byte[]}
     */
    function stringToBytesArray(string) {
        var result = [],
            i = 0,
            length = string.length,
            charCode = 0;

        for (i = 0; i < length; i += 1) {
            charCode = string.charCodeAt(i);

            // split number into two 8-bits parts
            result.push(charCode >> 8);
            result.push(charCode & 0x00FF);
        }

        return result;
    }

    /**
     * Converts bytes array to string.
     * Each two bytes are converted into one string character.
     *
     * @memberof app.common
     * @public
     * @param {byte[]} array
     * @returns {string}
     */
    function bytesArrayToString(array) {
        var length = array.length,
            i = 0,
            result = [],
            code = 0;

        for (i = 0; i < length; i += 2) {
            code = (array[i] || 0) << 8;
            code += array[i + 1] || 0;
            result.push(code);
        }

        return String.fromCharCode.apply(null, result);
    }

    /**
     * Function which does nothing, it is being used as an empty event handler.
     *
     * @memberof app.common
     * @public
     */
    function noop() {
        return;
    }

    app.common = {
        dispatchEvent: dispatchEvent,
        escapeHTML: escapeHTML,
        closestElement: closestElement,
        stringToBytesArray: stringToBytesArray,
        bytesArrayToString: bytesArrayToString,
        noop: noop
    };

})(window.app);
