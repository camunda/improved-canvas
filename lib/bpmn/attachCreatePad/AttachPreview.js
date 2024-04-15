/**
 * @typedef {import('diagram-js/lib/features/complex-preview/ComplexPreview').default} ComplexPreview
 * @typedef {import('../modeling/ElementFactory').default} ElementFactory
 *
 * @typedef {import('../../model/Types').Shape} Shape
 */

/**
 * A preview for attaching.
 *
 * @param {ComplexPreview} complexPreview
 * @param {ElementFactory} elementFactory
 * @param {EventBus} eventBus
 */
export default function AppendPreview(complexPreview, elementFactory) {
  this._complexPreview = complexPreview;
  this._elementFactory = elementFactory;
}

/**
 * Create a preview of appending a shape of the given type to the given source.
 *
 * @param {Shape} source
 * @param {string} type
 * @param {Partial<Shape>} options
 */
AppendPreview.prototype.create = function(source, type, options = {}) {
  const complexPreview = this._complexPreview,
        elementFactory = this._elementFactory;

  const shape = elementFactory.createShape({ type, ...options });

  const position = {
    x: source.x + source.width / 2,
    y: source.y + source.height
  };

  shape.x = position.x - shape.width / 2;
  shape.y = position.y - shape.height / 2;

  complexPreview.create({
    created: [
      shape
    ]
  });
};

AppendPreview.prototype.cleanUp = function() {
  this._complexPreview.cleanUp();
};

AppendPreview.$inject = [
  'complexPreview',
  'elementFactory'
];