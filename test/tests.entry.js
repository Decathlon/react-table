require("isomorphic-fetch");
Object.assign = require("lodash").assign;
const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

const CommonUtils = require("../src/components/utils/table");

Enzyme.configure({ adapter: new Adapter() });

window.ga = function() {};

CommonUtils.getScrollbarSize = jest.fn(() => 15);
