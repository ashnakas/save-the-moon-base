# Mission 02: Gateway Explorer

An independent browser-based visitor prototype inspired by GVIS's Gateway Power and Propulsion Element visualization. Geometry is procedural and illustrative, not NASA CAD, a complete Gateway configuration, an engineering simulation, or a digital twin.

## Explore

- Drag or use arrow keys to orbit the station. Scroll, use +/−, or pinch the touchscreen to zoom. Reset view returns to the overview without clearing discoveries.
- Enable hand control to request the webcam and load the existing MediaPipe model. Pinch thumb and index finger on one hand and move to rotate. Pinch both hands and spread them apart to zoom in, or bring them together to zoom out. Release pinches to hold the view. Losing hands resets anchors; reacquisition does not jump the camera.
- Select solar arrays, electric thrusters, and habitat from the component list, or click/tap their geometry. Each focuses the camera and reveals an explanation. Three discoveries complete the activity; exploration can continue without a timer.
- Engineering view reveals illustrative energy connections and thruster plumes. These are explanatory graphics, not measured power or exhaust data.

Camera processing stays on the device and streams are stopped on disconnect or leaving the page. External model downloads use the same Google Storage/jsDelivr endpoints as Mission 01. No new package installation, paid API, or build step is required. GitHub Pages packages this folder automatically with the existing site.

## Rendering and checks

Three.js is reused from ../vendor. A software triangle renderer keeps the same scene, camera orbit, zoom, and selection available if WebGL is unavailable. Reduced motion disables decorative energy movement. Mobile presents the viewer above the instructions and component list.

Checks cover gesture transitions, zoom/rotation bounds, software render and picking, mirrored landmark extraction, two-hand model configuration, missing-hand reset, camera-track release, and single-hand compatibility. Real two-hand recognition and comfort need testing with a webcam and people; synthetic landmarks cannot validate recognition quality under real lighting.

Project context: https://www.nasa.gov/centers-and-facilities/glenn/gvis-conceptual-visual-designs/
