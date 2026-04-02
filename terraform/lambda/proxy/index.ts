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
    body: `${JSON.stringify({ success: true })}`,
  };

  const method = event.httpMethod;
  const forwardPath =
    (event.pathParameters?.forwardPath as string | undefined) || "";
  const bodyJson = event.body;

  try {
    const url = `${process.env.API_URL}/${forwardPath.split("_").join("/")}`;

    // console.log(`Request To:`);
    // console.log(url);
    // console.log(`Method:`);
    // console.log(method);
    // console.log(`Body:`);
    // console.log(bodyJson);
    // console.log(``);

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

    if (apiResponse.status === 204) return response;

    const json = await apiResponse.json();
    // console.log(`Response Json:`);
    // console.log(json);
    // console.log(``);

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
