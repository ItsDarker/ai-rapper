import { useEffect, useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  headVariants,
  slideIn,
  staggerContainer,
  textVariant,
} from "../utils/motion";

const Home = () => {
  const [userInput, setUserInput] = useState("");
  const [lyrics, setLyrics] = useState([]);
  const [currentLine, setCurrentLine] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [playing, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [volume, setVolume] = useState(0.3);

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);

    console.log("Calling OpenAI...");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text);

    // If the line has less than two words, remove it:
    const finalOutput = output.text
      .split("\n")
      .filter((line) => !line.includes("Verse"))
      .filter((line) => !line.includes("Chorus"))
      .filter((line) => !line.includes(":"))
      .filter((line) => line.split(" ").length > 2)
      .slice(0, 12)
      .join("\n");

    setIsGenerating(false);
    handleSpeak(finalOutput);
  };

  const handleSpeak = (text) => {
    console.log("handleSpeak", text);
    let lines = text.split("\n");
    setIsPlaying(true);
    audio.play();

    // Display each line as it's played
    lines.forEach((line) => {
      let msg = new SpeechSynthesisUtterance(line);
      msg.rate = 1.3;
      msg.onstart = () => {
        setCurrentLine(line);
        if (index === 0) {
          audio.volume = 0.2;
          audio.play();
        }
      };
      // Display current line
      msg.onstart = () => setCurrentLine(line);

      // When the last line is spoken, set the complete lyrics with line breaks
      if (line === lines[lines.length - 1]) {
        msg.onend = () => {
          setLyrics(text);
          setIsPlaying(false);
          setCurrentLine("");
          audio.pause();
        };
      }

      window.speechSynthesis.speak(msg);
    });
  };

  const stopPlaying = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    audio.pause();
  };

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);

  const onUserChangedText = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <div className="root">
      <Head>
        <title>GPT-Rapper</title>
      </Head>
      <div className="container">
        <motion.div
          variants={headVariants}
          initial="hidden"
          whileInView="show"
          className="header"
        >
          <div className="header-title">
            <h1>EMINEM RAPS FOR YOU</h1>
          </div>
          <div className="header-subtitle">
            <h2>What do you want Eminem to rap about?</h2>
          </div>
        </motion.div>
        <audio
          src={`/beat3.mp3`}
          onCanPlay={(e) => (e.target.volume = 0.2)}
          ref={(el) => {
            setAudio(el);
          }}
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
          className="prompt-container"
        >
          <motion.textarea
            variants={textVariant(1.1)}
            placeholder="start typing here"
            className="prompt-box"
            value={userInput}
            onChange={onUserChangedText}
          />
          <motion.p variants={textVariant(1.1)} className="vol">
            volume of style
          </motion.p>
          <motion.input
            variants={textVariant(1.1)}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />

          <motion.div
            variants={slideIn("right", "tween", 0.1, 0.7)}
            className="prompt-buttons"
          >
            <a
              className={
                isGenerating ? "generate-button loading" : "generate-button"
              }
              onClick={callGenerateEndpoint}
            >
              <div className="generate">
                {isGenerating ? <span className="loader"></span> : <p>RAP</p>}
              </div>
            </a>
          </motion.div>

          {/* Button that is visible if text-to-speech is playing that calls stop function */}
          {playing && (
            <div className="prompt-buttons">
              <a className="generate-button" onClick={stopPlaying}>
                <div className="generate">
                  <p>Stop</p>
                </div>
              </a>
            </div>
          )}

          <div className="output">
            <div className="output-header-container">
              <div className="output-header">
                <h3>{currentLine}</h3>
              </div>
              <div className="output-content">
                <motion.p variants={textVariant(1.1)}> {lyrics} </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-writer"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div> */}
    </div>
  );
};

export default Home;
