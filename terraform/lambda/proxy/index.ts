import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import { constants } from "buffer";

const _importDynamic = new Function("modulePath", "return import(modulePath)");

const fetch = async function (...args: any): Promise<Response> {
  const { default: fetch } = await _importDynamic("node-fetch");
  return fetch(...args);
};

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const response: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: ``,
  };

  const method = event.httpMethod;
  const forwardPath =
    (event.pathParameters?.forwardPath as string | undefined) || "";
  const bodyJson = event.body;
  const params = (event.queryStringParameters || {}) as {
    [key: string]: string;
  };
  const paramKeys = Object.keys(params);

  // console.log(`<-- Incoming: -->`);
  // console.log(event.path);
  // // console.log(event.pathParameters);
  // console.log(event.queryStringParameters);
  // console.log(`<-- End Incoming -->`);
  console.log(`<--- --- -->`);
  console.log(`Proxy: ${event.path}`);
  console.log(
    `Params: ${JSON.stringify(event.queryStringParameters, null, 2)}`,
  );

  try {
    const url = `${process.env.API_URL}/${forwardPath.split("__").join("/")}${paramKeys.length > 0 ? `?${paramKeys.map((key, i, arr) => `${key}=${params[key]}${arr.length - 1 > i ? "&" : ""}`).join("")}` : ""}`;

    console.log(`Forward to: ${url}`);
    console.log(`Method: ${method}`);

    const apiResponse = await fetch(url, {
      method,
      body: bodyJson,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    // console.log(`Response:`);
    // console.log(apiResponse);
    // console.log(``);

    if (apiResponse.status === 204) {
      console.log(`<--- --- -->`);
      return response;
    }

    const json = await apiResponse.json();
    // console.log(`Response Json:`);
    // console.log(json);
    // console.log(``);
    // console.log(`Forward Response: ${JSON.stringify(json, null, 2)}`);
    console.log(`<--- --- -->`);

    if (json && typeof json === "object") response.body = JSON.stringify(json);
    return response;
  } catch (err: unknown) {
    console.log(`Typescript Error:`);
    response.statusCode = 500;
    response.body = JSON.stringify({
      success: false,
      error: `Unkown error: ${err}`,
    });
    if (!(err instanceof Error)) return response;
    response.body = JSON.stringify({ success: false, error: err.message });
    console.log(err.message);
    console.log("");
  }

  return response;
};
