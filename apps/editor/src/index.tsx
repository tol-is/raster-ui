import * as React from "react"
import * as ReactDOM from "react-dom"
import { App } from "./App"
import "@raster-ui/reset"

import { css, injectGlobal } from "@emotion/css"

injectGlobal`
    a {
        color: inherit;
        text-decoration:none;
    }
`

ReactDOM.render(<App />, document.getElementById("root"))
