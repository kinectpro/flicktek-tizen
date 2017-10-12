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

/*global window, tizen, console*/

/**
 * The application model module.
 * Provides methods which allow manage the Bluetooth.
 *
 * @module app.model
 * @requires {@link app.common}
 * @namespace app.model
 * @memberof app
 */

// make sure that "app" namespace is created
window.app = window.app || {};

(function defineAppModel(app) {
    'use strict';

    /**
     * A universally unique identifier (UUID) of the service.
     *
     * @memberof app.model
     * @priavte
     * @const {string}
     */
    var SERVICE_UUID = '483A1980-991C-11E6-BDF4-0800200C9A66',

        /**
         * Readable name of the service.
         *
         * @memberof app.model
         * @priavte
         * @const {string}
         */
        SERVICE_NAME = 'Files exchange service',

        /**
         * Codes for the erros which may occur during sending file process.
         *
         * @memberof app.model
         * @public
         * @const {object<string, string>}
        */
        SEND_FILE_ERROR = Object.freeze({
            FILE_ERROR: 'FILE_ERROR',
            CONNECTION_ERROR: 'CONNECTION_ERROR',
            NOT_SUPPORTED_ERROR: 'NOT_SUPPORTED_ERROR',
            INTERNAL_ERROR: 'INTERNAL_ERROR'
        }),

        /**
         * Codes for available files exchange service respones.
         * Each message to the service results with the response containing
         * information if it was successfully processed.
         *
         * @memberof app.model
         * @private
         * @const {object<string, number>}
         */
        SEND_FILE_PROTOCOL_RESPONSE = Object.freeze({
            OK: 0
        }),

        /**
         * Maximum size of file chunk (in bytes) which may be sent
         * in one message to the service.
         *
         * @memberof app.model
         * @private
         * @const {number}
         */
        SEND_FILE_MAX_BYTES_PER_MESSAGE = 1024,

        /**
         * Virtual root key for downloads directory.
         * The downloads directory is used by the service as a default
         * location for received files.
         *
         * @memberof app.model
         * @private
         * @const {string}
         */
        DOWNLOADS_VIRTUAL_ROOT_KEY = 'downloads',

        /**
         * Default local Bluetooth adapter.
         *
         * @memberof app.model
         * @priavte
         * @type {BluetoothAdapter}
         */
        adapter = null,

        /**
         * Handler for Bluetooth service.
         * Provides methods to manage it (e.g. receiving connections,
         * unregistering).
         *
         * @memberof app.model
         * @priavte
         * @type {BluetoothServiceHandler}
         */
        serviceHandler = null;

    /**
     * Returns true if the Bluetooth adapter is currently on, false otherwise.
     *
     * @memberof app.model
     * @public
     * @returns {boolean}
     */
    function isPowered() {
        return !!(adapter && adapter.powered);
    }

    /**
     * Returns true if the Bluetooth adapter is visible (local device
     * is discoverable by remote devices), false otherwise.
     *
     * @memberof app.model
     * @public
     * @returns {boolean}
     */
    function isVisible() {
        return !!(adapter && adapter.visible);
    }

    /**
     * Returns readable name of the Bluetooth adapter.
     *
     * @memberof app.model
     * @public
     * @returns {string}
     */
    function getName() {
        return adapter ? adapter.name : '';
    }

    /**
     * Returns (via callback) all the known devices that have information
     * stored in the local Bluetooth adapter.
     *  A known device is one of the following:
     *  - a bonded device,
     *  - a device found in last inquiry process.
     *
     * @memberof app.model
     * @public
     * @param {function} successCallback
     * @param {function} [errorCallback]
     */
    function getKnownDevices(successCallback, errorCallback) {
        try {
            adapter.getKnownDevices(successCallback, errorCallback || null);
        } catch (error) {
            console.error('unable to get known devices', error);
            if (errorCallback) {
                errorCallback(error);
            }
        }
    }

    /**
     * Discovers nearby Bluetooth devices.
     *
     * @memberof app.model
     * @public
     * @param {BluetoothDiscoverDevicesSuccessCallback} successCallback
     * @param {function} [errorCallback]
     */
    function discoverDevices(successCallback, errorCallback) {
        try {
            adapter.discoverDevices(successCallback, errorCallback || null);
        } catch (error) {
            if (errorCallback) {
                errorCallback(error);
            }
        }
    }

    /**
     * Cancels an active discovery session.
     *
     * @memberof app.model
     * @public
     * @param {function} [successCallback]
     * @param {function} [errorCallback]
     */
    function stopDiscovery(successCallback, errorCallback) {
        try {
            adapter.stopDiscovery(successCallback || null,
                errorCallback || null);
        } catch (error) {
            if (errorCallback) {
                errorCallback(error);
            }
        }
    }

    /**
     * Returns (via callback) BluetoothDevice object for a given device
     * hardware address.
     *
     * @memberof app.model
     * @public
     * @param {string} address
     * @param {function} successCallback
     * @param {function} [errorCallback]
     */
    function getDevice(address, successCallback, errorCallback) {
        try {
            adapter.getDevice(address, successCallback, errorCallback || null);
        } catch (error) {
            if (errorCallback) {
                errorCallback(error);
            }
        }
    }

    /**
     * Creates a bond with a remote device by initiating the bonding process
     * with peer device, using the given hardware address.
     *
     * @memberof app.model
     * @public
     * @param {string} address
     * @param {function} successCallback
     * @param {function} [errorCallback]
     */
    function createBonding(address, successCallback, errorCallback) {
        try {
            adapter.createBonding(address, successCallback,
                errorCallback || null);
        } catch (error) {
            if (errorCallback) {
                errorCallback();
            }
        }
    }

    /**
     * Destroys the bond with a remote device.
     *
     * @memberof app.model
     * @public
     * @param {string} address
     * @param {function} successCallback
     * @param {function} [errorCallback]
     */
    function destroyBonding(address, successCallback, errorCallback) {
        try {
            adapter.destroyBonding(address, successCallback,
                errorCallback || null);
        } catch (error) {
            if (errorCallback) {
                errorCallback();
            }
        }
    }

    /**
     * Returns true if specified device supports sending files.
     *
     * @memberof app.model
     * @public
     * @param {BluetoothDevice} device
     * @returns {boolean}
     */
    function supportsSendingFiles(device) {
        return device.uuids.indexOf(SERVICE_UUID) !== -1;
    }

    /**
     * Initializes default Bluetooth adapter.
     *
     * @memberof app.model
     * @private
     */
    function initAdapter() {
        try {
            adapter = tizen.bluetooth.getDefaultAdapter();
        } catch (error) {
            console.error('Unable to obtain default adapter', error);
        }
    }

    /**
     * Cleans up server connection (session object).
     *
     * @memberof app.model
     * @private
     * @param {object} session
     */
    function cleanServerConnection(session) {
        if (session.stream) {
            session.stream.close();
            session.stream = null;
        }

        if (session.file) {
            session.file = null;
        }

        session.cleaned = true;
    }

    /**
     * Closes server connection.
     * It also triggers cleaning the connection data (session).
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     */
    function closeServerConnection(socket, session) {
        cleanServerConnection(session);

        try {
            socket.close();
        } catch (error) {
            console.error('Error during closing server connection', error);
        }
    }

    /**
     * Handles close of the server socket.
     * Triggers connection data cleaning (if it is necessary).
     *
     * @memberof app.model
     * @private
     * @param {object} session
     */
    function onServerSocketClose(session) {
        if (!session.cleaned) {
            cleanServerConnection(session);
        }
    }

    /**
     * Handles message (received by the server) containing information about
     * file name.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     * @param {byte[]} message
     */
    function handleServerFileNameMessage(socket, session, message) {
        session.fileName = app.common.bytesArrayToString(message);

        try {
            session.file = session.downloads.resolve(session.fileName);
        } catch (resolveError) {
            try {
                session.file = session.downloads.createFile(
                    session.fileName);
            } catch (createError) {
                closeServerConnection(socket, session);
                return;
            }
        }

        try {
            session.file.openStream('w',
                function onStreamOpened(stream) {
                    session.stream = stream;
                    socket.writeData([SEND_FILE_PROTOCOL_RESPONSE.OK]);
                },
                function onStreamOpenError() {
                    closeServerConnection(socket, session);
                }
            );
        } catch (error) {
            console.error('Error during handling file name message', error);
            closeServerConnection(socket, session);
        }
    }

    /**
     * Handles message (received by the server) containing information about
     * file size.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     * @param {byte[]} message
     */
    function handleServerFileSizeMessage(socket, session, message) {
        try {
            session.fileSize = window.parseInt(
                app.common.bytesArrayToString(message), 10);
            session.received = 0;

            socket.writeData([SEND_FILE_PROTOCOL_RESPONSE.OK]);

            if (session.fileSize === 0) {
                closeServerConnection(socket, session);
            }
        } catch (error) {
            console.error('Error during handling file size message', error);
            closeServerConnection(socket, session);
        }
    }

    /**
     * Handles message (received by the server) containing file chunk data.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     * @param {byte[]} message
     * @fires "model.file.received"
     */
    function handleServerFileChunkMessage(socket, session, message) {
        var details = null;

        try {
            message.forEach(function onEachMessageByte(value, index) {
                message[index] = value & 0xFF;
            });

            session.stream.writeBytes(message);
            session.received += message.length;

            socket.writeData([SEND_FILE_PROTOCOL_RESPONSE.OK]);

            if (session.received >= session.fileSize) {
                details = {
                    fileName: session.fileName
                };
                closeServerConnection(socket, session);
                app.common.dispatchEvent('model.file.received', details);
            }
        } catch (error) {
            console.error('Error during handling file chunk message', error);
            closeServerConnection(socket, session);
        }
    }

    /**
     * Handles message received by the server socket.
     * The protocol for exchanging file requires that:
     * - first message contains file name,
     * - second message contains file size,
     * - next messages contain file data.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     */
    function onServerSocketMessage(socket, session) {
        var message = null;

        try {
            message = socket.readData();
        } catch (error) {
            console.error('Unable to read socket message data', error);
            closeServerConnection(socket, session);
            return;
        }

        if (!session.file) {
            handleServerFileNameMessage(socket, session, message);
            return;
        }

        if (!session.fileSize) {
            handleServerFileSizeMessage(socket, session, message);
            return;
        }

        handleServerFileChunkMessage(socket, session, message);
    }

    /**
     * Called when a remote device is connected successfully to the service.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     */
    function onServiceConnection(socket) {
        var session = {};

        socket.onmessage = onServerSocketMessage.bind(null, socket, session);
        socket.onclose = onServerSocketClose.bind(null, session);

        try {
            tizen.filesystem.resolve(
                DOWNLOADS_VIRTUAL_ROOT_KEY,
                function onDownloadsDirectoryResolved(downloads) {
                    session.downloads = downloads;

                    socket.writeData([SEND_FILE_PROTOCOL_RESPONSE.OK]);
                },
                function onDownloadsDirectoryResolveError(error) {
                    console.error('Unable to resolve downloads directory',
                        error);
                    closeServerConnection(socket, session);
                }
            );
        } catch (error) {
            console.error('Unable to resolve downloads directory', error);
            closeServerConnection(socket, session);
        }
    }

    /**
     * Handles success of service registration.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothServiceHandler} handler
     */
    function onServiceRegistered(handler) {
        serviceHandler = handler;

        serviceHandler.onconnect = onServiceConnection;
    }

    /**
     * Handles errors occurred during service registration.
     *
     * @memberof app.model
     * @private
     * @param {Error} error
     */
    function onServiceRegistrationError(error) {
        console.error('Unable to register service', error);
    }

    /**
     * Register service which is responsible for sending/receiving files.
     *
     * @memberof app.model
     * @private
     */
    function registerService() {
        if (!adapter || serviceHandler) {
            return;
        }

        try {
            adapter.registerRFCOMMServiceByUUID(
                SERVICE_UUID,
                SERVICE_NAME,
                onServiceRegistered,
                onServiceRegistrationError
            );
        } catch (error) {
            console.error('Unable to register service', error);
        }
    }

    /**
     * Sets up default Bluetooth adapter listener.
     * It listens to state, visibility and name changes.
     *
     * @memberof app.model
     * @private
     */
    function setupAdapterChangeListener() {
        if (!adapter) {
            return;
        }

        try {
            adapter.setChangeListener({
                onstatechanged: function onStateChanged(powered) {
                    app.common.dispatchEvent('model.state.changed', powered);

                    if (powered) {
                        registerService();
                    }
                },
                onnamechanged: function onNameChanged(name) {
                    app.common.dispatchEvent('model.name.changed', name);
                },
                onvisibilitychanged: function onVisibilityChanged(visible) {
                    app.common
                        .dispatchEvent('model.visibility.changed', visible);
                }
            });
        } catch (error) {
            console.error('Unable to set up adapter listener', error);
        }
    }

    /**
     * Cleans up client connection (session object).
     *
     * @memberof app.model
     * @private
     * @param {object} session
     */
    function cleanClientConnection(session) {
        if (session.stream) {
            session.stream.close();
        }

        session.file = null;
        session.stream = null;
        session.cleaned = true;
    }

    /**
     * Closes client connection.
     * It also triggers cleaning the connection data (session).
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     */
    function closeClientConnection(socket, session) {
        cleanClientConnection(session);

        try {
            socket.close();
        } catch (error) {
            console.error('Error during closing client connection', error);
        }
    }

    /**
     * Handles close of the client socket.
     * Triggers connection data cleaning (if it necessary).
     *
     * @memberof app.model
     * @private
     * @param {object} session
     * @param {object} callbacks
     * @param {function} callbacks.onSuccess
     * @param {function} callbacks.onError
     * @param {function} callbacks.onProgress
     */
    function onClientSocketClose(session, callbacks) {
        if (!session.cleaned) {
            cleanClientConnection(session);
            callbacks.onError(SEND_FILE_ERROR.INTERNAL_ERROR);
        }
    }

    /**
     * Sends client message containing information about file name.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     */
    function sendClientFileNameMessage(socket, session) {
        var message = null;

        session.fileNameSent = true;
        message = app.common.stringToBytesArray(session.file.name);
        socket.writeData(message);
    }

    /**
     * Sends client message containing information about file size.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     */
    function sendClientFileSizeMessage(socket, session) {
        var message = null;

        session.fileSizeSent = true;
        message = app.common.stringToBytesArray(
            session.file.fileSize.toString());
        session.fileSize = session.file.fileSize;
        socket.writeData(message);
    }

    /**
     * Sends client message containing file data (file chunk).
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     */
    function sendClientFileChunkMessage(socket, session) {
        var bytesAvailable = session.stream.bytesAvailable;

        socket.writeData(session.stream.readBytes(
            bytesAvailable > SEND_FILE_MAX_BYTES_PER_MESSAGE ?
                SEND_FILE_MAX_BYTES_PER_MESSAGE : bytesAvailable
        ));
    }

    /**
     * Handles message received by the client socket.
     * Triggers sending next client message according to the protocol:
     * - first message contains file name,
     * - second message contains file size,
     * - next messages contain file data.
     *
     * @memberof app.model
     * @private
     * @param {BluetoothSocket} socket
     * @param {object} session
     * @param {object} callbacks
     * @param {function} callbacks.onSuccess
     * @param {function} callbacks.onError
     * @param {function} callbacks.onProgress
     */
    function onClientSocketMessage(socket, session, callbacks) {
        try {
            var message = socket.readData();

            if (message[0] !== SEND_FILE_PROTOCOL_RESPONSE.OK) {
                closeClientConnection(socket, session);
                callbacks.onError(SEND_FILE_ERROR.INTERNAL_ERROR);
                return;
            }

            if (!session.fileNameSent) {
                sendClientFileNameMessage(socket, session);
                return;
            }

            if (!session.fileSizeSent) {
                sendClientFileSizeMessage(socket, session);
                return;
            }

            if (session.stream && session.stream.eof) {
                closeClientConnection(socket, session);
                callbacks.onSuccess();
            } else if (session.stream) {
                sendClientFileChunkMessage(socket, session);

                callbacks.onProgress(
                    session.stream.eof ?
                        session.fileSize : session.stream.position,
                    session.fileSize
                );
            }
        } catch (error) {
            console.error('Client message handling error', error);
            closeClientConnection(socket, session);
            callbacks.onError(SEND_FILE_ERROR.INTERNAL_ERROR);
        }
    }

    /**
     * Connects to specified Bluetooth device and transfers the file (stream
     * stored in session data).
     *
     * @param {BluetoothDevice} device
     * @param {object} session
     * @param {object} callbacks
     * @param {function} callbacks.onSuccess
     * @param {function} callbacks.onError
     * @param {function} callbacks.onProgress
     */
    function connectAndTransferFile(device, session, callbacks) {
        try {
            device.connectToServiceByUUID(SERVICE_UUID,
                function onConnected(socket) {
                    socket.onmessage = onClientSocketMessage
                        .bind(null, socket, session, callbacks);
                    socket.onclose = onClientSocketClose
                        .bind(null, session, callbacks);
                },
                function onConnectError() {
                    cleanClientConnection(session);
                    callbacks.onError(SEND_FILE_ERROR.CONNECTION_ERROR);
                }
            );
        } catch (error) {
            cleanClientConnection(session);
            callbacks.onError(SEND_FILE_ERROR.CONNECTION_ERROR);
        }
    }

    /**
     * Sends file to specified Bluetooth device.
     *
     * @param {BluetoothDevice} device
     * @param {string} location
     * @param {object} [callbacks]
     * @param {function} [callbacks.onSuccess]
     * @param {function} [callbacks.onError]
     * @param {function} [callbacks.onProgress]
     */
    function sendFile(device, location, callbacks) {
        var session = {},
            callbacksSafe = {};

        callbacks = callbacks || {};
        callbacksSafe.onSuccess = callbacks.onSuccess || app.common.noop;
        callbacksSafe.onProgress = callbacks.onProgress || app.common.noop;
        callbacksSafe.onError = callbacks.onError || app.common.noop;

        session.location = location;

        if (!supportsSendingFiles(device)) {
            callbacksSafe.onError(SEND_FILE_ERROR.NOT_SUPPORTED_ERROR);
        }

        try {
            tizen.filesystem.resolve(location,
                function onFileResolved(file) {
                    session.file = file;
                    try {
                        file.openStream('r',
                            function onStreamOpened(stream) {
                                session.stream = stream;
                                connectAndTransferFile(device, session,
                                    callbacksSafe);
                            },
                            function onStreamOpenError(error) {
                                console.error('Error during opening stream',
                                    error);
                                callbacksSafe.onError(
                                    SEND_FILE_ERROR.FILE_ERROR);
                            });
                    } catch (error) {
                        console.error('Error during opening stream', error);
                        callbacksSafe.onError(SEND_FILE_ERROR.FILE_ERROR);
                    }
                },
                function onFileResolveError(error) {
                    console.error('Error during resolving file', error);
                    callbacksSafe.onError(SEND_FILE_ERROR.FILE_ERROR);
                },
                'r'
            );
        } catch (error) {
            console.error('Error during resolving file', error);
            callbacksSafe.onError(SEND_FILE_ERROR.FILE_ERROR);
        }
    }

    /**
     * Initializes the module.
     *
     * @memberof app.model
     * @public
     */
    function init() {
        initAdapter();
        setupAdapterChangeListener();
        registerService();
    }

    /**
     * Terminates the module.
     * Unregisters the service if it is necessary.
     *
     * @memberof app.model
     * @public
     * @param {function} doneCallback
     */
    function terminate(doneCallback) {
        if (serviceHandler) {
            try {
                serviceHandler.unregister(
                    function onSuccess() {
                        doneCallback();
                    },
                    function onError(error) {
                        console.error('Unable to unregister service', error);
                        doneCallback();
                    }
                );
            } catch (error) {
                console.error('Unable to unregister service', error);
                doneCallback();
            }
        } else {
            doneCallback();
        }
    }

    app.model = {
        SEND_FILE_ERROR: SEND_FILE_ERROR,

        init: init,
        terminate: terminate,
        isPowered: isPowered,
        isVisible: isVisible,
        getName: getName,
        getKnownDevices: getKnownDevices,
        discoverDevices: discoverDevices,
        stopDiscovery: stopDiscovery,
        getDevice: getDevice,
        createBonding: createBonding,
        destroyBonding: destroyBonding,
        supportsSendingFiles: supportsSendingFiles,
        sendFile: sendFile
    };

})(window.app);
