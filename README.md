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
import BpmnJsImprovedCanvas from '@bpmn-io/improved-canvas';

const bpmnJS = new BpmnJS({
  additionalModules: [
    BpmnJsImprovedCanvas
  ]
})
```

Alternatively, you can imoprt individual modules:
```javascript
import highContrastCanvas from '@bpmn-io/improved-canvas/lib/HighContrastCanvas';
```

## License

MIT
