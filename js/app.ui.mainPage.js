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
 * Main page module.
 * It handles view which allows user to manage bluetooth state and visibility.
 * The view also shows device name and allows to navigate to devices view.
 *
 * @module app.ui.mainPage
 * @requires {@link app.model}
 * @namespace app.ui.mainPage
 * @memberof app.ui
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineMainPage(app) {
    'use strict';

    /**
     * Identifier of HTML element containing the page structure.
     *
     * @memberof app.ui.mainPage
     * @private
     * @const {string}
     */
    var PAGE_ID = 'main-page',

        /**
         * Reference to HTML element containing the page structure.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {HTMLElement}
         */
        pageElement = null,

        /**
         * Reference to HTML list element containing main page options.
         *
         * @memberof app.ui.devicesPage
         * @private
         * @type {HTMLElement}
         */
        listElement = null,

        /**
         * Reference to HTML list item containing toggle switch which shows
         * state of the Bluetooth adapter.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {HTMLElement}
         */
        stateListItem = null,

        /**
         * Reference to HTML list item containing toggle switch which shows
         * visibility of the Bluetooth adapter.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {HTMLElement}
         */
        visibilityListItem = null,

        /**
         * Reference to HTML element which shows readable name of Bluetooth
         * adapter.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {HTMLElement}
         */
        deviceNameElement = null,

        /**
         * Reference to button which allows to confirm information (popup) that
         * external application will be launched in order to change state
         * of the Bluetooth. When it is pressed, external application
         * is launched.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {HTMLElement}
         */
        stateChangeInfoConfirmBtn = null,

        /**
         * Reference to button which allows to confirm information (popup) that
         * external application will be launched in order to change visibility
         * of the Bluetooth adapter. When it is pressed, external application
         * is launched.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {HTMLElement}
         */
        visibilityChangeInfoConfirmBtn = null,

        /**
         * Contains HTML list elements which require that Bluetooth should
         * be turned on. They are not visible if it is turned off.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {HTMLElement[]}
         */
        bluetoothOnRequiredElements = [],

        /**
         * Stores hidden list elements.
         *
         * @memberof app.ui.mainPage
         * @private
         * @type {DocumentFragment}
         */
        hiddenListElementsStorage = null;

    /**
     * Returns true if main page is currently displayed to the user,
     * false otherwise.
     *
     * @memberof app.ui.mainPage
     * @public
     * @returns {boolean}
     */
    function isActive() {
        var page = tau.widget.Page(pageElement);

        return page.isActive();
    }

    /**
     * Sets list elements visibility by removing or adding them to the list.
     *
     * @memberof app.ui.mainPage
     * @private
     * @param {HTMLElement[]} elements
     * @param {boolean} visible
     */
    function setListElementsVisibility(elements, visible) {
        var target = visible ? listElement : hiddenListElementsStorage,
            i = 0,
            length = elements.length,
            element = null;

        for (i = 0; i < length; i += 1) {
            element = elements[i];

            if (element.parentNode === target) {
                continue;
            }

            target.appendChild(element);
        }
    }

    /**
     * Shows error popup with specified title and content.
     *
     * @memberof app.ui.mainPage
     * @private
     * @param {string} title
     * @param {string} content
     */
    function showErrorPopup(title, content) {
        var popup = pageElement.querySelector('#main-error-popup');

        popup.querySelector('.ui-popup-header').innerText = title;
        popup.querySelector('.ui-popup-content').innerText = content;

        tau.openPopup(popup);
    }

    /**
     * Updates Bluetooth state information in the user interface.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function updateBluetoothState() {
        var toggleSwitch = stateListItem.querySelector('.ui-switch-input'),
            powered = app.model.isPowered(),
            listElement = pageElement.querySelector('ul');

        toggleSwitch.checked = powered;
        setListElementsVisibility(bluetoothOnRequiredElements, powered);

        if (tau.support.shape.circle) {
            tau.widget.SnapListview(listElement).refresh();
        }
    }

    /**
     * Updates Bluetooth visibility information in the user interface.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function updateBluetoothVisibility() {
        var toggleSwitch = visibilityListItem.querySelector('.ui-switch-input');

        toggleSwitch.checked = app.model.isVisible();
    }

    /**
     * Updates device name information in the user interface.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function updateDeviceName() {
        deviceNameElement.innerText = app.model.getName();
    }

    /**
     * Handles "pagebeforeshow" event for the page.
     * Refreshes the content of the page.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function onPageBeforeShow() {
        updateBluetoothState();
        updateBluetoothVisibility();
        updateDeviceName();
    }

    /**
     * Handles state change (on/off) of the Bluetooth adapter.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function onStateChanged() {
        updateBluetoothState();
    }

    /**
     * Handles visibility change of the Bluetooth adapter.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function onVisibilityChanged() {
        updateBluetoothVisibility();
    }

    /**
     * Handles name change of the Bluetooth adapter.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function onNameChanged() {
        updateDeviceName();
    }

    /**
     * Handles click on Bluetooth state list item.
     * Shows popup which informs user that settings application will be
     * launched.
     *
     * @memberof app.ui.mainPage
     * @private
     * @param {MouseEvent} event
     */
    function onStateListItemClick(event) {
        // prevent changing state of toggle switch
        event.preventDefault();

        tau.openPopup('#state-change-info-popup');
    }

    /**
     * Handles click on Bluetooth state list item.
     * Shows popup which informs user that settings application will be
     * launched.
     *
     * @memberof app.ui.mainPage
     * @private
     * @param {MouseEvent} event
     */
    function onVisibilityListItemClick(event) {
        // prevent changing state of toggle switch
        event.preventDefault();

        tau.openPopup('#visibility-change-info-popup');
    }

    /**
     * Handles click on confirm button in popup that informs user about
     * launching external application in order to change Bluetooth state.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function onStateChangeInfoConfirmBtnClick() {
        app.external.changeBluetoothState(null,
            function onLaunchError() {
                showErrorPopup('Error', 'Unable to launch the application.');
            });
    }

    /**
     * Handles click on confirm button in popup that informs user about
     * launching external application in order to change visibility
     * of Bluetooth adapter.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function onVisibilityChangeInfoConfirmBtnClick() {
        app.external.changeBluetoothVisibility(null,
            function onLaunchError() {
                showErrorPopup('Error', 'Unable to launch the application.');
            });
    }

    /**
     * Binds HTML elements to variables to improve access time.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function bindElements() {
        pageElement = document.getElementById(PAGE_ID);
        listElement = pageElement.querySelector('ul.ui-listview');
        stateListItem = listElement.querySelector('#state-list-item');
        visibilityListItem = listElement.querySelector('#visibility-list-item');
        deviceNameElement = listElement.querySelector('#main-device-name');
        stateChangeInfoConfirmBtn = pageElement
            .querySelector('#state-change-info-confirm-btn');
        visibilityChangeInfoConfirmBtn = pageElement
            .querySelector('#visibility-change-info-confirm-btn');
        bluetoothOnRequiredElements = [].slice.call(
            pageElement.querySelectorAll('li.bluetooth-on-required'));
        hiddenListElementsStorage = document.createDocumentFragment();
    }

    /**
     * Registers event listeners for the module.
     *
     * @memberof app.ui.mainPage
     * @private
     */
    function bindEvents() {
        // bind UI events
        pageElement.addEventListener('pagebeforeshow', onPageBeforeShow);
        stateListItem.addEventListener('click', onStateListItemClick);
        visibilityListItem.addEventListener('click', onVisibilityListItemClick);
        stateChangeInfoConfirmBtn.addEventListener('click',
            onStateChangeInfoConfirmBtnClick);
        visibilityChangeInfoConfirmBtn.addEventListener('click',
            onVisibilityChangeInfoConfirmBtnClick);

        // bind model events
        window.addEventListener('model.state.changed', onStateChanged);
        window.addEventListener('model.visibility.changed',
            onVisibilityChanged);
        window.addEventListener('model.name.changed', onNameChanged);
    }

    /**
     * Initializes the module.
     *
     * @memberof app.ui.mainPage
     * @public
     */
    function init() {
        bindElements();
        bindEvents();
    }

    app.ui = app.ui || {};
    app.ui.mainPage = {
        init: init,
        isActive: isActive
    };

})(window.app);
