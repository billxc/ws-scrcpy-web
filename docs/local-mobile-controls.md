# Local mobile stream controls

This checkout extends upstream v0.5.3 for the NAS trial. No upstream push.

- `StreamToolbar` reorganizes existing Android controls into a right-hand Back/Home/Overview/More rail, with 44px touch targets. Other controls remain in a scrollable More panel.
- Header shortcuts expose fullscreen and video bitrate. Fullscreen uses the modal frame (not the dialog) and falls back to page fullscreen when the browser rejects the native API. Exit and close remain in More.
- Video bitrate presets: 0.5, 1, 2, 4 and 8 Mbps; custom 0.25–50 Mbps. Changes use existing video-setting persistence and reconnect the scrcpy session with the new encoder bitrate. Defaults are unchanged.
- Traffic estimate uses decimal MB/minute (Mbps × 7.5), video only; audio and network overhead are additional. Bitrate is an encoder target, not an exact metered traffic cap.
- Android navigation uses pointer down/up/cancel plus capture, rather than mouse-only events.
- Layout uses dynamic viewport height and safe-area insets. No auto-rotation or transport/backend changes.

Validation: TypeScript check; six focused toolbar/clipboard unit tests; sandboxed Chromium mobile portrait/landscape and fullscreen; actual HTTPS stream reconnect at 500000 bps confirmed both in WebSocket URL and Android scrcpy process arguments; decoded frames resumed; setting survived reopening. No Android/game navigation was sent. Real iOS Safari and WireGuard traffic measurements remain unverified.

The upstream Vitest default setup failed before collecting tests in this environment (`No such built-in module: node:`). These DOM-only tests were run with an isolated frontend-only config without the server/global setup.

Local deployment and rollback details live outside Git at `/home/xiaochen/ai/ws-scrcpy-web-local/DEPLOYMENT.md`.
