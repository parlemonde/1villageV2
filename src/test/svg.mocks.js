const React = require('react');

const SvgMock = (props) => React.createElement('svg', { 'data-testid': 'svg-mock', ...props });

module.exports = SvgMock;
module.exports.ReactComponent = SvgMock;
module.exports.__esModule = true;
module.exports.default = SvgMock;
