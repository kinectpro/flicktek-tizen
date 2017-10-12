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
 * Application UI module.
 * It is responsible for managing the user interface.
 *
 * @module app.ui
 * @requires {@link app.ui.circleHelper}
 * @requires {@link app.ui.mainPage}
 * @requires {@link app.ui.devicesPage}
 * @requires {@link app.ui.deviceInfoPage}
 * @requires {@link app.ui.sendFilePage}
 * @namespace app.ui
 * @memberof app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineAppUi(app) {
    'use strict';

    /**
     * Returns true if any popup is opened, false otherwise.
     *
     * @memberof app.ui
     * @private
     * @returns {boolean}
     */
    function isPopupOpened() {
        return document.querySelector('.ui-popup-active') !== null;
    }

    /**
     * Handles back action.
     *
     * Returns true if action was handled, false otherwise (owner module should
     * handle it).
     *
     * @memberof app.ui
     * @public
     * @returns {boolean}
     */
    function handleBackAction() {
        // close popup if opened
        if (isPopupOpened()) {
            tau.closePopup();
            return true;
        }

        if (app.ui.mainPage.isActive()) {
            return false;
        }

        if (app.ui.sendFilePage.isActive() &&
            app.ui.sendFilePage.handleBackAction()) {
            return true;
        }

        // let the library handle back navigation
        tau.back();
        return true;
    }

    /**
     * Initializes the module.
     *
     * @memberof app.ui
     * @public
     */
    function init() {
        app.ui.circleHelper.enableSnapListAutomaticCreation();
        app.ui.mainPage.init();
        app.ui.devicesPage.init();
        app.ui.leDevicesPage.init();
        app.ui.deviceInfoPage.init();
        app.ui.sendFilePage.init();
        tau.engine.run();
    }

    app.ui = {
        init: init,
        handleBackAction: handleBackAction
    };

})(window.app);
