import React, { SyntheticEvent, useEffect } from 'react';
import { tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { useClipboard } from './useClipboard';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandBackFist,
  faHand,
  faHandScissors,
  faHandLizard,
  faHandSpock,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import 'wired-elements';
import './App.css';
import { nanoid } from 'nanoid';

const CLOSE_TIME = 3000;

type Play = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock';

interface Message {
  action: string;
  userId: string;
  gameId?: string;
  round?: number;
  roundSummary?: string;
  play?: Play;
  yourScore?: number;
  yourPlay?: Play;
  theirScore?: number;
  theirPlay?: Play;
}

const playOptions: { text: string; icon: IconDefinition }[] = [
  {
    text: 'rock',
    icon: faHandBackFist,
  },
  {
    text: 'paper',
    icon: faHand,
  },
  {
    text: 'scissors',
    icon: faHandScissors,
  },
  {
    text: 'lizard',
    icon: faHandLizard,
  },
  {
    text: 'spock',
    icon: faHandSpock,
  },
];

function getUserId(): string {
  return localStorage.getItem('rpsls-user-id') || setLocalStorageUserId();
}

function setLocalStorageUserId(): string {
  const uid = nanoid();
  localStorage.setItem('rpsls-user-id', uid);
  return uid;
}

const wsURL = 'wss://cbwfvjy7j8.execute-api.us-west-2.amazonaws.com/Prod';
const wsConfig = {
  url: wsURL,
  openObserver: {
    next: () => {
      console.log('connected');
      const gameId = window.location.pathname?.slice(1);
      console.log('gameId', gameId);
      if (!gameId) {
        return ws.next({
          action: 'new',
          userId: getUserId(),
        });
      }
      console.log('attempting to connect to ' + gameId);
      ws.next({
        action: 'join',
        userId: getUserId(),
        gameId: gameId,
      });
    },
  },
  closingObserver: {
    next: () => {
      // if (event.wasClean)
      console.log('closingObserver');
      ws.complete();
    },
  },
};

const ws = webSocket<Message>(wsConfig);

function App() {
  const [message, setMessage] = React.useState({} as Message);
  const [gameId, setGameId] = React.useState('');
  const [yourPlay, setYourPlay] = React.useState(null as Play | null);
  const [theirPlay, setTheirPlay] = React.useState(null as Play | null);
  const [roundSummary, setRoundSummary] = React.useState(null as string | null);
  const { copy } = useClipboard({ successDuration: CLOSE_TIME });

  useEffect(() => {
    message.theirPlay && setTheirPlay(message.theirPlay);
  }, [message.theirPlay]);

  useEffect(() => {
    message.roundSummary && setRoundSummary(message.roundSummary);
  }, [message.roundSummary]);

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
    window.history.pushState(null, '', `/${message.gameId}`);
  }

  function copyToClipboard() {
    copy(window.location.href);
    toast('Copied to clipboard', { autoClose: CLOSE_TIME });
  }

  function sendPlay(event: SyntheticEvent) {
    const yourPlay = event.currentTarget.id as Play;
    setYourPlay(yourPlay);
    setTheirPlay(null);
    setRoundSummary(null);
    ws.next({
      action: 'play',
      gameId: message.gameId,
      round: message.round,
      userId: getUserId(),
      play: yourPlay,
    });
  }

  return (
    <>
      <ToastContainer bodyStyle={{ fontFamily: 'Indie Flower' }} />
      <div className="App">
        <wired-card className="game" elevation="3">
          <wired-button onClick={copyToClipboard}>Copy Game Link</wired-button>
          <p>Round {message.round}</p>
          {/* wrap with 2 columns */}
          <div className="your-stuff">
            <p>Your score {message.yourScore}</p>
            <p>Your Play {yourPlay}</p>
          </div>
          <div>
            <p>Their score {message.theirScore}</p>
            <p>Their play {theirPlay}</p>
          </div>
          {/* wrap with 2 columns */}
          <p>{roundSummary}</p>
        </wired-card>
        <wired-card elevation="3">
          <div>
            {playOptions.map(({ text, icon }) => (
              <wired-button key={text} id={text} onClick={sendPlay}>
                {text} <FontAwesomeIcon icon={icon} />
              </wired-button>
            ))}
          </div>
        </wired-card>
      </div>
    </>
  );
}

export default App;
