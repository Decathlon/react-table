require("isomorphic-fetch");
Object.assign = require("lodash").assign;
const Enzyme = require("enzyme");
const Adapter = require("@wojtekmaj/enzyme-adapter-react-17");

const CommonUtils = require("../src/components/utils/table");

Enzyme.configure({ adapter: new Adapter() });

window.ga = function () {};

CommonUtils.getScrollbarSize = jest.fn(() => 0);
