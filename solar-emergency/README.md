# Solar Emergency

A free, independent NASA-inspired visitor experience by Ashna Kasireddy. A visitor rotates a solar array with a webcam-tracked hand, mouse, touchscreen, slider, or arrow keys. Collect sunlight to restore a lunar base's lights, communications, and habitat.

## Play

Open `https://ashnakas.github.io/save-the-moon-base/solar-emergency/` in Chrome or Edge. Choose webcam or mouse/touch. First compare two array positions in an untimed experiment: position A is saved automatically, then move the array and save position B. The readout compares current solar output at both positions. Begin the timed mission after saving B. Align the green marker with the yellow ring. Hold and follow the moving Sun. A fully aligned panel charges the base in about 19 seconds; the mission allows 45 seconds.

Webcam play needs browser camera permission and an internet connection to download the MediaPipe runtime/model. Show one hand in good light, with your palm facing the camera. Move left and right. Missing hand tracking pauses the timer and charging. Choose **MOUSE / TOUCH** at any time. **DISCONNECT CAMERA**, **EXIT**, or the automatic reset releases the camera. Nothing is recorded or uploaded. Model/library downloads contact Google Storage and jsDelivr; normal host network logs are separate from camera processing.

The camera activates only after the visitor clicks the webcam button. Success and retry screens return to the welcome screen after 25 seconds. Sound starts muted. Arrow keys work when the scene has focus; the range slider has native keyboard support. Reduced-motion preferences limit decorative animation.

## Run locally

From the repository folder, use a static HTTP server, for example `python3 -m http.server 8000`, then open `http://localhost:8000/solar-emergency/`. Opening `index.html` as a `file://` URL does not support JavaScript modules or webcam setup. No npm install, build step, paid API, account, backend, or API key is needed for this experience.

## Files and free hosting

- `index.html`, `style.css`: exhibit interface and responsive layout.
- `app.js`: mission flow, controls, recovery, sound, and lifecycle.
- `mission.js`: elapsed-time charging and completion rules.
- `scene.js`: Three.js procedural 3D lunar environment. `scene-flat.js` provides an automatic Canvas fallback when 3D graphics are unavailable.
- `camera.js`: local MediaPipe hand inference and camera lifecycle.
- `vendor/`: pinned Three.js 0.180.0 and MediaPipe Tasks Vision 0.10.21, with their upstream licenses.

The repository's GitHub Pages workflow packages these static files alongside the original standalone game in the root `index.html`. That original game remains at the root URL. The existing React/Next source remains available; regenerate the root standalone artifact when changing that older experience. New Solar Emergency edits are deployed directly without a compilation step.

## Educational scope

The landscape, base, astronaut, Earth and engineering readouts are stylized. This is a simplified panel-orientation and energy demonstration, not a NASA simulator, real lunar dataset, official NASA product, or actual mission telemetry. Current solar output is max(0, cos(panel angle − sun angle)). Stored battery power increases at 5.5 × output percentage points per second. This isolates angle of incidence and assumes fixed irradiance and idealized equipment; shadows, temperature, panel efficiency, and battery losses are omitted. The untimed experiment disconnects the simulated battery, holds the Sun fixed, and compares two positions. The mission then moves the Sun and charges the battery. The result connects testing a design visually with GVIS’s work; the experience has not yet been evaluated with children.

## Demonstration for Herb

Record 45–60 seconds showing both your physical movement and the screen:

1. Introduce it as a visitor-interaction proof of concept inspired by the lab tour conversation.
2. Enable the webcam and raise one hand. Show how the panel responds to left/right movement; save a second position and compare solar output.
3. Begin the mission. Align the panel and show current output changing while stored power grows and energy moves into the base. Briefly lower your hand to demonstrate the pause.
4. Finish the mission and show the restored base and educational takeaway.

Use your computer's existing screen recorder or phone. A shared playable link plus a short video lets someone assess both the interaction and the visual result. Test real hand tracking on the presentation computer before recording; lighting, camera placement, device performance, and browser permissions affect tracking.

## Validation

Mission logic is checked across 15, 30, 60 and 144 FPS, including stationary charging, camera-loss pause, timeout and retained progress. Browser checks cover desktop/mobile layout, keyboard controls, slider play through mission success, replay, and camera permission denial. Real visitor hand tracking requires an on-device check.
