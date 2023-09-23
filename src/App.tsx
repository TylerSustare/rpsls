import React, { SyntheticEvent, useEffect } from 'react';
import { tap } from 'rxjs/operators';
import { webSocket, WebSocketSubjectConfig } from 'rxjs/webSocket';
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
import { PlayImage } from './PlayImage';
import Confetti from 'react-confetti';

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
const wsConfig: WebSocketSubjectConfig<Message> = {
  url: wsURL,
  openObserver: {
    next: () => {
      // console.log('connected');
      const gameId = window.location.pathname?.slice(1);
      // console.log('gameId', gameId);
      if (!gameId) {
        return ws.next({
          action: 'new',
          userId: getUserId(),
        });
      }
      // console.log('attempting to connect to ' + gameId);
      ws.next({
        action: 'join',
        userId: getUserId(),
        gameId: gameId,
      });
    },
  },
  closeObserver: {
    next: (event) => {
      if (event.wasClean) ws.complete();
      // else ws.subscribe();
    },
  },
};

const ws = webSocket<Message>(wsConfig);

function App() {
  const [message, setMessage] = React.useState({} as Message);
  const [gameId, setGameId] = React.useState('');
  const [yourPlay, setYourPlay] = React.useState(null as Play | null);
  const [yourScore, setYourScore] = React.useState(0);
  const [theirPlay, setTheirPlay] = React.useState(null as Play | null);
  const [roundSummary, setRoundSummary] = React.useState('');
  const [lockPlay, setLockPlay] = React.useState(false);
  const [youWon, setYouWon] = React.useState(null as boolean | null);

  const { copy } = useClipboard({ successDuration: CLOSE_TIME });

  useEffect(() => {
    message.roundSummary && setRoundSummary(message.roundSummary);
    message.theirPlay && setTheirPlay(message.theirPlay);
    // run effects when message changes, not several `useEffect` on each message.<property>
    // when running just on property changes, we can miss updates to the
    // greater state of the game, because certain parts of the message haven't changed.
    // A tie game can happen for "rock vs rock" and "paper vs paper" etc.
    // If we only run these on message.<property> each effect won't run always. Leading to
    // an update to the game that is not reflected in the UI - a null roundSummary, for example.

    // we could also just do this in the `tap` function in the `ws.pipe` function instead of setting message
    // we probably should since `tap` is designed to be a place for side effects https://rxjs.dev/api/operators/tap
    if (message.yourScore === yourScore + 1) {
      setYouWon(true);
    }
    setYourScore(message.yourScore ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  ws.pipe(
    tap((data) => {
      // console.log(data);
      setMessage(data);
      setLockPlay(false);
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
    if (lockPlay) {
      return;
    }
    setYourPlay(yourPlay);
    setTheirPlay(null);
    setRoundSummary('');
    setYouWon(false);
    ws.next({
      action: 'play',
      gameId: message.gameId,
      round: message.round,
      userId: getUserId(),
      play: yourPlay,
    });
    setLockPlay(true);
  }

  return (
    <>
      {youWon && (
        <Confetti gravity={0.5} numberOfPieces={200} recycle={false} />
      )}
      <ToastContainer bodyStyle={{ fontFamily: 'Indie Flower' }} />
      <div className="App">
        <wired-card className="game" elevation="3">
          <div className="row">
            <div className="column">
              <div className="your-stuff">
                <ul className="no-bullets">
                  <li>Your Score: {yourScore}</li>
                  <li>{yourPlay}</li>
                  <PlayImage
                    className="your-play-img"
                    play={yourPlay ?? 'loading'}
                  />
                </ul>
              </div>
            </div>
            <div className="column">
              <div className="their-stuff">
                <ul className="no-bullets">
                  <li>Their Score: {message.theirScore}</li>
                  <li>{theirPlay}</li>
                  <PlayImage play={theirPlay ?? 'loading'} />
                </ul>
              </div>
            </div>
          </div>
          <p>
            {yourScore === 0 && message.theirScore === 0
              ? 'Successfully Joined! Copy the Game link and send it to a friend!'
              : roundSummary}
          </p>
          <wired-button onClick={copyToClipboard}>Copy Game Link</wired-button>
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
