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

/*global window, tau, document, console*/

/**
 * Devices page module.
 * It handles view which allows user to view known devices, as well as discover
 * nearby Bluetooth devices.
 *
 * @module app.ui.devicesPage
 * @requires {@link app.model}
 * @requires {@link app.ui.templates}
 * @requires {@link app.common}
 * @namespace app.ui.devicesPage
 * @memberof app.ui
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineDevicesPage(app) {
    'use strict';

    /**
     * Identifier of HTML element containing the page structure.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @const {string}
     */
    var PAGE_ID = 'devices-page',

        /**
         * Reference to HTML element containing the page structure.
         *
         * @memberof app.ui.devicesPage
         * @private
         * @type {HTMLElement}
         */
        pageElement = null,

        /**
         * Reference to HTML element containing the list of devices.
         *
         * @memberof app.ui.devicesPage
         * @private
         * @type {HTMLElement}
         */
        listElement = null;

    /**
     * Bluetooth devices comparator.
     * Used to sort list of devices.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @param {BluetoothDevice} device1
     * @param {BluetoothDevice} device2
     * @returns {number}
     */
    function compareDevices(device1, device2) {
        var device1Rate = 0,
            device2Rate = 0;

        if (device1.isConnected) {
            device1Rate = 2;
        } else if (device1.isBonded) {
            device1Rate = 1;
        }

        if (device2.isConnected) {
            device2Rate = 2;
        } else if (device2.isBonded) {
            device2Rate = 1;
        }

        return device1Rate - device2Rate;
    }

    /**
     * Toggles scanning UI state to specified boolean value.
     * It manages proper CSS class which is responsible for showing/hiding
     * buttons and "processing" component.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @param {boolean} ongoing
     */
    function toggleScanning(ongoing) {
        if (ongoing) {
            pageElement.classList.add('state-scanning');
        } else {
            pageElement.classList.remove('state-scanning');
        }
    }

    /**
     * Handles retrieval of a list of Bluetooth devices that were known
     * to the local Bluetooth adapter.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @param {BluetoothDevice[]} devices
     */
    function onKnownDevicesObtained(devices) {
        var content = '',
            i = 0,
            length = devices.length,
            device = null,
            status = '',
            cssClass = '';

        devices = [].slice.call(devices, 0);
        devices.sort(compareDevices).reverse();

        listElement.innerHTML = '';

        for (i = 0; i < length; i += 1) {
            device = devices[i];

            if (device.isConnected) {
                status = 'Connected';
                cssClass = 'device-connected';
            } else if (device.isBonded) {
                status = 'Paired';
                cssClass = 'device-bonded';
            } else {
                status = 'Available';
                cssClass = 'device-available';
            }

            content += app.ui.templates.getDeviceListElement({
                address: device.address,
                name: device.name,
                status: status,
                cssClasses: [cssClass]
            });

            listElement.innerHTML = content;
            if (tau.support.shape.circle) {
                tau.widget.SnapListview(listElement).refresh();
            }
        }
    }

    /**
     * Refreshes the page content.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function refresh() {
        app.model.getKnownDevices(onKnownDevicesObtained);
    }

    /**
     * Handles "pagebeforeshow" event for the page.
     * Refreshes the content of the page.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function onPageBeforeShow() {
        refresh();
    }

    /**
     * Handles "pagehide" event for the page.
     * Cleans up the page.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function onPageHide() {
        listElement.innerHTML = '';
    }

    /**
     * Handles start of scan (discovering) process.
     * Removes all "available" type devices and refreshes the list
     * component if it is necessary.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function onScanStarted() {
        var availableItems = [].slice.call(
                listElement.querySelectorAll('li.device-available'), 0),
            i = 0,
            length = availableItems.length;

        for (i = 0; i < length; i += 1) {
            listElement.removeChild(availableItems[i]);
        }

        if (tau.support.shape.circle) {
            tau.widget.SnapListview(listElement).refresh();
        }
    }

    /**
     * Handles device found case (scanning process).
     * Adds device to the list and refreshes the list
     * component if it is necessary.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @param {BluetoothDevice} device
     */
    function onDeviceFound(device) {
        listElement.insertAdjacentHTML(
            'beforeend',
            app.ui.templates.getDeviceListElement({
                address: device.address,
                name: device.name,
                status: 'Available',
                cssClasses: ['device-available']
            })
        );

        if (tau.support.shape.circle) {
            tau.widget.SnapListview(listElement).refresh();
        }
    }

    /**
     * Handles device disappeared case (scanning process).
     * Removes device from the list and refreshes the list
     * component if it is necessary.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @param {string} address Bluetooth device address.
     */
    function onDeviceDisappeared(address) {
        var targetItem = listElement
                .querySelector('li[data-address="' + address + '"]');

        if (!targetItem) {
            return;
        }

        listElement.removeChild(targetItem);

        if (tau.support.shape.circle) {
            tau.widget.SnapListview(listElement).refresh();
        }
    }

    /**
     * Handles end of scan (discovering) process.
     * Restores UI to default state.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function onScanFinished() {
        toggleScanning(false);
    }

    /**
     * Handles error occurred during scan process.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @param {Error} error
     */
    function onScanError(error) {
        console.error('scan error', error);
        toggleScanning(false);
    }

    /**
     * Handles click event on "Scan" button.
     * Starts discovering of nearby Bluetooth devices.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function onScanStartClick() {
        toggleScanning(true);

        app.model.discoverDevices({
            onstarted: onScanStarted,
            ondevicefound: onDeviceFound,
            ondevicedisappeared: onDeviceDisappeared,
            onfinished: onScanFinished
        }, onScanError);
    }

    /**
     * Handles click event on "Stop" button.
     * Stops process of discovering of nearby Bluetooth devices.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function onScanStopClick() {
        app.model.stopDiscovery();
    }

    /**
     * Handles click on list element.
     * Determines clicked list item and shows device info page.
     *
     * @memberof app.ui.devicesPage
     * @private
     * @param {MouseEvent} event
     */
    function onListClick(event) {
        var targetItem = app.common.closestElement(event.target, 'li');

        if (!targetItem) {
            return;
        }

        app.ui.deviceInfoPage.show(targetItem.dataset.address);
    }

    /**
     * Binds HTML elements to variables to improve access time.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function bindElements() {
        pageElement = document.getElementById(PAGE_ID);
        listElement = pageElement.querySelector('ul');
    }

    /**
     * Registers event listeners for the module.
     *
     * @memberof app.ui.devicesPage
     * @private
     */
    function bindEvents() {
        // bind UI events
        pageElement.addEventListener('pagebeforeshow', onPageBeforeShow);
        pageElement.addEventListener('pagehide', onPageHide);
        pageElement.querySelector('#devices-scan-button')
            .addEventListener('click', onScanStartClick);
        pageElement.querySelector('#devices-scan-stop-button')
            .addEventListener('click', onScanStopClick);
        listElement.addEventListener('click', onListClick);
    }

    /**
     * Initializes the module.
     *
     * @memberof app.ui.devicesPage
     * @public
     */
    function init() {
        bindElements();
        bindEvents();
    }

    app.ui = app.ui || {};
    app.ui.devicesPage = {
        init: init
    };

})(window.app);
