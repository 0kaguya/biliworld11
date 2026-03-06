// See [Example](https://raw.githubusercontent.com/crossutility/Quantumult-X/master/resource-parser.js).

const Rule = {
  domain: (text) => ({ type: "domain", text }),
  domainSuffix: (text) => ({ type: "domain-suffix", text }),

  from_domainlist_rule: (s) => {
    let [text, type] = s.trim().split(":").reverse();
    switch (type) {
      case "full":
        return Rule.domain(text);
      case "domain":
      case undefined:
        return Rule.domainSuffix(text);
      case "include":
      default:
        var msg = `\`${type}:...\` is not supported` + " " +
          `${type === "include" ? "" : "yet"}` + ".";
        throw new Error(msg);
    }
  },
  to_qx_rule: (rule) => {
    switch (rule.type) {
      case "domain":
        return `host,${rule.text},proxy`;
      case "domain-suffix":
        return `host-suffix,${rule.text},proxy`;
    }
  },
}

var content = String($resource.content)
var url = new URL($resource.link)

try {

  if (url.searchParams.get("format") === "v2ray") {
    let add_via = url.searchParams.get("add_via") !== null;

    const filterline = (line) => {
      var line = line.trim();
      return !(line.startsWith("#") || line === "");
    }
    const mapline = (line, add_via) => {
      return Rule.to_qx_rule(Rule.from_domainlist_rule(line)) +
        (add_via ? ",via-interface=%TUN%" : "")
    }

    var result = content.split("\n")
      .filter(line => filterline(line))
      .map(line => mapline(line, add_via))
      .join("\n")

    $done({ content: result })
  } else {
    // Unmodified
    $done({ content: content })
  }
} catch (e) {
  // Return error message as content because it's guraranteed to be
  // printed in dialog then.
  $done({ content: e.message })
}
