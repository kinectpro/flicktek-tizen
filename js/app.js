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

/*global document, tizen, console, window*/

/**
 * Main application module.
 * Provides a namespace for other application modules.
 * Handles application life cycle.
 *
 * @module app
 * @requires {@link app.ui}
 * @namespace app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineApp(app) {
    'use strict';

    /**
     * Key for bluetooth feature.
     * The application uses it to check if device is supported.
     *
     * @memberof app
     * @private
     * @const {string}
     */
    var BLUETOOTH_FEATURE_KEY = 'http://tizen.org/feature/network.bluetooth',

        /**
         * Message displayed in case of not supported device.
         *
         * @memberof app
         * @private
         * @const {string}
         */
        NOT_SUPPORTED_MESSAGE = 'Device not supported.';

    /**
     * Returns true if device is supported by the application, false otherwise.
     *
     * @memberof app
     * @private
     * @returns {boolean}
     */
    function isDeviceSupported() {
        try {
            return tizen.systeminfo.getCapability(BLUETOOTH_FEATURE_KEY);
        } catch (error) {
            console.error('Unable to check bluetooth feature', error);
            return false;
        }
    }

    /**
     * Closes the application.
     *
     * @memberof app
     * @private
     */
    function exit() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (error) {
            console.warn('Application exit failed. ', error.message);
        }
    }

    /**
     * Handles user interaction through a special point of hardware.
     *
     * If back action is detected, control is passed to the user interface
     * module first (handling navigation between views). If it decides to
     * not handle it (empty navigation history), the application is closed.
     *
     * @memberof app
     * @private
     * @param {CustomEvent} e
     */
    function onHwKeyEvent(e) {
        if (e.keyName === 'back') {
            if (!app.ui.handleBackAction()) {
                app.model.terminate(function onTerminated() {
                    exit();
                });
            }
        }
    }

    /**
     * Handles "model.file.received" event.
     * Event is triggered when Bluetooth service successfully receives
     * a file from another device.
     *
     * Posts notification about new file received via Bluetooth.
     *
     * @memberof app
     * @private
     * @param {CustomEvent} event
     */
    function onFileReceived(event) {
        var notificationDict = {
                content: event.detail.fileName,
                vibration: true
            },
            notification =  new tizen.StatusNotification(
                'SIMPLE',
                'File received via Bluetooth',
                notificationDict
            );

        try {
            tizen.notification.post(notification);
        } catch (error) {
            console.error('Error during posting notification', error);
        }
    }

    /**
     * Registers event listeners.
     *
     * @memberof app
     * @private
     */
    function bindEvents() {
        document.addEventListener('tizenhwkey', onHwKeyEvent);
        window.addEventListener('model.file.received', onFileReceived);
    }

    /**
     * Initializes the module.
     *
     * @memberof app
     * @private
     */
    function init() {
        // show proper message and exit in case of not supported device
        if (!isDeviceSupported()) {
            window.alert(NOT_SUPPORTED_MESSAGE);
            exit();
        }

        app.model.init();
        app.ui.init();
        bindEvents();
    }

    /**
     * Runs the application.
     *
     * @memberof app
     * @public
     */
    app.run = function run() {
        init();
    };

    window.addEventListener('load', app.run);

})(window.app);
