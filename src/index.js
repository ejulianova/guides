import Guides from "./components/Guides";
import "./Guides.scss";

// No manual window assignment needed - the UMD build (see webpack.config.js)
// attaches this to the global automatically when loaded via a plain <script>
// tag, and correctly no-ops that branch under require()/import instead.
export default Guides;
