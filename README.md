# @camunda/improved-canvas

[![Build Status](https://github.com/camunda/improved-canvas/workflows/CI/badge.svg)](https://github.com/camunda/improved-canvas/actions?query=workflow:CI)

Improvements or reworks of the bpmn-js canvas.

## Installation

Install via npm.

```
npm install @camunda/improved-canvas
```

## Usage

For the BPMN modeler use the `BpmnImprovedCanvasModule`.

```javascript
import { BpmnImprovedCanvasModule } from '@camunda/improved-canvas';

const modeler = new Modeler({
  additionalModules: [
    BpmnImprovedCanvasModule
  ]
});
```

For the BPMN viewer use the `HighContrastCanvasModule`.

```javascript
import { HighContrastCanvasModule } from '@camunda/improved-canvas';

const viewer = new NavigatedViewer({
  additionalModules: [
    HighContrastCanvasModule
  ]
});
```

## License

MIT
