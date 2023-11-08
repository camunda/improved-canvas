# @camunda/improved-canvas

Improvements or reworks of the bpmn-js canvas.

Includes related adjustments to web modeler styles.

## Installation

Install via npm.

```
npm install @camunda/improved-canvas
```

## Usage

```javascript
import ImprovedCanvasModule from '@camunda/improved-canvas';

const bpmnJS = new BpmnJS({
  additionalModules: [
    ImprovedCanvasModule
  ]
})
```

Alternatively, you can import individual modules:
```javascript
import { HighContrastCanvasModule } from '@camunda/improved-canvas';
```

## License

MIT
