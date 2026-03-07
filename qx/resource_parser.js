// `Resource Parser` script of QuantumultX. See
// [Example](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js).
//
// Purposes:
// 1. Support domain-list style ruleset by `?type=dlc` param.
// 2. Support forward proxy by `?add_via=true` param.
//
// Limitations:
// * Doesn't support regex rules of domain-list.

// Home-made URL parser. They don't support URL APIs.
const parse_url = (s) => {

  const searchParams = (s) => s.split("?")[1].split("&");
  const getKey = (kv) => kv ? kv.split("=")[0] : undefined;
  const getVal = (kv) => kv ? kv.split("=")[1] : undefined;

  return {
    searchParams: {
      get: (key) => {
        return getVal(searchParams(s)
          .find(kv => getKey(kv) === key));
      }
    }
  }
}

const filter = (line) => {
  line = line.trim();
  return line.length > 0 && !line.startsWith("#");
}

const identity = (line) => line

const Rule = {
  full: (text) => ({ type: "full", text }),
  suffix: (text) => ({ type: "suffix", text }),
}

const from_dlc_rule = (line) => {
  const [rule, prefix] = line.split(":").reverse();
  switch (prefix) {
    case "full":
      return Rule.full(rule);
    case "regexp":
      $done({ error: line})
    default:
      return Rule.suffix(rule);
  }
}

const to_qx_rule = (rule) => {
  switch (rule.type) {
    case "full":
      return `host,${rule.text},proxy`;
    case "suffix":
      return `host-suffix,${rule.text},proxy`;
  }
}

const add_via = (line) => {
  return line + ",via-interface=%TUN%";
}

const dispatch = (type) => {
  switch (type) {
    case "dlc":
      return (line) => to_qx_rule(from_dlc_rule(line));
    case "qx":
    case undefined:
      return identity;
    default:
      $done({ error: `Unsupported param: type=${type}.` });
  }
}

const content = $resource.content
  .split("\n")
  .filter(filter)
  .map(dispatch(
    parse_url($resource.link).searchParams.get("type")
  ))
  .map(
    parse_url($resource.link).searchParams.get("add_via") ?
      add_via : identity
  )
  .join("\n");

$done({ content });
