import { CookiesProvider } from "react-cookie";
import "./App.css";
import { NavigationProvider } from "./providers";
import { SnackbarProvider } from "notistack";
import { useAllowScrollController } from "./hooks";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";

enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

const HomePage = () => {
  const [path, setPath] = useState("");
  const [method, setMethod] = useState<Methods>(Methods.GET);
  const [body, setBody] = useState("");

  const [response, setResponse] = useState("");

  const onSubmit = () => {
    setResponse("");

    const defaultHeaders = {
      Accept: "application/json",
      "Content-Type": "application/json",
    } as Record<string, string>;
    let bodyToSend: BodyInit | null = null;

    (async () => {
      try {
        if (body.length > 0) {
          bodyToSend = body;
        }

        const response = await fetch(
          `https://5zym5fv92l.execute-api.us-east-1.amazonaws.com/DEV/forward//path`,
          {
            method,
            body: bodyToSend,
            headers: defaultHeaders,
          },
        );
        const json = await response.json();

        console.log(`${method} Fetch Request To ${path}:`);
        console.log(response);
        console.log(json);
        console.log("");

        setResponse(
          `Response ${response.status}:\n` + JSON.stringify(json, null, 2),
        );
      } catch (err: unknown) {
        console.log(`On Submit Error:`);
        if (!(err instanceof Error)) return;
        console.log(err);
        console.log(err.message);
        console.log(``);
      }
    })();
  };

  return (
    <Stack
      direction={"row"}
      spacing={response.length > 0 ? 2 : 0}
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Stack spacing={4} sx={{}}>
        <Stack spacing={2} direction={"row"} alignItems={"center"}>
          <Typography variant="body1">http://ec2...</Typography>
          <TextField
            variant="outlined"
            label="Path"
            name="path"
            placeholder="/example"
            value={path}
            onChange={({ target: { value } }) => setPath(value)}
          />
        </Stack>

        <FormControl>
          <InputLabel id="method">Method</InputLabel>
          <Select
            labelId="method"
            value={method}
            onChange={({ target: { value } }) => setMethod(value as Methods)}
          >
            {Object.keys(Methods).map((meth) => (
              <MenuItem key={meth} value={meth}>
                {meth}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          multiline
          variant="outlined"
          label="Path"
          name="path"
          placeholder="/example"
          value={body}
          onChange={({ target: { value } }) => setBody(value)}
        />

        <Button variant="contained" color="primary" onClick={onSubmit}>
          Fetch
        </Button>
      </Stack>

      {response.length > 0 && (
        <Stack padding={2} sx={{ maxWidth: "45%", border: "1px grey solid" }}>
          <Typography variant="body2">{response}</Typography>
        </Stack>
      )}
    </Stack>
  );
};

function App() {
  useAllowScrollController();
  return (
    <CookiesProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        autoHideDuration={4000}
      >
        <NavigationProvider />
      </SnackbarProvider>
    </CookiesProvider>
  );
}

export default HomePage;
