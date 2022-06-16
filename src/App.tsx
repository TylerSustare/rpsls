import React from "react";
import { tap } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";
import { useClipboard } from "./useClipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "wired-elements";
import "./App.css";

const CLOSE_TIME = 3000;

const wsURL = "wss://cbwfvjy7j8.execute-api.us-west-2.amazonaws.com/Prod";
const wsConfig = {
  url: wsURL,
  openObserver: {
    next: () => {
      console.log("connected");
      const gameId = window.location.pathname?.slice(1);
      console.log("gameId", gameId);
      if (!gameId) {
        return ws.next({
          action: "new",
          userId: "abc123",
        });
      }
      console.log("attempting to connect to " + gameId);
      ws.next({
        action: "join",
        userId: "abc123",
        gameId: gameId,
      });
    },
  },
  closingObserver: {
    next: () => {
      // if (event.wasClean)
      console.log("closingObserver");
      ws.complete();
    },
  },
};
interface Message {
  action: string;
  userId: string;
  gameId?: string;
}
const ws = webSocket<Message>(wsConfig);

function App() {
  const [message, setMessage] = React.useState({} as Message);
  const [gameId, setGameId] = React.useState("");
  const [isCopied, copy] = useClipboard({ successDuration: CLOSE_TIME });
  ws.pipe(
    tap((data) => {
      console.log(data);
      setMessage(data);
    })
  ).subscribe();

  // check for gameId from path
  if (!gameId) {
    const path = window.location.pathname?.slice(1);
    if (path) setGameId(path);
  }

  // push gameId to path if not already there
  if (!gameId && message.gameId) {
    window.history.pushState(null, "", `/${message.gameId}`);
  }

  function copyToClipboard() {
    copy(window.location.href);
    toast("Copied to clipboard", { autoClose: CLOSE_TIME });
  }

  return (
    <>
      <ToastContainer bodyStyle={{ fontFamily: "Indie Flower" }} />
      <div className="App">
        <wired-card elevation="3">
          <p>Game ID: {message.gameId}</p>
          <wired-button onClick={copyToClipboard}>Copy Game Link</wired-button>
          <p>1 person is here, send the link to a friend!</p>
        </wired-card>
      </div>
    </>
  );
}

export default App;
