import "./styles.css";
import "98.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  SyntheticEvent,
} from "react";
import { kanji } from "./KanjiData";

type KanjiEntry = (typeof kanji)[number];

function generateDictionary() {
  const dictionary: Record<string, KanjiEntry> = {};
  for (const k of kanji) {
    dictionary[k.kanji] = k;
  }
  return dictionary;
}

const kanjiDictionary = generateDictionary();

function randomKanji() {
  const keys = Object.keys(kanjiDictionary);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return kanjiDictionary[randomKey];
}

function findKanji(query: string) {
  if (kanjiDictionary[query]) {
    return kanjiDictionary[query];
  }
  for (const entry of Object.values(kanjiDictionary)) {
    for (const meaning of entry.meanings) {
      if (meaning.startsWith(query.toLowerCase())) {
        return entry;
      }
    }
    if (entry.hiragana === query) {
      return entry;
    }
    if (entry.romanji === query) {
      return entry;
    }
  }
  return undefined;
}

export default function App() {
  const [current, setCurrent] = useState<KanjiEntry>(randomKanji());
  const [history, setHistory] = useState<KanjiEntry[]>([]);

  const [searchValue, setSearchValue] = useState("");
  const handleSearchChange = (e: any) => {
    setSearchValue(e.target.value);
  };

  const searchKanji = useCallback(
    (e: SyntheticEvent) => {
      const found = findKanji(searchValue);
      if (found) {
        setCurrent(found);
      }
    },
    [searchValue]
  );

  const currentPosition = useMemo(
    () => Object.keys(kanjiDictionary).indexOf(current.kanji),
    [current]
  );

  const displayRandomKanji = useCallback(() => {
    setCurrent(randomKanji());
  }, []);
  const previousKanji = useCallback(() => {
    const key = Object.keys(kanjiDictionary)[currentPosition - 1];
    setCurrent(kanjiDictionary[key]);
  }, [currentPosition]);
  const nextKanji = useCallback(() => {
    const key = Object.keys(kanjiDictionary)[currentPosition + 1];
    setCurrent(kanjiDictionary[key]);
  }, [currentPosition]);

  return (
    <div className="App window">
      <div className="title-bar">
        <div className="title-bar-text">
          {current.hiragana} | {current.romanji}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>
      <div className="content window-body" id="content-display">
        <div className="kanji" id="kanji-display">
          <div>{current.kanji}</div>
        </div>
        <div className="caption field-row" id="caption-display">
          <span>
            <b>Meanings</b>: <i>{current.meanings.join(", ")}</i> |{" "}
          </span>
          <span>
            <b>Hiragana:</b> <i>{current.hiragana}</i> |{" "}
          </span>
          <span>
            <b>Romanji:</b> <i>{current.romanji}</i>
          </span>
        </div>
      </div>

      <div className="search-container field-row">
        <input
          type="text"
          id="search-box"
          className="search-box"
          placeholder="Search Kanji"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <button className="kanji-button" onClick={searchKanji}>
          Search
        </button>
        <button className="kanji-button" onClick={displayRandomKanji}>
          Random
        </button>
      </div>
      <div className="search-container field-row">
        <button className="kanji-button" onClick={previousKanji}>
          &#9664;
        </button>
        <button className="kanji-button" onClick={nextKanji}>
          &#9654;
        </button>
      </div>

      <div className="history" id="history-display">
        {history.join("")}
      </div>
    </div>
  );
}
