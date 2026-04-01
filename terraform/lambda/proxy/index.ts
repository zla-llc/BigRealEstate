import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

const logProperty = (key: string, value: any) => {
  console.log(`${key}:`);
  console.log(
    typeof value === "object" ? JSON.stringify(value, null, 2) : value,
  );
  console.log("");
};

export const handler: Handler = async (event: APIGatewayProxyEvent, ctx) => {
  const response: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: `${JSON.stringify({ success: true })}`,
  };
  const bodyJson = event.body;
  logProperty(`Path`, event.path);
  logProperty(`Method`, event.httpMethod);
  logProperty(`Header`, event.headers);
  logProperty(`Body`, event.body);
  logProperty(`Parameters`, event.pathParameters);
  logProperty(`Query String Parameters`, event.queryStringParameters);

  logProperty(`ENV`, process.env.API_URL);

  return response;
};
