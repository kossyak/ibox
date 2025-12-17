<p align="center">
<img src="./logo.svg" width="220px" alt="logo">
</p>
<p align="center">
A lightweight modern library for seamless two-way communication between a main application and an iframe.
</p>


## Features
- **Zero-Dependency:** Pure JavaScript implementation.
- **Secure:** Uses `MessageChannel` and strict `origin` validation to prevent data leakage.
- **Performance:** Direct communication via `MessagePort` bypasses the global window message bus.
- **Reliable:** Built-in handshake mechanism to ensure the connection is established only when both sides are ready.

---

## Usage

### 1. Main Application (Host)

Initialize the communication by providing the iframe element and the expected origin of the child application.

```html
<script src="https://cdn.jsdelivr.net/gh/kossyak/iboxjs@latest/ibox.min.js"></script>
```

```javascript
const iframe = document.querySelector('#my-iframe')
const messenger = ibox.host(iframe, 'https://child-app.com')

// Listen for events from the iframe
messenger.on('request_data', (data) => {
  console.log('Iframe requested:', data)
});

// Send events to the iframe
messenger.emit('set_theme', { color: 'blue' })

// Cleanup when needed
// messenger.destroy()
```
### 2. Iframe Application (Client)

The client method returns a Promise that resolves once the secure channel is established with the host.
```html
<script src="https://cdn.jsdelivr.net/gh/kossyak/iboxjs@latest/ibox.min.js"></script>
```
```javascript
// Wait for the connection to be established
const messenger = await ibox.client('https://parent-app.com')

// Listen for events from the parent
messenger.on('set_theme', (data) => {
    document.body.style.backgroundColor = data.color
})

// Send events to the parent
messenger.emit('request_data', { id: 123 })

// Cleanup when needed
// messenger.destroy()
```

---

## API Reference
ibox.host(iframeElement, targetOrigin)

- **iframeElement:** The HTMLIFrameElement to communicate with.
- **targetOrigin:** The specific origin (e.g., https://example.com) of the iframe content.
- **Returns:** An object containing emit, on, and destroy methods.

ibox.client(hostOrigin)

- **hostOrigin:** The specific origin of the parent application.
- **Returns:** A Promise that resolves to an object containing emit, on, and destroy methods.

### Handling Iframe Navigation

If you need to change the iframe source or reload it, you must destroy the old connection and establish a new one to ensure the secure channel is re-initialized correctly.

```javascript
// 1. Destroy the current connection
messenger.destroy()

// 2. Change the source
iframe.src = 'new-app-origin.com'

// 3. Re-initialize the host when needed
const newMessenger = ibox.host(iframe, 'https://new-app-origin.com')
```

### Interface Methods:

- **on(event, callback):** Registers a listener for a specific event name.
- **emit(event, data):** Sends a data payload to the other side.
- **destroy():** Closes the message port and removes internal event listeners.

---

## Security Best Practices
Always specify an explicit origin instead of *. This ensures that:

1. Your data is only sent to the intended recipient.
2. Your application only executes commands received from a trusted parent/child.
