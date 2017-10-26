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
 * Devices page module. It handles view which allows user to view known devices,
 * as well as discover nearby Bluetooth devices.
 *
 * @module app.ui.leDevicesPage
 * @requires {@link app.model}
 * @requires {@link app.ui.templates}
 * @requires {@link app.common}
 * @namespace app.ui.leDevicesPage
 * @memberof app.ui
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineLeDevicesPage(app) {
    'use strict';
    /*
    all global variables;
     */
    var remoteDevice = null;
    var adapter = tizen.bluetooth.getLEAdapter();
    var UART_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
    var availableLeDeviceList = new LeDeviceCache();
    /**
     * Identifier of HTML element containing the page structure.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     * @const {string}
     */
    var PAGE_ID = 'le-devices-page',

        /**
         * Reference to HTML element containing the page structure.
         *
         * @memberof app.ui.leDevicesPage
         * @private
         * @type {HTMLElement}
         */
        pageElement = null,

        /**
         * Reference to HTML element containing the list of devices.
         *
         * @memberof app.ui.leDevicesPage
         * @private
         * @type {HTMLElement}
         */
        listElement = null;


    /**
     * Bluetooth devices comparator. Used to sort list of devices.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     * @param {BluetoothDevice}
     *            device1
     * @param {BluetoothDevice}
     *            device2
     * @returns {number}
     */
    function compareDevices(device1, device2) {
        var device1Rate = 0, device2Rate = 0;

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
     * Toggles scanning UI state to specified boolean value. It manages proper
     * CSS class which is responsible for showing/hiding buttons and
     * "processing" component.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     * @param {boolean}
     *            ongoing
     */
    function toggleScanning(ongoing) {
        if (ongoing) {
            pageElement.classList.add('state-scanning');
        } else {
            pageElement.classList.remove('state-scanning');
        }
    }

    /**
     * Handles retrieval of a list of Bluetooth devices that were known to the
     * local Bluetooth adapter.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     * @param {BluetoothDevice[]}
     *            devices
     */
    function onKnownDevicesObtained(devices) {
        var content = '', i, length = devices.length, device = null, status = '', cssClass = '';

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
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function refresh() {
        getKnownLEDevices(onKnownDevicesObtained);
    }

    /**
     * Handles "pagebeforeshow" event for the page. Refreshes the content of the
     * page.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function onPageBeforeShow() {
        refresh();
    }

    /**
     * Handles "pagehide" event for the page. Cleans up the page.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function onPageHide() {
        adapter.stopScan();
        if (remoteDevice) {
            remoteDevice.disconnect();
            alert("disconnected from remoteDevice" + remoteDevice);
            remoteDevice = null;
        }
        toggleScanning(false);
        listElement.innerHTML = '';

    }

    /**
     * Handles end of scan (discovering) process. Restores UI to default state.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function onScanFinished() {
        toggleScanning(false);
        adapter.stopScan();
    }

    /**
     * Handles click event on "Scan" button. Starts discovering of nearby
     * Bluetooth devices.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function onScanStartClick() {
        toggleScanning(true);
        adapter.startScan(onDeviceFound);
    }


    // Looking for a Low Energy Devices, Connection, and
    function onDeviceFound(device) {
        if (availableLeDeviceList.addToCache(device)) {
            listElement.insertAdjacentHTML('beforeend', app.ui.templates
                .getDeviceListElement({
                    address: device.address,
                    name: device.name,
                    status: 'Available',
                    cssClasses: ['device-available']
                }));
        }        // onScanFinished();
    }

    function connectToSelectedDevice(device) {
        if (device.address == "DF:C2:17:8E:D9:EE") {
            alert("connecting to flicktek");
            if (remoteDevice === null) {
                remoteDevice = device;
                alert(
                    "Found device name: " + device.name
                    + " address: " + device.address
                );
                connectDevice(device);
            }
            else {
                alert("Already connected!!");
            }
        } else {
            alert("It is not flicktek!!");
        }
    }

    function connectDevice(device) {
        device.connect(onConnected.bind(null, device), connectFail);

    }

    function onConnected(device) {
        alert("Connected to device - " + device.name);
        var serviceUUIDs = device.uuids;
        // alert("UUIDS read");
        // alert(
        //     "remoteDevice.uuids: " + serviceUUIDs + "; "
        //     +
        //     "length: " + serviceUUIDs.length
        // );
        var service = device.getService(serviceUUIDs[0]);
        alert("Service UUID " + service.uuid);
        showGATTService(device, service);

    }

    function subscribeOnData() {
        alert("subscribedOnData");
        var advertise = new tizen.BluetoothLEAdvertiseData();
        advertise.includeName = true;
        advertise.solicitationuuids = UART_SERVICE_UUID;
        adapter.startAdvertise(advertise, "ADVERTISE", function onstate(state) {
            alert("Advertiser state: " + state);
        }, function (e) {
            alert("Failed to startAdvertise: " + e.message);
        }, "BALANCED", true);

    }

    function showGATTService(device, service) {
        // var service = device.getService(serviceUUIDs[0]);
        alert('Service ' + service.uuid + '. \n' +
            'Has ' + service.characteristics.length + ' characteristics');

        var serviceData = device.serviceData;
        var data = "";
        for (var i = 0; i < serviceData.length; i++)
        {

            data += serviceData[i].id + serviceData[i].data + "\n";
        }
        alert("Service data found: " + data);

        // for (var i = 0; i < service.characteristics.length; ++i) {
        //     alert(i);
            // var characteristic = service.characteristics[i];
            // alert("current characteristic: " + JSON.stringify(characteristic));
            // if (characteristic.isReadable) {
            //     alert("characteristic is readable");
            //     characteristic.readValue(function (val) {
            //         alert("Value read: " + i + val);
            //     });
            // }
            // {
            //     alert("Value read: " + val);
            //     device.disconnect();
            // });
            // alert("Subservices UUID " + JSON.stringify(service.characteristics[i].descriptors));
        // }

        // for (var i = 0; i < service.services.length; i++) {
        //     showGATTService(service.services[i], indent + '   ');
        // }

    }

    function readSuccess(value) {
        alert('Characteristic value: ' + value);
    }

    function readFail(error) {
        alert('readValue() failed: ' + error);
    }

    // Looking for a Low Energy Devices
    function OnScanSuccess(device) {
        var adapter = tizen.bluetooth.getLEAdapter();

        listElement.insertAdjacentHTML('beforeend', app.ui.templates
            .getDeviceListElement({
                address: device.address,
                name: device.name,
                status: 'Available',
                cssClasses: ['device-available']
            }));

//		device.connect(connectSuccess, connectFail);

        if (remoteDevice === null) {
            remoteDevice = device;
            console.log('Found device ' + device.name + '. Connecting...');


        }

        adapter.stopScan();
        toggleScanning(false);
    }

    function connectSuccess() {
        alert('Connected');
    }

    function connectFail() {
        remoteDevice = null;
        alert('Connection Failed');
    }

    /**
     * Handles click event on "Stop" button. Stops process of discovering of
     * nearby Bluetooth devices.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function onScanStopClick() {
        toggleScanning(false);
        var adapter = tizen.bluetooth.getLEAdapter();
        adapter.stopScan();
    }

    /**
     * Handles click on list element. Determines clicked list item and shows
     * device info page.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     * @param {event}
     *
     */
    function onListClick(event) {
        alert("onListClick");
        onScanFinished();
        var targetItem = app.common.closestElement(event.target, 'li');

        alert(targetItem);
        alert(JSON.stringify(targetItem.dataset.address));
        if (!targetItem) {
            alert("targetItem does not exist");
            return;
        }
        if (availableLeDeviceList.getFromCache(targetItem.dataset)) {
            connectToSelectedDevice(availableLeDeviceList.getFromCache(targetItem.dataset));
            // alert("looking for service data");
            //
            // var serviceData = availableLeDeviceList.getFromCache(targetItem.dataset).serviceData;
            // alert("Service data found: " + JSON.stringify(serviceData));
        }

        // app.ui.deviceInfoPage.show(targetItem.dataset.address);
    }

    /**
     * Binds HTML elements to variables to improve access time.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function bindElements() {
        pageElement = document.getElementById(PAGE_ID);
        listElement = pageElement.querySelector('ul');
    }

    /**
     * Registers event listeners for the module.
     *
     * @memberof app.ui.leDevicesPage
     * @private
     */
    function bindEvents() {
        // bind UI events
        pageElement.addEventListener('pagebeforeshow', onPageBeforeShow);
        pageElement.addEventListener('pagehide', onPageHide);
        pageElement.querySelector('#le-devices-scan-button').addEventListener(
            'click', onScanStartClick);
        pageElement.querySelector('#le-devices-scan-stop-button')
            .addEventListener('click', onScanStopClick);
        listElement.addEventListener('click', onListClick);
    }

    /**
     * Initializes the module.
     *
     * @memberof app.ui.leDevicesPage
     * @public
     */
    function init() {
        // alert(JSON.stringify(window.navigator));
        bindElements();
        bindEvents();
    }

    app.ui = app.ui || {};
    app.ui.leDevicesPage = {
        init: init
    };

    function getKnownLEDevices(successCallback) {
        successCallback(availableLeDeviceList.getCache());
    }

    /*
implement caching of LE devices
by kent1ukr
 */

    function LeDeviceCache() {
        // this is constructor
        this.cache = [];
    }

    LeDeviceCache.prototype.addToCache = function (a) {
        if (!this.cache.length || !this.get(a.address)) {
            this.cache.push(a);
            return true;
        }
        return false;
    };
    LeDeviceCache.prototype.getCache = function () {
        return this.cache;
    };
    LeDeviceCache.prototype.getFromCache = function (a) {
        var cacheLength = this.cache.length;
        for (var i = 0; i < cacheLength; i++) {
            if (this.cache[i].address === a.address) {
                alert("already exist");
                return this.cache[i];
            }
        }
        return null;
    };
    LeDeviceCache.prototype.clearCache = function () {
        this.cache = [];
    };


})(window.app);
