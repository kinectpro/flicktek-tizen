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
		var content = '', i = 0, length = devices.length, device = null, status = '', cssClass = '';

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
				address : device.address,
				name : device.name,
				status : status,
				cssClasses : [ cssClass ]
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
		app.model.getKnownDevices(onKnownDevicesObtained);
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

		var adapter = tizen.bluetooth.getLEAdapter();

		adapter.startScan(onDeviceFound);
	}
	
	var remoteDevice = null;

	// Looking for a Low Energy Devices, Connection, and 
	function onDeviceFound(device)
	 {
		listElement.insertAdjacentHTML('beforeend', app.ui.templates
				.getDeviceListElement({
					address : device.address,
					name : device.name,
					status : 'Available',
					cssClasses : [ 'device-available' ]
				}));
		
	    if (remoteDevice === null)
	    {
	       remoteDevice = device;
	       alert("Found device name: " + device.name + " txpowerlevel: " + device.txpowerlevel + "  . Connecting...");
	       device.connect(function connectSuccess()
	        {        
	          alert("Connected to device");
	          
	          toggleScanning(false);
	         
	          var i = 0, service = null;
	          var serviceUUIDs = remoteDevice.uuids;
	          alert("remoteDevice.uuids: "+ serviceUUIDs);
	          console.log("remoteDevice.uuids.length :"+ serviceUUIDs.length);
	          for (i; i < serviceUUIDs.length; i++)
	          {
	             service = remoteDevice.getService(serviceUUIDs[i]);
	             showGATTService(service);
	          }         
	        
	        }  , connectFail);            
	    }
	    adapter.stopScan();
	 }
	
	function connectFail(e){
		alert("Connection failed:" + e.messsage)
	}
	
	function showGATTService(service, indent) {
	    if (indent === undefined) {
	        indent = '';
	    }

	    alert(indent + 'Service ' + service.uuid + '. Has ' + service.characteristics.length +
	                ' characteristics and ' + service.services.length + ' sub-services.');
	    
	    alert(service.charactrestics.toString());

	    for (var i = 0; i < service.services.length; i++) {
	        showGATTService(service.services[i], indent + '   ');
	    }
	    
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
					address : device.address,
					name : device.name,
					status : 'Available',
					cssClasses : [ 'device-available' ]
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
		console.log("Connected");
		alert('Connected');
	}
	
	function connectFail() {
		console.log("Connection Failed");
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
	 * @param {MouseEvent}
	 *            event
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
		bindElements();
		bindEvents();
	}

	app.ui = app.ui || {};
	app.ui.leDevicesPage = {
		init : init
	};

})(window.app);
