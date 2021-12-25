const { createNamespace } = require('cls-hooked');

function Context(opts = {}) {
  this.namespaceString = opts.namespace || 'gatekeeper-context';
  this._namespace = createNamespace(this.namespaceString);
}

Context.prototype.getContextId = function () {
  return this._namespace.get('gatekeeperId');
};

Context.prototype.overWriteGatekeeperId = function (id) {
  this._namespace.set('gatekeeperId', id);
};

Context.prototype.getClsHookSessionMiddleware = function () {
  const self = this;
  return (req, res, next) => {
    self._namespace.bindEmitter(req);
    self._namespace.bindEmitter(res);
    self._namespace.run(() => {
      self._namespace.set('gatekeeperId', 'random');
      return next();
    });
  };
};

module.exports = Context;
