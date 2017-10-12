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

/*global window, tau, document, console, tizen*/

/**
 * Devices info page module.
 * It handles view which allows user to view device information, pair or unpair
 * the device, as well as send file.
 *
 * @module app.ui.deviceInfoPage
 * @requires {@link app.ui.sendFilePage}
 * @namespace app.ui.deviceInfoPage
 * @memberof app.ui
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineDeviceInfoPage(app) {
    'use strict';

    /**
     * Identifier of HTML element containing the page structure.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @const {string}
     */
    var PAGE_ID = 'device-info-page',

        /**
         * Reference to HTML element containing the page structure.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        pageElement = null,

        /**
         * Hardware address of currently displayed Bluetooth device.
         * Used as an identifier to obtain device object (detailed data).
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {string}
         */
        currentDeviceAddress = '',

        /**
         * Bluetooth device object of currently displayed device.
         * Contains detailed information about the device.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {BluetoothDevice}
         */
        currentDevice = null,

        /**
         * Reference to HTML element displaying device name.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        deviceNameElement = null,

        /**
         * Reference to HTML element displaying device status (connected,
         * paired, available).
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        deviceStatusElement = null,

        /**
         * Reference to HTML element displaying device hardware address.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        deviceAddressElement = null,

        /**
         * Reference to HTML element displaying type of the device.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        deviceTypeElement = null,

        /**
         * Reference to HTML element containing the list of device information
         * and actions buttons.
         *
         * @memberof app.ui.devicesPage
         * @private
         * @type {HTMLElement}
         */
        listElement = null,

        /**
         * Reference to HTML list element containing "Pair" button.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        pairBtnListElement = null,

        /**
         * Reference to HTML list element containing "Unpair" button.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        unpairBtnListElement = null,

        /**
         * Reference to HTML list element containing "Send file" button.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {HTMLElement}
         */
        sendFileListElement = null,

        /**
         * Stores hidden list elements.
         *
         * @memberof app.ui.deviceInfoPage
         * @private
         * @type {DocumentFragment}
         */
        hiddenListElementsStorage = null;

    /**
     * Sets specified list element visibility by removing or adding
     * it to the list.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @param {HTMLElement} element
     * @param {boolean} visible
     */
    function setListElementVisibility(element, visible) {
        var target = visible ? listElement : hiddenListElementsStorage;

        if (element.parentNode === target) {
            return;
        }

        target.appendChild(element);
    }

    /**
     * Shows information popup with specified title and content.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @param {string} title
     * @param {string} content
     */
    function showInfoPopup(title, content) {
        var popup = pageElement.querySelector('#device-info-popup');

        popup.querySelector('.ui-popup-header').innerText = title;
        popup.querySelector('.ui-popup-content').innerText = content;

        tau.openPopup(popup);
    }

    /**
     * Returns true if devices info page is currently displayed to the user,
     * false otherwise.
     *
     * @memberof app.ui.deviceInfoPage
     * @public
     * @returns {boolean}
     */
    function isActive() {
        var page = tau.widget.Page(pageElement);

        return page.isActive();
    }

    /**
     * Returns readable name of Bluetooth device type.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @param {BluetoothDevice} device
     * @returns {string}
     */
    function getDeviceTypeName(device) {
        /* jshint maxcomplexity:12 */

        switch (device.deviceClass.major) {
        case tizen.bluetooth.deviceMajor.MISC:
            return 'Miscellaneous';
        case tizen.bluetooth.deviceMajor.COMPUTER:
            return 'Computer';
        case tizen.bluetooth.deviceMajor.PHONE:
            return 'Phone';
        case tizen.bluetooth.deviceMajor.NETWORK:
            return 'Network';
        case tizen.bluetooth.deviceMajor.AUDIO_VIDEO:
            return 'Audio video';
        case tizen.bluetooth.deviceMajor.PERIPHERAL:
            return 'Peripheral';
        case tizen.bluetooth.deviceMajor.IMAGING:
            return 'Imaging';
        case tizen.bluetooth.deviceMajor.WEARABLE:
            return 'Wearable';
        case tizen.bluetooth.deviceMajor.TOY:
            return 'Toy';
        case tizen.bluetooth.deviceMajor.HEALTH:
            return 'Health';
        case tizen.bluetooth.deviceMajor.UNCATEGORIZED:
            return 'Uncategorized';
        default:
            return 'Unknown';
        }
    }

    /**
     * Updates the user interface using given Bluetooth device data.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @param {BluetoothDevice} device
     */
    function updateUI(device) {
        var status = '';

        if (device.isConnected) {
            status = 'Connected';
        } else if (device.isBonded) {
            status = 'Paired';
        } else {
            status = 'Available';
        }

        deviceNameElement.innerText = device.name;
        deviceAddressElement.innerText = device.address;
        deviceStatusElement.innerText = status;
        deviceTypeElement.innerText = getDeviceTypeName(device);

        setListElementVisibility(pairBtnListElement, !device.isBonded);
        setListElementVisibility(unpairBtnListElement, device.isBonded);
        setListElementVisibility(sendFileListElement,
            device.isBonded && app.model.supportsSendingFiles(device));

        if (tau.support.shape.circle) {
            tau.widget.SnapListview(listElement).refresh();
        }
    }

    /**
     * Handles success of obtaining Bluetooth device object.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @param {BluetoothDevice} device
     */
    function onDeviceObtained(device) {
        currentDevice = device;
        updateUI(device);
    }

    /**
     * Handles errors occurred during obtaining Bluetooth device object.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @param {Error} error
     */
    function onDeviceObtainError(error) {
        console.error('error', error);

        if (currentDevice) {
            updateUI(currentDevice);
        } else {
            showInfoPopup('Error', 'Unable to obtain device information.');
        }
    }

    /**
     * Refreshes the page content.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function refresh() {
        app.model.getDevice(currentDeviceAddress, onDeviceObtained,
            onDeviceObtainError);
    }

    /**
     * Handles "pagebeforeshow" event for the page.
     * Refreshes the content of the page.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onPageBeforeShow() {
        var scrollableElement = null;

        if (tau.support.shape.circle) {
            scrollableElement = pageElement.querySelector('.ui-scroller');
        } else {
            scrollableElement = pageElement.querySelector('.ui-content');
        }

        scrollableElement.scrollTop = 0;
        refresh();
    }

    /**
     * Handles "pagehide" event for the page.
     * Cleans up the page.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onPageHide() {
        deviceNameElement.innerText = '';
        deviceAddressElement.innerText = '';
        deviceStatusElement.innerText = '';
        deviceTypeElement.innerText = '';
        pageElement.classList.remove(
            'device-paired',
            'device-sending-files-supported',
            'state-pairing',
            'state-unpairing'
        );

        if (tau.support.shape.circle) {
            tau.widget.SnapListview(listElement).refresh();
        }
    }

    /**
     * Handles success of pairing device.
     * Refreshes the page if it is the active one.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onPairSuccess() {
        if (!isActive()) {
            return;
        }

        currentDevice.isBonded = true;
        pageElement.classList.remove('state-pairing');
        refresh();
    }

    /**
     * Handles errors occurred during pairing process.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onPairError() {
        if (!isActive()) {
            return;
        }

        pageElement.classList.remove('state-pairing');
        showInfoPopup('Pairing', 'Operation failed.');
    }

    /**
     * Handles click on "Pair" button.
     * Initiates the process of pairing device.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onPairBtnClick() {
        var classList = pageElement.classList;

        if (classList.contains('state-pairing')) {
            return;
        }

        classList.add('state-pairing');
        app.model.createBonding(currentDeviceAddress, onPairSuccess,
            onPairError);
    }

    /**
     * Handles success of unpairing device.
     * Refreshes the page if it is the active one.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onUnpairSuccess() {
        if (!isActive()) {
            return;
        }

        currentDevice.isBonded = false;
        pageElement.classList.remove('state-unpairing');
        refresh();
    }

    /**
     * Handles errors occurred during unpairing process.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onUnpairError() {
        if (!isActive()) {
            return;
        }

        pageElement.classList.remove('state-unpairing');
        showInfoPopup('Unpairing', 'Operation failed.');
    }

    /**
     * Handles click on "Unpair" button.
     * Initiates the process of unpairing device.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onUnpairBtnClick() {
        var classList = pageElement.classList;

        if (classList.contains('state-unpairing')) {
            return;
        }

        classList.add('state-unpairing');
        app.model.destroyBonding(currentDeviceAddress, onUnpairSuccess,
            onUnpairError);
    }

    /**
     * Called when users picks file for sending.
     * Starts sending process.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     * @param {string} file
     */
    function onFilePicked(file) {
        app.ui.sendFilePage.show(currentDevice, file);
    }

    /**
     * Handles errors occurred during external application launch.
     * The application is being launched to allow user to pick a file for
     * sending it to another device.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onFilePickError() {
        showInfoPopup('Send file', 'Pick file application not available.');
    }

    /**
     * Handles click on "Send file" button.
     * Launches external application which allows user to pick a file.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function onSendFileBtnClick() {
        app.external.pickSingleFile(onFilePicked, onFilePickError);
    }

    /**
     * Binds HTML elements to variables to improve access time.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function bindElements() {
        pageElement = document.getElementById(PAGE_ID);
        listElement = pageElement.querySelector('ul');
        deviceNameElement = pageElement.querySelector('#device-info-name');
        deviceStatusElement = pageElement.querySelector('#device-info-status');
        deviceAddressElement = pageElement
            .querySelector('#device-info-address');
        deviceTypeElement = pageElement.querySelector('#device-info-type');
        pairBtnListElement = listElement.querySelector('#pair-btn-list-item');
        unpairBtnListElement = listElement
            .querySelector('#unpair-btn-list-item');
        sendFileListElement = listElement
            .querySelector('#send-file-btn-list-item');
        hiddenListElementsStorage = document.createDocumentFragment();
    }

    /**
     * Registers event listeners for the module.
     *
     * @memberof app.ui.deviceInfoPage
     * @private
     */
    function bindEvents() {
        // bind UI events
        pageElement.addEventListener('pagebeforeshow', onPageBeforeShow);
        pageElement.addEventListener('pagehide', onPageHide);
        pageElement.querySelector('#pair-btn').addEventListener('click',
            onPairBtnClick);
        pageElement.querySelector('#unpair-btn').addEventListener('click',
            onUnpairBtnClick);
        pageElement.querySelector('#send-file-btn').addEventListener('click',
            onSendFileBtnClick);
    }

    /**
     * Shows the page for specified device (by hardware address).
     *
     * @memberof app.ui.deviceInfoPage
     * @public
     * @param {string} deviceAddress
     */
    function show(deviceAddress) {
        currentDeviceAddress = deviceAddress;
        currentDevice = null;
        tau.changePage('#' + PAGE_ID);
    }

    /**
     * Initializes the module.
     *
     * @memberof app.ui.deviceInfoPage
     * @public
     */
    function init() {
        bindElements();
        bindEvents();
    }

    app.ui = app.ui || {};
    app.ui.deviceInfoPage = {
        init: init,
        show: show
    };

})(window.app);
