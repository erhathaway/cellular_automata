function ErrorCreatingCoordinateExtractor(message) {
  this.name = 'ErrorCreatingCoordinateExtractor';
  this.message = (message || '');
}

function UndefinedRequiredClassAttribute(message) {
  this.name = 'UndefinedRequiredClassAttribute';
  this.message = (message || '');
}

export {
  ErrorCreatingCoordinateExtractor,
  UndefinedRequiredClassAttribute,
};
