export class ErrorCreatingCoordinateExtractor extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'ErrorCreatingCoordinateExtractor';
  }
}

export class UndefinedRequiredClassAttribute extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'UndefinedRequiredClassAttribute';
  }
}

export class UndefinedRequiredParameter extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'UndefinedRequiredParameter';
  }
}
