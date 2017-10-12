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
 * Circle helper module.
 * Provides helper functions for wearable circle device.
 *
 * @module app.ui.circleHelper
 * @namespace app.ui.circleHelper
 * @memberof app.ui
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineUiCircleHelper(app) {
    'use strict';

    /**
     * Contains references to created snap list components.
     * Used to destroy them when page is being hide.
     *
     * @memberof app.ui.circleHelper
     * @private
     * @type {object[]}
     */
    var createdSnapLists = [];

    /**
     * Handles "pagebeforeshow" event.
     * Initializes snap list style for each list on the page.
     *
     * @memberof app.ui.circleHelper
     * @private
     * @param {CustomEvent} event
     */
    function onPageBeforeShow(event) {
        var page = event.target,
            i = 0,
            lists = [].slice.call(page.querySelectorAll('.ui-listview'), 0),
            length = lists.length;

        for (i = 0; i < length; i += 1) {
            createdSnapLists.push(tau.helper.SnapListStyle.create(lists[i]));
        }
    }

    /**
     * Handles "pagebeforehide" event.
     * Destroys all created snap list components.
     *
     * @memberof app.ui.circleHelper
     * @private
     */
    function onPageBeforeHide() {
        var i = 0,
            length = createdSnapLists.length;

        for (i = 0; i < length; i += 1) {
            createdSnapLists[i].destroy();
        }

        createdSnapLists = [];
    }

    /**
     * Enables automatic creation of snap lists on each page.
     * Snap list detects center-positioned list item when scroll ends
     * and stylizes it different than other list items.
     *
     * @memberof app.ui.circleHelper
     * @public
     */
    function enableSnapListAutomaticCreation() {
        if (!tau.support.shape.circle) {
            return;
        }

        document.addEventListener('pagebeforeshow', onPageBeforeShow);
        document.addEventListener('pagebeforehide', onPageBeforeHide);
    }

    app.ui = app.ui || {};
    app.ui.circleHelper = {
        enableSnapListAutomaticCreation: enableSnapListAutomaticCreation
    };

})(window.app);
