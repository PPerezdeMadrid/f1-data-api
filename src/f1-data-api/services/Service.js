const js2xmlparser = require("js2xmlparser");
class Service {
  static rejectResponse(error, code = 500) {
    return { error, code };
  }

  static successResponse(payload, code = 200) {
    return { payload, code };
  }

  static successResponseXML(payload, rootElement = "response", code = 200) {
    const xml = js2xmlparser.parse(rootElement, payload);
    return {
      headers: { "Content-Type": "application/xml" },
      body: xml,
      code,
    };
  }
}

module.exports = Service;
