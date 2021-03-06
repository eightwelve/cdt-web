function sanitizeUri(endpoint) {
  return endpoint.charAt(0) !== "/" ? "/" + endpoint : endpoint;
}

/**
 * Note that the promise won't be rejected in case of HTTP 4xx or 5xx server responses.
 * The promise will be resolved just as it would be for HTTP 2xx.
 * Inspect the response.status number within the resolved callback to add conditional handling of server errors to your code.
 */
export default function callApi({
  uri,
  method = "GET",
  body = undefined,
  headers
}) {
  let endpoint = process.env.REACT_APP_API_ENDPOINT + sanitizeUri(uri);
  console.log("calling endpoint: ", endpoint);

  return fetch(endpoint, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    credentials: "include",
    body: JSON.stringify(body)
  })
    .then(response => {
      console.log("Parsing json");
      return parseJson(response).then(json => ({
        json,
        response
      }));
    })
    .then(({ json, response }) => {
      console.log("Checking if !response.ok");
      if (!response.ok) {
        // cookie is expired, reload UserContextProvider
        // if (response.status === status.FORBIDDEN) { // recursion
        //   window.location.reload();
        // }
        console.log("error:" + JSON.stringify(json));
        return Promise.reject(json);
      }
      // console.log('response status: ', response.status);
      // if (response.status > 400) {
      //   console.log('error:' + JSON.stringify(json));
      //   return Promise.reject(json);
      // }
      return json;
    });
}

/**
 * Response from the server can be CREATED, NO_CONTENT etc,
 * if response is successful and has empty response body,
 * it should handle it gracefully.
 * @param response after a request to server
 * @returns promise with empty or parsed json
 */
function parseJson(response) {
  // fails when the text is not parsed to json, jump to catch block of promise
  return response.text().then(text => (text ? JSON.parse(text) : {}));
}
