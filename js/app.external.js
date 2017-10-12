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

/* global window, tizen*/

/**
 * The module allows launching external applications (by application control)
 * for various purposes (e.g. turning on/off the Bluetooth).
 *
 * @module app.external
 * @namespace app.external
 * @memberof app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

// strict mode wrapper function
(function defineAppExternal(app) {
    'use strict';

    /**
     * Launches an application which allows to change state of the Bluetooth.
     *
     * @memberof app.external
     * @public
     * @param {function} [launchSuccessCallback]
     * @param {function} [launchErrorCallback]
     */
    function changeBluetoothState(launchSuccessCallback, launchErrorCallback) {
        var appControl = new tizen.ApplicationControl(
                'http://tizen.org/appcontrol/operation/edit', null,
                'application/x-bluetooth-on-off'
        );

        try {
            tizen.application.launchAppControl(
                appControl,
                null,
                launchSuccessCallback || null,
                launchErrorCallback || null
            );
        } catch (error) {
            if (launchErrorCallback) {
                launchErrorCallback(error);
            }
        }
    }

    /**
     * Launches an application which allows to change visibility
     * of the Bluetooth adapter.
     *
     * @memberof app.external
     * @public
     * @param {function} [launchSuccessCallback]
     * @param {function} [launchErrorCallback]
     */
    function changeBluetoothVisibility(launchSuccessCallback,
                                       launchErrorCallback) {
        var appControl = new tizen.ApplicationControl(
                'http://tizen.org/appcontrol/operation/edit', null,
                'application/x-bluetooth-visibility'
            );

        try {
            tizen.application.launchAppControl(
                appControl,
                null,
                launchSuccessCallback || null,
                launchErrorCallback || null
            );
        } catch (error) {
            if (launchErrorCallback) {
                launchErrorCallback(error);
            }
        }
    }

    /**
     * Launches an application which allows user to pick single file.
     * Selected file path is passed to filePickedCallback function as
     * a parameter.
     *
     * @memberof app.external
     * @public
     * @param {function} filePickedCallback
     * @param {function} [filePickErrorCallback]
     */
    function pickSingleFile(filePickedCallback, filePickErrorCallback) {
        var appControlData = [new tizen.ApplicationControlData(
                'http://tizen.org/appcontrol/data/selection_mode', ['single']
            )],
            appControl = new tizen.ApplicationControl(
                'http://tizen.org/appcontrol/operation/pick',
                null, '*/*', null, appControlData
            );

        try {
            tizen.application.launchAppControl(appControl, null, null,
                filePickedCallback || null, {
                    onsuccess: function onFilePicked(data) {
                        var i = 0,
                            length = data.length;

                        for (i = 0; i < length; i += 1) {
                            if (data[i].key ===
                                'http://tizen.org/appcontrol/data/selected' ||
                                data[i].key ===
                                'http://tizen.org/appcontrol/data/path') {
                                filePickedCallback(data[i].value[0]);
                                return;
                            }
                        }
                    }
                });

        } catch (error) {
            if (filePickErrorCallback) {
                filePickedCallback(error);
            }
        }
    }

    app.external = {
        changeBluetoothState: changeBluetoothState,
        changeBluetoothVisibility: changeBluetoothVisibility,
        pickSingleFile: pickSingleFile
    };

})(window.app);
