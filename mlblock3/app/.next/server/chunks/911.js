"use strict";
exports.id = 911;
exports.ids = [911];
exports.modules = {

/***/ 8382:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "a_": () => (/* binding */ ChainId)
});

// UNUSED EXPORTS: ENetwork, Network, NetworkInt

;// CONCATENATED MODULE: ./consts/network/bsc-mainnet.ts
const mainnet = {
  chainName: 'BSC',
  chainId: 56,
  chainIdHex: '0x38',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  // rpcUrls: ['https://bsc-dataseed1.defibit.io/'],
  rpcUrls: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.defibit.io/', 'https://bsc-dataseed1.ninicoin.io/'],
  blockExplorerUrls: ['https://bscscan.com/address/0x5162f992EDF7101637446ecCcD5943A9dcC63A8A#code'],
  blockExplorerName: 'BscScan',
  iconUrls: ['/images/icons/bsc-icon-no-text.svg'],
  multicallAddress: '0x41263cba59eb80dc200f3e2544eda4ed6a90e76c',
  routerAddress: '0xFE0C09c2b39973f338E67Ca803374878c4eAD912'
};
/* harmony default export */ const bsc_mainnet = (mainnet);
;// CONCATENATED MODULE: ./consts/network/index.ts
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


let ENetwork; // AddEthereumChainParameter

(function (ENetwork) {
  ENetwork["BSC_MAINNET"] = "BSC_MAINNET";
})(ENetwork || (ENetwork = {}));

const Network = {
  BSC_MAINNET: bsc_mainnet
};
const NetworkInt = Object.values(Network).map(n => ({
  [n.chainId]: _objectSpread({}, n)
})).reduce((a, v) => _objectSpread(_objectSpread({}, a), v));
let ChainId;

(function (ChainId) {
  ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
  ChainId[ChainId["ROPSTEN"] = 3] = "ROPSTEN";
  ChainId[ChainId["RINKEBY"] = 4] = "RINKEBY";
  ChainId[ChainId["G\xD6RLI"] = 5] = "G\xD6RLI";
  ChainId[ChainId["KOVAN"] = 42] = "KOVAN";
  ChainId[ChainId["BSC_MAINNET"] = Network.BSC_MAINNET.chainId] = "BSC_MAINNET";
})(ChainId || (ChainId = {}));

/***/ }),

/***/ 3911:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "S": () => (/* binding */ web3ReactState)
/* harmony export */ });
/* harmony import */ var consts_network__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8382);
/* harmony import */ var recoil__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8121);
/* harmony import */ var recoil__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(recoil__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var recoil_persist__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7831);
/* harmony import */ var recoil_persist__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(recoil_persist__WEBPACK_IMPORTED_MODULE_2__);



const {
  persistAtom
} = (0,recoil_persist__WEBPACK_IMPORTED_MODULE_2__.recoilPersist)();
const web3ReactState = (0,recoil__WEBPACK_IMPORTED_MODULE_1__.atom)({
  key: 'web3React',
  default: {
    chainId: consts_network__WEBPACK_IMPORTED_MODULE_0__/* .ChainId.BSC_MAINNET */ .a_.BSC_MAINNET,
    account: null
  }
});

/***/ })

};
;