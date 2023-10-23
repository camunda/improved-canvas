# @bpmn-io/improved-canvas

Improvements or reworks of the bpmn-js canvas.

Includes related adjustments to web modeler styles.

## Installation

Install via npm.

```
npm install @bpmn-io/improved-canvas
```

## Usage

```javascript
import ImprovedCanvasModule from '@bpmn-io/improved-canvas';

const bpmnJS = new BpmnJS({
  additionalModules: [
    ImprovedCanvasModule
  ]
})
```

Alternatively, you can import individual modules:
```javascript
import { HighContrastCanvasModule } from '@bpmn-io/improved-canvas';
```

## License

MIT
