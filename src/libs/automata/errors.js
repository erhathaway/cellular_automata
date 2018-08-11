function ErrorCreatingCoordinateExtractor(message) {
  this.name = 'ErrorCreatingCoordinateExtractor';
  this.message = (message || '');
}

function UndefinedRequiredClassAttribute(message) {
  this.name = 'UndefinedRequiredClassAttribute';
  this.message = (message || '');
}

function UndefinedRequiredParameter(message) {
  this.name = 'UndefinedRequiredParameter';
  this.message = (message || '');
}

export {
  ErrorCreatingCoordinateExtractor,
  UndefinedRequiredClassAttribute,
  UndefinedRequiredParameter,
};
