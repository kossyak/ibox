(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory()
    } else {
        root.ibox = factory()
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict'
    return {
        host: function (iframeElement, targetOrigin) {
            const channel = new MessageChannel()
            const port = channel.port1
            const init = (e) => {
                if (e.origin !== targetOrigin || e.data !== 'IBOX_READY') return
                iframeElement.contentWindow.postMessage('IBOX_PORT', targetOrigin, [channel.port2])
                window.removeEventListener('message', init)
                port.start()
            }
            window.addEventListener('message', init)
            return {
                emit: function (event, data) {
                    port.postMessage({ event, data })
                },
                on: function (event, callback) {
                    port.addEventListener('message', (e) => {
                        if (e.data.event === event) callback(e.data.data)
                    })
                },
                destroy: function () {
                    port.close();
                    window.removeEventListener('message', init)
                }
            }
        },
        client: function (hostOrigin) {
            return new Promise((resolve) => {
                window.parent.postMessage('IBOX_READY', hostOrigin)
                const getPort = (e) => {
                    if (e.origin !== hostOrigin || e.data !== 'IBOX_PORT') return
                    const port = e.ports[0]
                    port.start()
                    window.removeEventListener('message', getPort)
                    resolve({
                        emit: function (event, data) {
                            port.postMessage({ event, data })
                        },
                        on: function (event, callback) {
                            port.addEventListener('message', (e) => {
                                if (e.data.event === event) callback(e.data.data)
                            });
                        },
                        destroy: function () {
                            port.close()
                        }
                    })
                }
                window.addEventListener('message', getPort)
            })
        }
    }
}))
