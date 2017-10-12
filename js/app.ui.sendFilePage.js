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

/*global window, tau, document*/

/**
 * Send file page module.
 * It handles view which shows user the status of the file sending operation.
 *
 * @module app.ui.sendFilePage
 * @namespace app.ui.sendFilePage
 * @memberof app.ui
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineSendFilePage(app) {
    'use strict';

    /**
     * Identifier of HTML element containing the page structure.
     *
     * @memberof app.ui.sendFilePage
     * @private
     * @const {string}
     */
    var PAGE_ID = 'send-file-page',

        /**
         * Reference to HTML element containing the page structure.
         *
         * @memberof app.ui.sendFilePage
         * @private
         * @type {HTMLElement}
         */
        pageElement = null,

        /**
         * Reference to TAU circle progress component.
         *
         * @memberof app.ui.sendFilePage
         * @private
         * @type {object}
         */
        progressBarComponent = null,

        /**
         * Reference to HTML element containing text value of sending file
         * progress.
         *
         * @memberof app.ui.sendFilePage
         * @private
         * @type {HTMLElement}
         */
        progressValueElement = null,

        /**
         * Reference to HTML element showing information about errors and
         * successful send of the file.
         *
         * @memberof app.ui.sendFilePage
         * @private
         * @type {HTMLElement}
         */
        infoElement = null;

    /**
     * Returns true if devices info page is currently displayed to the user,
     * false otherwise.
     *
     * @memberof app.ui.sendFilePage
     * @public
     * @returns {boolean}
     */
    function isActive() {
        var page = tau.widget.Page(pageElement);

        return page.isActive();
    }

    /**
     * Shows specified text in the page content.
     * It also hides progress bar and shows confirm button.
     *
     * @memberof app.ui.sendFilePage
     * @public
     * @param {string} text
     */
    function showInfo(text) {
        pageElement.classList.add('info-mode');
        infoElement.innerText = text;
    }

    /**
     * Updates UI with specified percentage progress of sending file operation.
     *
     * @memberof app.ui.sendFilePage
     * @private
     * @param {number} percent
     */
    function setProgressPercentValue(percent) {
        var value = Math.floor(percent);

        progressBarComponent.value(value);
        progressValueElement.innerText = value + '%';
    }

    /**
     * Handles "pagebeforeshow" event for the page.
     * Initializes proper TAU components.
     *
     * @memberof app.ui.sendFilePage
     * @private
     */
    function onPageBeforeShow() {
        progressBarComponent = tau.widget.CircleProgressBar(
            pageElement.querySelector('#progress-indicator'), {size: 'small'});
        setProgressPercentValue(0);
    }

    /**
     * Handles "pagehide" event for the page.
     * Cleans up the content of the page.
     *
     * @memberof app.ui.sendFilePage
     * @private
     */
    function onPageHide() {
        progressBarComponent.destroy();
        pageElement.classList.remove('info-mode');
    }

    /**
     * Handles successful send file operation.
     *
     * @memberof app.ui.sendFilePage
     * @private
     */
    function onFileSendSuccess() {
        showInfo('File sent successfully.');
    }

    /**
     * Handles errors occurred during send file operation.
     *
     * @memberof app.ui.sendFilePage
     * @private
     * @param {string} error Error code.
     */
    function onFileSendError(error) {
        var message = '';

        switch (error) {
        case app.model.SEND_FILE_ERROR.NOT_SUPPORTED_ERROR:
            message = 'Operation not supported.';
            break;
        case app.model.SEND_FILE_ERROR.FILE_ERROR:
            message = 'Cannot access selected file.';
            break;
        case app.model.SEND_FILE_ERROR.CONNECTION_ERROR:
            message = 'Connection error occurred.';
            break;
        case app.model.SEND_FILE_ERROR.INTERNAL_ERROR:
            message = 'Error occurred during operation.';
            break;
        default:
            message = 'Unknown error occurred.';
        }

        showInfo(message);
    }

    /**
     * Handles progress of sending file.
     *
     * @memberof app.ui.sendFilePage
     * @private
     * @param {number} sentBytes
     * @param {number} allBytes
     */
    function onFileSendProgress(sentBytes, allBytes) {
        setProgressPercentValue(sentBytes / allBytes * 100);
    }

    /**
     * Handles click on confirm button.
     * The button is visible when there is an information about success
     * or error shown to the user.
     * Goes back to the previous page.
     *
     * @memberof app.ui.sendFilePage
     * @private
     */
    function onConfirmBtnClick() {
        tau.back();
    }

    /**
     * Handles back action.
     *
     * Returns true if action was handled, false otherwise (owner module should
     * handle it).
     *
     * @memberof app.ui.sendFilePage
     * @public
     * @returns {boolean}
     */
    function handleBackAction() {
        // back is not possible when there is ongoing send process
        if (pageElement.classList.contains('info-mode')) {
            tau.back();
        }

        return true;
    }

    /**
     * Starts sending specified file to selected device and shows the page
     * which will show the operation status.
     *
     * @memberof app.ui.sendFilePage
     * @private
     * @param {BluetoothDevice} device
     * @param {string} file
     */
    function show(device, file) {
        tau.changePage('#' + PAGE_ID);
        app.model.sendFile(device, file, {
            onSuccess: onFileSendSuccess,
            onError: onFileSendError,
            onProgress: onFileSendProgress
        });
    }

    /**
     * Binds HTML elements to variables to improve access time.
     *
     * @memberof app.ui.sendFilePage
     * @private
     */
    function bindElements() {
        pageElement = document.getElementById(PAGE_ID);
        progressValueElement = pageElement.querySelector('#progress-value');
        infoElement = pageElement.querySelector('#info-mode-container');
    }

    /**
     * Registers event listeners for the module.
     *
     * @memberof app.ui.sendFilePage
     * @private
     */
    function bindEvents() {
        // bind UI events
        pageElement.addEventListener('pagebeforeshow', onPageBeforeShow);
        pageElement.addEventListener('pagehide', onPageHide);
        pageElement.querySelector('#send-file-confirm-btn').addEventListener(
            'click', onConfirmBtnClick);
    }

    /**
     * Initializes the module.
     *
     * @memberof app.ui.sendFilePage
     * @public
     */
    function init() {
        bindElements();
        bindEvents();
    }

    app.ui = app.ui || {};
    app.ui.sendFilePage = {
        init: init,
        show: show,
        isActive: isActive,
        handleBackAction: handleBackAction
    };

})(window.app);
