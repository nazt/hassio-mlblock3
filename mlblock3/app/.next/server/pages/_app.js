(() => {
var exports = {};
exports.id = 888;
exports.ids = [888];
exports.modules = {

/***/ 9899:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _app)
});

;// CONCATENATED MODULE: external "@ethersproject/providers"
const providers_namespaceObject = require("@ethersproject/providers");
// EXTERNAL MODULE: external "@web3-react/core"
var core_ = __webpack_require__(417);
// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(5282);
;// CONCATENATED MODULE: ./components/Footer.tsx

function Footer() {
  return /*#__PURE__*/jsx_runtime_.jsx("footer", {
    className: "container max-w-screen-xl py-8 mx-auto",
    children: /*#__PURE__*/jsx_runtime_.jsx("div", {
      className: "",
      children: /*#__PURE__*/jsx_runtime_.jsx("div", {
        children: /*#__PURE__*/jsx_runtime_.jsx("p", {
          children: "Footer"
        })
      })
    })
  });
}
;// CONCATENATED MODULE: external "next/router"
const router_namespaceObject = require("next/router");
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(9297);
// EXTERNAL MODULE: external "recoil"
var external_recoil_ = __webpack_require__(8121);
// EXTERNAL MODULE: ./states/index.ts
var states = __webpack_require__(3911);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1664);
;// CONCATENATED MODULE: ./components/Navigation.tsx


 // import { showMenuState } from 'states'



function Sidebar() {
  const router = (0,router_namespaceObject.useRouter)(); //   const { t } = useTranslation()
  // const [showMenu, setShowMenu] = useRecoilState(showMenuState)

  const {
    0: showMenu,
    1: setShowMenu
  } = (0,external_react_.useState)(true);
  (0,external_react_.useEffect)(() => {
    var _document;

    const ul = (_document = document) === null || _document === void 0 ? void 0 : _document.getElementById('ul-sidebar-nav');
    if (!ul) return;
    const activeColor = 'text-green-500 dark:text-green-500';
    const regex = new RegExp(activeColor, 'g');
    const path = router.asPath.slice(1);

    for (const child of ul.children) {
      if (child.children.length === 0) continue;

      try {
        const menu = child.children[0];

        if (menu.toString().indexOf(path.split('/')[0]) > 0) {
          menu.className = `${menu.className} ${activeColor}`.trim();
        } else {
          const classes = menu.className.replace(regex, '').trim();
          if (classes === '') menu.removeAttribute('class');else menu.className = classes;
        }
      } catch (e) {}
    }
  }, [router.asPath]);

  function closeMenu() {
    console.log('closeMenu');
  }

  return /*#__PURE__*/jsx_runtime_.jsx("nav", {
    children: /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
      id: "nav-section",
      className: `${!showMenu ? 'hidden' : ''} lg:block fixed lg:sticky top-0 lg:top-4 left-0 w-screen lg:w-auto h-screen lg:h-auto p-4 lg:p-0 z-50 bg-white dark:bg-black lg:dark:bg-transparent`,
      children: [/*#__PURE__*/jsx_runtime_.jsx("div", {
        className: "flex items-center justify-between"
      }), /*#__PURE__*/(0,jsx_runtime_.jsxs)("ul", {
        id: "ul-sidebar-nav",
        className: "pt-10 list-none lg:space-x-8 lg:flex lg:pt-0",
        children: [/*#__PURE__*/jsx_runtime_.jsx("li", {
          className: "py-4 text-2xl font-bold lg:py-0 lg:text-base lg:font-normal",
          children: /*#__PURE__*/jsx_runtime_.jsx(next_link.default, {
            href: "/",
            children: /*#__PURE__*/jsx_runtime_.jsx("a", {
              className: "text-gray-600 hover:text-green-500 dark:text-white dark:hover:text-lime-400",
              onClick: closeMenu,
              children: 'Home'
            })
          })
        }), /*#__PURE__*/jsx_runtime_.jsx("li", {
          className: "py-4 text-2xl font-bold lg:py-0 lg:text-base lg:font-normal",
          children: /*#__PURE__*/jsx_runtime_.jsx(next_link.default, {
            href: "mlblock",
            children: /*#__PURE__*/jsx_runtime_.jsx("a", {
              className: "text-gray-600 hover:text-green-500 dark:text-white dark:hover:text-lime-400",
              onClick: closeMenu,
              children: 'MLBLock'
            })
          })
        }), /*#__PURE__*/jsx_runtime_.jsx("li", {
          className: "py-4 text-2xl font-bold lg:py-0 lg:text-base lg:font-normal",
          children: /*#__PURE__*/jsx_runtime_.jsx(next_link.default, {
            href: "/about",
            children: /*#__PURE__*/jsx_runtime_.jsx("a", {
              className: "text-gray-600 hover:text-green-500 dark:text-white dark:hover:text-lime-400",
              onClick: closeMenu,
              children: /*#__PURE__*/jsx_runtime_.jsx("div", {
                children: "About"
              })
            })
          })
        })]
      })]
    })
  });
}
;// CONCATENATED MODULE: external "@binance-chain/bsc-connector"
const bsc_connector_namespaceObject = require("@binance-chain/bsc-connector");
// EXTERNAL MODULE: external "@web3-react/injected-connector"
var injected_connector_ = __webpack_require__(7290);
;// CONCATENATED MODULE: external "@web3-react/walletconnect-connector"
const walletconnect_connector_namespaceObject = require("@web3-react/walletconnect-connector");
;// CONCATENATED MODULE: external "@web3-react/walletlink-connector"
const walletlink_connector_namespaceObject = require("@web3-react/walletlink-connector");
// EXTERNAL MODULE: ./consts/network/index.ts + 1 modules
var network = __webpack_require__(8382);
;// CONCATENATED MODULE: ./helpers/walletConnectors.ts





const injectedConnector = new injected_connector_.InjectedConnector({
  supportedChainIds: [network/* ChainId.BSC_MAINNET */.a_.BSC_MAINNET]
});
const bscConnector = new bsc_connector_namespaceObject.BscConnector({
  supportedChainIds: [network/* ChainId.BSC_MAINNET */.a_.BSC_MAINNET]
});
const walletConnectConnector = (chainId, rpcUrl) => new WalletConnectConnector({
  rpc: {
    [chainId]: rpcUrl
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
});
const walletLinkConnector = url => new WalletLinkConnector({
  url,
  appName: 'Dopple',
  appLogoUrl: '/images/logos/logo-with-text.svg'
});
;// CONCATENATED MODULE: external "react-device-detect"
const external_react_device_detect_namespaceObject = require("react-device-detect");
;// CONCATENATED MODULE: ./hooks/useEagerConnect.ts




function useEagerConnect() {
  const {
    activate,
    active
  } = (0,core_.useWeb3React)();
  const {
    0: tried,
    1: setTried
  } = (0,external_react_.useState)(false);
  (0,external_react_.useEffect)(() => {
    injectedConnector.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injectedConnector, undefined, true).catch(() => setTried(true));
      } else {
        if (external_react_device_detect_namespaceObject.isMobile && window.ethereum) {
          activate(injectedConnector, undefined, true).catch(() => setTried(true));
        } else {
          setTried(true);
        }
      }
    });
  }, [activate]);
  (0,external_react_.useEffect)(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);
  return tried;
}
;// CONCATENATED MODULE: ./components/Header/WalletConnector/index.tsx





function WalletConnector() {
  const {
    account,
    chainId
  } = (0,external_recoil_.useRecoilValue)(states/* web3ReactState */.S); // const [isShowNetworkSelectorModal, showNetworkSelectorModal] = useRecoilState(networkModalState)
  // const [isShowWalletSelectorModal, showWalletSelectorModal] = useRecoilState(walletModalState)

  useEagerConnect();
  return /*#__PURE__*/jsx_runtime_.jsx(jsx_runtime_.Fragment, {
    children: account && chainId ? /*#__PURE__*/jsx_runtime_.jsx("div", {
      className: "flex space-x-2",
      children: "Hello found Account"
    }) :
    /*#__PURE__*/
    // <ButtonOutline text="Connect Wallet" onClick={() => showWalletSelectorModal(true)} />
    jsx_runtime_.jsx("div", {
      children: "Connect Wallet"
    })
  });
}
;// CONCATENATED MODULE: ./components/Header/index.tsx








function Header() {
  const {
    asPath
  } = (0,router_namespaceObject.useRouter)();
  const {
    chainId,
    account
  } = (0,external_recoil_.useRecoilValue)(states/* web3ReactState */.S);
  (0,external_react_.useEffect)(() => {// window.Nat = { web3: getWeb3NoAccount(chainId) }
    // window.MyNamespace = window.MyNamespace || {};
  }, [chainId]);
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)("header", {
    className: "container flex justify-end max-w-screen-xl pt-4 pb-4 mx-auto mb-28 lg:mb-0 lg:pt-10 lg:pb-8",
    children: [/*#__PURE__*/jsx_runtime_.jsx(Sidebar, {}), /*#__PURE__*/(0,jsx_runtime_.jsxs)("div", {
      className: "btn-connect-wallet",
      children: [chainId, " ", account, /*#__PURE__*/jsx_runtime_.jsx(WalletConnector, {})]
    })]
  });
}
;// CONCATENATED MODULE: ./components/Main.tsx
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




function Main({
  component: Component,
  pageProps
}) {
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)("main", {
    className: "container max-w-screen-xl grid-cols-12 mx-auto mb-12 text-black lg:grid dark:text-white",
    children: ["Main...", (pageProps === null || pageProps === void 0 ? void 0 : pageProps.column) === 1 ? /*#__PURE__*/jsx_runtime_.jsx("div", {
      className: "col-span-12",
      children: /*#__PURE__*/jsx_runtime_.jsx(Component, _objectSpread({}, pageProps))
    }) : /*#__PURE__*/jsx_runtime_.jsx(jsx_runtime_.Fragment, {
      children: /*#__PURE__*/jsx_runtime_.jsx("div", {
        className: "col-span-12",
        children: /*#__PURE__*/jsx_runtime_.jsx(Component, _objectSpread({}, pageProps))
      })
    })]
  });
}
// EXTERNAL MODULE: external "next/head"
var head_ = __webpack_require__(701);
var head_default = /*#__PURE__*/__webpack_require__.n(head_);
;// CONCATENATED MODULE: ./components/Root.tsx




function Root({
  children
}) {
  return /*#__PURE__*/(0,jsx_runtime_.jsxs)(jsx_runtime_.Fragment, {
    children: [/*#__PURE__*/jsx_runtime_.jsx((head_default()), {
      children: /*#__PURE__*/jsx_runtime_.jsx("title", {
        children: "Hello MLBLock3"
      })
    }), /*#__PURE__*/jsx_runtime_.jsx("div", {
      className: "h-screen px-4 sm:px-10",
      children: children
    })]
  });
}
;// CONCATENATED MODULE: ./components/Web3ReactManager.tsx







const Web3ReactManager = ({
  children
}) => {
  const {
    account,
    chainId
  } = (0,core_.useWeb3React)();
  const setWeb3ReactState = (0,external_recoil_.useSetRecoilState)(states/* web3ReactState */.S);
  (0,external_react_.useEffect)(() => {
    if (account && chainId) {
      setWeb3ReactState({
        account,
        chainId
      });
    }

    console.log(account, chainId);
  }, [account, chainId, setWeb3ReactState]);
  return /*#__PURE__*/jsx_runtime_.jsx(jsx_runtime_.Fragment, {
    children: children
  });
};

/* harmony default export */ const components_Web3ReactManager = (Web3ReactManager);
;// CONCATENATED MODULE: ./pages/_app.tsx












function MLBlock3App({
  Component,
  pageProps
}) {
  function getLibrary(provider) {
    const library = new providers_namespaceObject.Web3Provider(provider, 'any');
    library.pollingInterval = 15000;
    return library;
  }

  return /*#__PURE__*/jsx_runtime_.jsx(external_recoil_.RecoilRoot, {
    children: /*#__PURE__*/jsx_runtime_.jsx(core_.Web3ReactProvider, {
      getLibrary: getLibrary,
      children: /*#__PURE__*/jsx_runtime_.jsx(components_Web3ReactManager, {
        children: /*#__PURE__*/(0,jsx_runtime_.jsxs)(Root, {
          children: [/*#__PURE__*/jsx_runtime_.jsx(Header, {}), /*#__PURE__*/jsx_runtime_.jsx(Main, {
            component: Component,
            pageProps: pageProps
          }), /*#__PURE__*/jsx_runtime_.jsx(Footer, {})]
        })
      })
    })
  });
}

/* harmony default export */ const _app = (MLBlock3App);

/***/ }),

/***/ 417:
/***/ ((module) => {

"use strict";
module.exports = require("@web3-react/core");

/***/ }),

/***/ 7290:
/***/ ((module) => {

"use strict";
module.exports = require("@web3-react/injected-connector");

/***/ }),

/***/ 9325:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/denormalize-page-path.js");

/***/ }),

/***/ 5378:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/i18n/normalize-locale-path.js");

/***/ }),

/***/ 7162:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/mitt.js");

/***/ }),

/***/ 8773:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router-context.js");

/***/ }),

/***/ 2248:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/get-asset-path-from-route.js");

/***/ }),

/***/ 9372:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/is-dynamic.js");

/***/ }),

/***/ 665:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-relative-url.js");

/***/ }),

/***/ 2747:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/querystring.js");

/***/ }),

/***/ 333:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-matcher.js");

/***/ }),

/***/ 3456:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-regex.js");

/***/ }),

/***/ 7620:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/utils.js");

/***/ }),

/***/ 701:
/***/ ((module) => {

"use strict";
module.exports = require("next/head");

/***/ }),

/***/ 9297:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 5282:
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ 8121:
/***/ ((module) => {

"use strict";
module.exports = require("recoil");

/***/ }),

/***/ 7831:
/***/ ((module) => {

"use strict";
module.exports = require("recoil-persist");

/***/ }),

/***/ 2431:
/***/ (() => {

/* (ignored) */

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [664,911], () => (__webpack_exec__(9899)));
module.exports = __webpack_exports__;

})();